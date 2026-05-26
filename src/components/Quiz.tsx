/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, RefreshCw, Award, ArrowRight, Volume2, ShieldCheck, HelpCircle, Keyboard, Play, BookOpen, ChevronRight, HelpCircle as HintIcon, Layers } from 'lucide-react';
import { VocabularyWord } from '../types';
import { convertNumberedPinyin, checkDefinitionCorrect } from '../utils/pinyin';
import { getUniqueLessons, countWordsByLesson } from '../utils/lesson';

interface QuizProps {
  words: VocabularyWord[];
  onUpdateWordStatus: (id: string, isCorrect: boolean) => void;
}

type QuizMode = 'pinyin-typing' | 'meaning-typing' | 'multiple-choice';

interface QuestionItem {
  id: string;
  word: VocabularyWord;
  promptType: 'meaning' | 'pinyin' | 'character';
  targetType: 'pinyin' | 'meaning' | 'character';
  options?: string[]; // Used for multiple choice
  correctAnswer: string;
}

export default function Quiz({ words, onUpdateWordStatus }: QuizProps) {
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizMode, setQuizMode] = useState<QuizMode>('pinyin-typing');
  const [selectedLesson, setSelectedLesson] = useState<string>('all');
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  // Input tracking for typing sessions
  const [userTypedInput, setUserTypedInput] = useState('');

  // Selection tracking for multiple-choice sessions
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrectResult, setIsCorrectResult] = useState(false);
  const [score, setScore] = useState(0);
  const [shownHint, setShownHint] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState<VocabularyWord[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  // Reset quiz session when changing lesson selection
  useEffect(() => {
    setQuizStarted(false);
    setQuestions([]);
    setCurrentIdx(0);
    setUserTypedInput('');
    setSelectedOption(null);
    setIsSubmitted(false);
    setIsCorrectResult(false);
    setScore(0);
    setShownHint(false);
    setWrongAnswers([]);
  }, [selectedLesson]);

  // Play auditory success or failure chime using native Web Audio API
  const playFeedTone = (isCorrect: boolean) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (isCorrect) {
        osc.type = 'sine';
        // Double ascending note: C5 then E5
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else {
        osc.type = 'triangle';
        // Buzz down: A3 to A2
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (_) {
      // Browser audio context blocked or unsupported
    }
  };

  // Speak Chinese word aloud
  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  // Danh sách bài và số từ mỗi bài
  const lessons = getUniqueLessons(words);
  const lessonCounts = countWordsByLesson(words);

  // Lọc từ theo bài đã chọn
  const filteredByLesson = selectedLesson === 'all'
    ? words
    : words.filter(w => w.category === selectedLesson);

  // Generate a quiz of all questions according to chosen mode
  const generateQuiz = () => {
    if (filteredByLesson.length === 0) return;

    // Shuffle words filtered by lesson
    const shuffledWords = [...filteredByLesson].sort(() => Math.random() - 0.5);
    const selectedWords = shuffledWords;

    const generated: QuestionItem[] = selectedWords.map((word) => {
      let promptType: QuestionItem['promptType'] = 'meaning';
      let targetType: QuestionItem['targetType'] = 'pinyin';
      let correctAnswer = '';

      if (quizMode === 'pinyin-typing') {
        promptType = 'meaning';
        targetType = 'pinyin';
        correctAnswer = word.pinyin;
      } else if (quizMode === 'meaning-typing') {
        promptType = 'pinyin';
        targetType = 'meaning';
        correctAnswer = word.definition;
      } else {
        // Multiple choice: can be a mix
        const isPinyinTarget = Math.random() > 0.5;
        promptType = isPinyinTarget ? 'meaning' : 'pinyin';
        targetType = isPinyinTarget ? 'pinyin' : 'meaning';
        correctAnswer = isPinyinTarget ? word.pinyin : word.definition;
      }

      // Generate options for traditional multiple choice
      let options: string[] = [];
      if (quizMode === 'multiple-choice') {
        const distractors = words
          .filter(w => w.id !== word.id)
          .map(w => targetType === 'pinyin' ? w.pinyin : w.definition)
          .filter((val, index, self) => self.indexOf(val) === index && val !== correctAnswer)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);

        while (distractors.length < 3) {
          distractors.push(targetType === 'pinyin' ? 'N/A pinyin' : 'Đáp án khác');
        }

        options = [correctAnswer, ...distractors].sort(() => Math.random() - 0.5);
      }

      return {
        id: Math.random().toString(),
        word,
        promptType,
        targetType,
        options,
        correctAnswer
      };
    });

    setQuestions(generated);
    setCurrentIdx(0);
    setUserTypedInput('');
    setSelectedOption(null);
    setIsSubmitted(false);
    setIsCorrectResult(false);
    setScore(0);
    setShownHint(false);
    setWrongAnswers([]);
    setQuizStarted(true);
  };

  // Dynamic input pinyin conversions
  const handleTypedInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;

    if (quizMode === 'pinyin-typing') {
      // Automagically correct inline number tones to actual pinyin tone-marks!
      const converted = convertNumberedPinyin(rawVal);
      setUserTypedInput(converted);
    } else {
      setUserTypedInput(rawVal);
    }
  };

  // Quick insertion of pinyin vowel tone marks
  const handleInsertToneChar = (char: string) => {
    if (isSubmitted) return;
    setUserTypedInput(prev => prev + char);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSelectMultipleChoiceOpt = (option: string) => {
    if (isSubmitted) return;
    setSelectedOption(option);
  };

  // Submit Answer evaluation
  const handleSubmitAnswer = () => {
    if (isSubmitted) return;

    const activeQ = questions[currentIdx];
    let isCorrect = false;

    if (quizMode === 'pinyin-typing') {
      const cleanInput = userTypedInput.trim().toLowerCase().replace(/\s+/g, '');
      const cleanTarget = activeQ.correctAnswer.trim().toLowerCase().replace(/\s+/g, '');

      // Let's also evaluate if they typed raw numerical pinyin that matches (e.g. they typed "shi4" and target has "shì",
      // although we already auto-correct inline in input, just in case, we do a fallback comparison).
      const userConvtText = convertNumberedPinyin(userTypedInput).trim().toLowerCase().replace(/\s+/g, '');

      isCorrect = (cleanInput === cleanTarget) || (userConvtText === cleanTarget);
    } else if (quizMode === 'meaning-typing') {
      // Employ synonyms and parenthetical checks
      isCorrect = checkDefinitionCorrect(userTypedInput, activeQ.correctAnswer);
    } else {
      // Multiple choice exact match
      isCorrect = selectedOption === activeQ.correctAnswer;
    }

    setIsCorrectResult(isCorrect);
    setIsSubmitted(true);
    playFeedTone(isCorrect);
    handleSpeak(activeQ.word.character); // Pronounce aloud upon validation

    if (isCorrect) {
      setScore(prev => prev + 1);
      onUpdateWordStatus(activeQ.word.id, true);
    } else {
      setWrongAnswers(prev => [...prev, activeQ.word]);
      onUpdateWordStatus(activeQ.word.id, false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
      setUserTypedInput('');
      setSelectedOption(null);
      setIsSubmitted(false);
      setIsCorrectResult(false);
      setShownHint(false);
      // Auto focus on next typing prompt
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    } else {
      // Terminated - results summary is displayed on next render index boundary
      setCurrentIdx(prev => prev + 1);
    }
  };

  // Listen for 'Enter' shortcut key to submit or continue
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!quizStarted || currentIdx >= questions.length) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        if (!isSubmitted) {
          if (quizMode === 'multiple-choice') {
            if (selectedOption) handleSubmitAnswer();
          } else {
            if (userTypedInput.trim()) handleSubmitAnswer();
          }
        } else {
          handleNextQuestion();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [quizStarted, currentIdx, isSubmitted, selectedOption, userTypedInput, quizMode, questions]);

  // Handle focus when starting quiz
  useEffect(() => {
    if (quizStarted && currentIdx < questions.length && inputRef.current) {
      inputRef.current.focus();
    }
  }, [quizStarted, currentIdx]);

  const activeQuestion = questions[currentIdx];

  // Helper buttons for accents
  const pinyinTonesToolbarList = ['ā', 'á', 'ǎ', 'à', 'ō', 'ó', 'ǒ', 'ò', 'ē', 'é', 'ě', 'è', 'ī', 'í', 'ǐ', 'ì', 'ū', 'ú', 'ǔ', 'ù', 'ü', 'ǘ', 'ǚ', 'ǜ'];

  return (
    <div className="w-full mx-auto flex flex-col lg:flex-row gap-5 text-slate-800" id="quiz-panel">

      {/* ===== LEFT SIDEBAR: Lesson Selector (vertical tabs) ===== */}
      <div className="lg:w-70 shrink-0 flex flex-col gap-2" id="lesson-sidebar">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <BookOpen size={12} className="text-indigo-500" />
              Chọn bài ôn
            </span>
          </div>

          <div className="flex flex-row lg:flex-col gap-1 p-2 overflow-x-auto lg:overflow-x-visible" id="lesson-selector">
            {/* All lessons */}
            <button
              id="lesson-all"
              onClick={() => setSelectedLesson('all')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2.5 whitespace-nowrap ${selectedLesson === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                }`}
            >
              <Layers size={14} className="shrink-0" />
              <div className="flex flex-col gap-0.5">
                <span>Tất cả bài</span>
                <span className={`text-[10px] font-normal ${selectedLesson === 'all' ? 'text-indigo-200' : 'text-slate-400'}`}>{words.length} từ vựng</span>
              </div>
            </button>

            {/* Individual lessons */}
            {lessons.map((lesson, idx) => {
              const count = lessonCounts.get(lesson) || 0;
              const masteredInLesson = words.filter(w => w.category === lesson && w.status === 'mastered').length;
              const progress = count > 0 ? Math.round((masteredInLesson / count) * 100) : 0;

              return (
                <button
                  key={lesson}
                  id={`lesson-${lesson.replace(/\s+/g, '-')}`}
                  onClick={() => setSelectedLesson(lesson)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2.5 whitespace-nowrap ${selectedLesson === lesson
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                    }`}
                >
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${selectedLesson === lesson
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                    {idx + 1}
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="truncate">{lesson}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-normal ${selectedLesson === lesson ? 'text-indigo-200' : 'text-slate-400'}`}>{count} từ</span>
                      {progress > 0 && (
                        <span className={`text-[10px] font-normal ${selectedLesson === lesson ? 'text-emerald-300' : 'text-emerald-500'}`}>• {progress}%</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick stats for selected lesson */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm hidden lg:block">
          <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-2">Bài đang chọn</div>
          <div className="text-sm font-bold text-slate-800 truncate">{selectedLesson === 'all' ? 'Tất cả các bài' : selectedLesson}</div>
          <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
              {filteredByLesson.filter(w => w.status === 'new').length} mới
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
              {filteredByLesson.filter(w => w.status === 'learning').length} đang học
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              {filteredByLesson.filter(w => w.status === 'mastered').length} thuộc
            </span>
          </div>
        </div>
      </div>

      {/* ===== RIGHT CONTENT: Quiz Setup / Active Question / Results ===== */}
      <div className="flex-1 min-w-0 flex flex-col gap-5">

        {/* Intro Dashboard Configuration Panel */}
        {!quizStarted ? (
          <div className="bg-white border border-slate-200 p-7 rounded-2xl flex flex-col gap-6 shadow-sm relative overflow-hidden" id="quiz-setup">

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                <Keyboard size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Bài kiểm học thuộc lòng (Trắc nghiệm & Gõ bàn phím)</h2>
                <p className="text-xs text-slate-500">Rèn luyện liên tưởng ngữ nghĩa và bính âm tự nhiên.</p>
              </div>
            </div>

            {/* Mode selections */}
            <div className="flex flex-col gap-4">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <span>Chọn Chế Độ Luyện Tập</span>
              </label>

              <div className="grid grid-cols-1 gap-3">
                {/* Type 1: Pinyin Input */}
                <button
                  id="mode-pinyin-type"
                  onClick={() => setQuizMode('pinyin-typing')}
                  className={`flex gap-4 p-4 text-left border rounded-xl transition cursor-pointer relative ${quizMode === 'pinyin-typing'
                    ? 'border-emerald-500 bg-emerald-50 text-slate-800 shadow-sm'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                    }`}
                >
                  <div className={`mt-0.5 rounded-full p-1.5 h-6 w-6 flex items-center justify-center text-xs font-bold leading-none ${quizMode === 'pinyin-typing' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>A</div>
                  <div className="flex-1 flex flex-col gap-0.5">
                    <span className="font-semibold text-sm">Kiểm tra Phiên âm (Gõ Pinyin)</span>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Đề bài cho <strong>Nghĩa Việt & Chữ Hán</strong> → Bạn <strong>Gõ Pinyin</strong>.<br />
                      <span className="text-amber-500 font-medium">✨ Đặc biệt: Tự đổi số thành dấu bính âm (ví dụ: gõ <kbd className="bg-white border border-slate-200 px-1 py-0.5 rounded text-[10px]">zhe4</kbd> biến thành <kbd className="bg-white border border-slate-200 px-1 py-0.5 rounded text-[10px]">zhè</kbd>).</span>
                    </p>
                  </div>
                </button>

                {/* Type 2: Meaning Input */}
                <button
                  id="mode-meaning-type"
                  onClick={() => setQuizMode('meaning-typing')}
                  className={`flex gap-4 p-4 text-left border rounded-xl transition cursor-pointer relative ${quizMode === 'meaning-typing'
                    ? 'border-amber-500 bg-amber-50 text-slate-800 shadow-sm'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                    }`}
                >
                  <div className={`mt-0.5 rounded-full p-1.5 h-6 w-6 flex items-center justify-center text-xs font-bold leading-none ${quizMode === 'meaning-typing' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>B</div>
                  <div className="flex-1 flex flex-col gap-0.5">
                    <span className="font-semibold text-sm">Kiểm tra Nghĩa (Gõ Nghĩa Tiếng Việt)</span>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Đề bài cho <strong>Pinyin & Chữ Hán</strong> → Bạn <strong>Gõ Nghĩa Tiếng Việt</strong>.<br />
                      <span className="text-emerald-500 font-medium">✨ Chấm điểm thông minh: Tự chấp nhận các từ đồng nghĩa, bỏ qua dấu ngoặc để bạn học thoải mái, không lo rập khuôn.</span>
                    </p>
                  </div>
                </button>

                {/* Type 3: Classic Multiple choice */}
                <button
                  id="mode-classic-opts"
                  onClick={() => setQuizMode('multiple-choice')}
                  className={`flex gap-4 p-4 text-left border rounded-xl transition cursor-pointer ${quizMode === 'multiple-choice'
                    ? 'border-blue-500 bg-blue-50 text-slate-800 shadow-sm'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                    }`}
                >
                  <div className={`mt-0.5 rounded-full p-1.5 h-6 w-6 flex items-center justify-center text-xs font-bold leading-none ${quizMode === 'multiple-choice' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>C</div>
                  <div className="flex-1 flex flex-col gap-0.5">
                    <span className="font-semibold text-sm">Trắc nghiệm nhanh (Lựa chọn đáp án)</span>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Hệ thống đưa ra 4 ô đáp án ngẫu nhiên để chọn nhanh. Rất thích hợp khi học nhanh trên điện thoại hoặc máy tính bảng không tiện bấm phím.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Words warning limits */}
            <div className="flex items-center gap-2.5 mt-2 text-xs text-slate-500 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <HelpCircle size={16} className="text-amber-500 shrink-0" />
              <span>
                Yêu cầu có tối thiểu <strong className="text-slate-800">4 từ vựng</strong> trong bài đã chọn. Bài hiện tại: <strong className="text-slate-800">{selectedLesson === 'all' ? 'Tất cả' : selectedLesson}</strong> — <strong className="text-slate-800">{filteredByLesson.length} từ</strong>.
              </span>
            </div>

            <button
              id="launch-quiz-button"
              disabled={filteredByLesson.length < 4}
              onClick={generateQuiz}
              className={`w-full py-4.5 rounded-xl font-bold text-sm shadow opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer ${filteredByLesson.length >= 4
                ? 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                }`}
            >
              <Play size={16} className="fill-current" />
              <span>Bắt đầu ôn luyện (tất cả {filteredByLesson.length} câu)</span>
            </button>
          </div>
        ) : currentIdx < questions.length ? (
          /* Active Quiz Question Card Rendering */
          <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col gap-5.5 shadow-sm leading-relaxed select-none relative" id="active-question-card">

            {/* Header Progress and Score */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3" id="active-quiz-progress-header">
              <span className="text-xs text-slate-500 font-mono">
                Câu hỏi: <strong className="text-slate-800 font-bold">{currentIdx + 1}</strong> / {questions.length}
              </span>
              <div className="h-2 w-1/3 bg-slate-100 rounded-full overflow-hidden mx-3">
                <div
                  className={`h-full transition-all duration-300 ${quizMode === 'pinyin-typing' ? 'bg-emerald-500' : quizMode === 'meaning-typing' ? 'bg-amber-400' : 'bg-blue-500'
                    }`}
                  style={{ width: `${((currentIdx) / questions.length) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs text-emerald-600 font-semibold font-mono">Chính xác: {score}</span>
            </div>

            {/* Question Frame */}
            <div className="flex flex-col gap-2.5" id="question-prompt-layout">
              <span className="text-xs text-slate-500 font-medium tracking-wide flex items-center gap-1.5 bg-slate-50 self-start px-2.5 py-1 rounded-full border border-slate-200">
                <span className={`h-1.5 w-1.5 rounded-full ${quizMode === 'pinyin-typing' ? 'bg-emerald-500' : quizMode === 'meaning-typing' ? 'bg-amber-400' : 'bg-blue-500'
                  }`}></span>
                {quizMode === 'pinyin-typing' ? 'Chế độ: Đọc nghĩa tiếng Việt → Điền Pinyin phiên âm' : quizMode === 'meaning-typing' ? 'Chế độ: Đọc Pinyin cách đọc → Điền nghĩa Việt tương ứng' : 'Chế độ: Chọn câu trả lời tương ứng'}
              </span>

              {/* Layout divided into Chinese character on one side, and the prompt text on other */}
              <div className="mt-2 p-5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-slate-500 uppercase font-mono tracking-widest">Từ gợi ý:</span>

                  {/* Depending on mode, show corresponding values */}
                  {activeQuestion.promptType === 'meaning' && (
                    <div className="flex flex-col gap-1">
                      <span className="text-lg font-bold text-emerald-600 leading-snug">{activeQuestion.word.definition}</span>
                      <span className="text-xs text-slate-500 italic">{activeQuestion.word.category}</span>
                    </div>
                  )}
                  {activeQuestion.promptType === 'pinyin' && (
                    <div className="flex flex-col gap-1">
                      <span className="text-lg font-bold text-amber-600 tracking-wide font-mono bg-amber-50 py-0.5 px-2 rounded-lg border border-amber-200 fit-content">{activeQuestion.word.pinyin}</span>
                      <span className="text-xs text-slate-500 italic">{activeQuestion.word.category}</span>
                    </div>
                  )}
                </div>

                {/* Always display the high-contrast Character as an anchor of Hanzi learning */}
                <div className="flex flex-col items-center gap-1 shrink-0 bg-white border border-slate-200 p-3 rounded-xl min-w-[70px] shadow-sm">
                  <span className="text-4xl font-sans tracking-wide text-slate-800 font-medium whitespace-nowrap">{activeQuestion.word.character}</span>
                  <button
                    id="speak-active-hanzi"
                    onClick={() => handleSpeak(activeQuestion.word.character)}
                    className="p-1 rounded-md text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                    title="Nghe cách phát âm"
                  >
                    <Volume2 size={12} />
                  </button>
                </div>
              </div>
            </div>

            {/* INTERACTION AREA (TYPING INPUT / MULTIPLE CHOICE) */}
            <div className="flex flex-col gap-3" id="interaction-interface">

              {/* Case A: Typing Mode (Pinyin of Vietnamese Meaning) */}
              {quizMode !== 'multiple-choice' ? (
                <div className="flex flex-col gap-3.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 px-0.5">
                    <label htmlFor="user-text-input" className="font-semibold flex items-center gap-1 text-slate-800">
                      <span>Nhập câu trả lời của bạn:</span>
                    </label>

                    {/* Hint indicator button */}
                    {!shownHint && !isSubmitted && (
                      <button
                        id="show-hint-btn"
                        onClick={() => setShownHint(true)}
                        className="text-slate-500 hover:text-amber-500 transition text-[11px] flex items-center gap-1 cursor-pointer font-medium"
                        title="Xem gợi ý đầu"
                      >
                        <HintIcon size={12} className="text-amber-500" />
                        Xem gợi ý đầu
                      </button>
                    )}
                  </div>

                  {/* Main Typing Node */}
                  <div className="relative">
                    <input
                      ref={inputRef}
                      id="user-text-input"
                      type="text"
                      disabled={isSubmitted}
                      value={userTypedInput}
                      onChange={handleTypedInputChange}
                      placeholder={
                        quizMode === 'pinyin-typing'
                          ? "Gõ pinyin (ví dụ: 'zhe4' hoặc 'zhè')"
                          : "Nhập nghĩa tiếng Việt..."
                      }
                      className={`w-full py-3.5 px-4 rounded-xl border font-medium text-sm transition focus:outline-none focus:ring-1 ${isSubmitted
                        ? isCorrectResult
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700 focus:ring-emerald-500'
                          : 'bg-rose-50 border-rose-500 text-rose-700 focus:ring-rose-500'
                        : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500'
                        }`}
                    />

                    {/* Correct/Incorrect icon markers */}
                    {isSubmitted && (
                      <div className="absolute top-1/2 right-4 -translate-y-1/2">
                        {isCorrectResult ? (
                          <Check size={18} className="text-emerald-500" />
                        ) : (
                          <X size={18} className="text-rose-500" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Helpful Hint banner when requested */}
                  {shownHint && !isSubmitted && (
                    <div className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700 leading-relaxed">
                      <strong>Gợi ý:</strong> Từ này bắt đầu bằng chữ: <strong className="font-mono text-sm uppercase text-amber-600 bg-white px-1.5 py-0.5 rounded border border-amber-200">"{activeQuestion.correctAnswer.charAt(0)}"</strong>
                    </div>
                  )}

                  {/* Additional Tone Accent Toolbar ONLY for typing Pinyin */}
                  {quizMode === 'pinyin-typing' && !isSubmitted && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col gap-2">
                      <span className="text-[10px] text-slate-500 font-mono tracking-wide leading-relaxed">
                        💡 <strong>Mẹo nhỏ:</strong> Bạn chỉ cần gõ số thanh điệu (1-4) sau mỗi âm (Ví dụ: gõ <kbd className="text-amber-600 bg-white px-1 rounded border border-slate-200 font-mono text-[10px]">shi4</kbd> sẽ tự biến thành <kbd className="text-emerald-600 bg-white px-1 rounded border border-slate-200 font-mono text-[10px]">shì</kbd>). Hoặc click chọn ký tự dưới đây:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {pinyinTonesToolbarList.map((c) => (
                          <button
                            id={`pinyin-toolbar-${c}`}
                            key={c}
                            type="button"
                            onClick={() => handleInsertToneChar(c)}
                            className="px-2 py-1 rounded-md text-xs font-medium font-mono bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 cursor-pointer hover:border-slate-300 transition"
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Case B: Multiple Choice Grid selection block */
                <div className="flex flex-col gap-2.5" id="multiple-choice-grid">
                  <span className="text-xs text-slate-500 px-0.5">Chọn phương án trả lời đúng:</span>

                  <div className="flex flex-col gap-2">
                    {activeQuestion.options?.map((option, idx) => {
                      const isSelected = selectedOption === option;
                      const isCorrectAnswer = option === activeQuestion.correctAnswer;

                      let styleClass = 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm';
                      if (isSubmitted) {
                        if (isCorrectAnswer) {
                          styleClass = 'bg-emerald-50 text-emerald-700 border-emerald-500 shadow-sm';
                        } else if (isSelected) {
                          styleClass = 'bg-rose-50 text-rose-700 border-rose-500 shadow-sm';
                        } else {
                          styleClass = 'bg-slate-50 text-slate-400 border-slate-100 opacity-50';
                        }
                      } else if (isSelected) {
                        styleClass = 'bg-indigo-50 text-indigo-700 border-indigo-500 shadow-sm';
                      }

                      return (
                        <button
                          id={`quiz-opt-${idx}`}
                          key={idx}
                          disabled={isSubmitted}
                          onClick={() => handleSelectMultipleChoiceOpt(option)}
                          className={`w-full p-3.5 rounded-xl border text-left text-sm font-medium transition cursor-pointer flex items-center justify-between active:scale-98 ${styleClass}`}
                        >
                          <span className="tracking-wide">{option}</span>
                          {isSubmitted && isCorrectAnswer && (
                            <Check size={16} className="text-emerald-500 animate-bounce" />
                          )}
                          {isSubmitted && isSelected && !isCorrectAnswer && (
                            <X size={16} className="text-rose-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Correct / Incorrect Bottom Drawer Feedback */}
            <AnimatePresence>
              {isSubmitted && (
                <motion.div
                  key="feedback-banner"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`p-4 rounded-xl border flex flex-col gap-1.5 shadow-sm ${isCorrectResult
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-rose-50 border-rose-200 text-rose-700'
                    }`}
                  id="active-feedback-overlay"
                >
                  <div className="flex items-center gap-2">
                    {isCorrectResult ? (
                      <span className="text-sm font-bold flex items-center gap-1.5">🎉 Chính xác! Bạn đã ghi nhớ rất tốt.</span>
                    ) : (
                      <span className="text-sm font-bold flex items-center gap-1.5">❌ Chưa chính xác rồi!</span>
                    )}
                  </div>

                  <div className="text-xs text-slate-600 flex flex-col gap-0.5 border-t border-slate-200 pt-1.5 mt-1.5">
                    <div>Đáp án chuẩn đúng của từ <strong className="text-slate-800">"{activeQuestion.word.character}"</strong> là:</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                      <span className="text-amber-600 font-mono font-bold">{activeQuestion.word.pinyin}</span>
                      <span className="text-slate-400">→</span>
                      <span className="text-emerald-600 font-semibold">{activeQuestion.word.definition}</span>
                    </div>
                  </div>

                  {activeQuestion.word.exampleChinese && (
                    <div className="text-[11px] bg-white p-2.5 rounded-lg border border-slate-200 mt-2 shadow-sm flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="text-slate-500 font-medium font-mono uppercase tracking-widest text-[9px] mb-1">Cụm ví dụ minh họa:</div>
                        <div className="text-slate-800 font-sans tracking-wide leading-relaxed font-semibold">{activeQuestion.word.exampleChinese}</div>
                        {activeQuestion.word.examplePinyin && (
                          <div className="text-amber-600 font-mono text-[10px] mt-0.5">{activeQuestion.word.examplePinyin}</div>
                        )}
                        <div className="text-slate-500 mt-0.5">{activeQuestion.word.exampleVietnamese}</div>
                      </div>
                      <button
                        onClick={() => handleSpeak(activeQuestion.word.exampleChinese)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition cursor-pointer self-center shrink-0"
                        title="Nghe phát âm câu ví dụ"
                      >
                        <Volume2 size={14} />
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Footer Submission Controls */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-1" id="active-quiz-footer-actions">
              <div>
                <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                  <span>Phím tắt:</span>
                  <kbd className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600 shadow-sm">Enter</kbd>
                  <span>để nộp bài hoặc bấm tiếp tục</span>
                </span>
              </div>

              <div className="flex gap-2">
                {!isSubmitted ? (
                  <button
                    id="quiz-submit-button"
                    disabled={
                      quizMode === 'multiple-choice'
                        ? !selectedOption
                        : !userTypedInput.trim()
                    }
                    onClick={handleSubmitAnswer}
                    className={`px-6 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow cursor-pointer ${(quizMode === 'multiple-choice' ? selectedOption : userTypedInput.trim())
                      ? 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                      }`}
                  >
                    <span>Kiểm tra đáp án</span>
                    <ChevronRight size={14} />
                  </button>
                ) : (
                  <button
                    id="quiz-next-button"
                    onClick={handleNextQuestion}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-indigo-650/10"
                  >
                    <span>{currentIdx + 1 === questions.length ? "Xem bảng thành tích" : "Câu tiếp theo"}</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Scorecard Complete Block Display */
          <div className="bg-white border border-slate-200 p-8 rounded-2xl flex flex-col gap-6 text-center items-center shadow-lg relative" id="quiz-complete-card">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
              <Award size={40} className="animate-bounce" />
            </div>

            <div>
              <span className="text-[10px] text-amber-600 font-bold uppercase tracking-widest bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">Hoàn tất rèn luyện</span>
              <h2 className="text-xl font-extrabold text-slate-800 mt-2.5">Kiểm tra kết thúc thành công!</h2>
              <p className="text-xs text-slate-500 mt-1">Bạn đã hoàn thành bài gõ từ tiếng Trung của mình.</p>
            </div>

            {/* Large Circle score displaying */}
            <div className="flex flex-col items-center justify-center my-1">
              <span className="text-xs text-slate-500 font-mono">Đoán chính xác:</span>
              <div className="text-6xl font-black font-mono text-slate-800 mt-1">
                {score} <span className="text-2xl text-slate-400 font-normal">/ {questions.length}</span>
              </div>
            </div>

            {/* Phrases analysis */}
            <div className="px-5 py-3 rounded-xl bg-slate-50 text-xs text-slate-600 max-w-sm border border-slate-200 leading-relaxed shadow-sm">
              {score === 10 ? (
                <span className="text-emerald-700 font-semibold">Thật kiệt xuất! Bạn đã thuộc đúng tuyệt đối 100%. Hãy yên tâm học tiếp các mẫu câu giao tiếp phức tạp hơn nhé!</span>
              ) : score >= 8 ? (
                <span className="text-emerald-600">Rất là giỏi! Trí nhớ chữ Hán và phiên âm pinyin vô cùng sắc nét. Chúc mừng bạn nha!</span>
              ) : score >= 5 ? (
                <span className="text-amber-600">Khá tốt! Bạn có căn bản tương đối vững. Có một số lỗi chính tả nhỏ của Pinyin hoặc nghĩa việt chưa tuyệt đối. Ôn luyện thêm vài lần sẽ thạo.</span>
              ) : (
                <span className="text-rose-600">Đừng nản chí nhé! Học chữ biểu ý tiếng Trung luôn cần tính lặp đi lặp lại nhiều lần. Hãy bấm nút dưới để thử ôn thêm lần nữa nha!</span>
              )}
            </div>

            {/* Missed Words Box to re-study instantly */}
            {wrongAnswers.length > 0 && (
              <div className="w-full text-left flex flex-col gap-2.5 bg-slate-50 border border-slate-200 p-4.5 rounded-2xl" id="failed-words-panel">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                  Các từ cần rèn lại kỹ hơn ({wrongAnswers.length}):
                </span>
                <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1 text-[11px]">
                  {wrongAnswers.map((word, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 p-2.5 rounded-lg flex flex-col gap-0.5 shadow-sm select-text">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-800">{word.character}</span>
                        <span className="font-mono text-amber-600 font-semibold">{word.pinyin}</span>
                      </div>
                      <span className="text-slate-500 truncate mt-0.5">{word.definition}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Re-action triggers */}
            <div className="grid grid-cols-2 gap-3 w-full border-t border-slate-100 pt-5 mt-2">
              <button
                id="exit-quiz-complete"
                onClick={() => setQuizStarted(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer transition shadow-sm"
              >
                Chọn chế độ khác
              </button>
              <button
                id="replay-quiz-complete"
                onClick={generateQuiz}
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-700/5 active:scale-95"
              >
                <RefreshCw size={12} />
                <span>Luyện lại ngay</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
