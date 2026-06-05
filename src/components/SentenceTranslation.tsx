/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check, X, RefreshCw, Award, ArrowRight, Volume2,
  HelpCircle, Play, BookOpen, ChevronRight,
  Layers, Languages, Eye, EyeOff, ArrowLeftRight, ListChecks
} from 'lucide-react';
import { VocabularyWord } from '../types';
import { getUniqueLessons, countWordsByLesson } from '../utils/lesson';
import { convertNumberedPinyin } from '../utils/pinyin';

interface SentenceTranslationProps {
  words: VocabularyWord[];
}

type TranslateMode = 'vn-to-cn' | 'cn-to-vn' | 'multiple-choice';

interface SentenceOption {
  text: string;
  pinyin?: string;
}

interface SentenceQuestion {
  id: string;
  word: VocabularyWord;
  promptSentence: string;        // Câu đề bài
  promptPinyin?: string;         // Pinyin của câu đề (chỉ khi mode cn-to-vn)
  correctAnswer: string;         // Câu đáp án đúng
  correctAnswerPinyin?: string;  // Pinyin của đáp án (chỉ khi mode vn-to-cn)
  options?: SentenceOption[];     // 4 lựa chọn (chỉ khi mode multiple-choice)
  relatedWord: string;           // Từ vựng chính liên quan
  relatedPinyin: string;
  relatedDefinition: string;
}

export default function SentenceTranslation({ words }: SentenceTranslationProps) {
  const [quizStarted, setQuizStarted] = useState(false);
  const [translateMode, setTranslateMode] = useState<TranslateMode>('vn-to-cn');
  const [selectedLesson, setSelectedLesson] = useState<string>('all');
  const [questions, setQuestions] = useState<SentenceQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  // Input tracking
  const [userInput, setUserInput] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrectResult, setIsCorrectResult] = useState(false);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState<SentenceQuestion[]>([]);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Reset when changing lesson
  useEffect(() => {
    setQuizStarted(false);
    setQuestions([]);
    setCurrentIdx(0);
    setUserInput('');
    setSelectedOption(null);
    setIsSubmitted(false);
    setIsCorrectResult(false);
    setScore(0);
    setShowHint(false);
    setShowAnswer(false);
    setWrongAnswers([]);
  }, [selectedLesson]);

  // Audio feedback
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
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (_) {}
  };

  // TTS
  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  // Lesson data
  const lessons = getUniqueLessons(words);
  const lessonCounts = countWordsByLesson(words);

  const filteredByLesson = selectedLesson === 'all'
    ? words
    : words.filter(w => w.category === selectedLesson);

  // Only words with example sentences
  const wordsWithSentences = filteredByLesson.filter(
    w => w.exampleChinese && w.exampleVietnamese
  );

  // All words with sentences (unfiltered by lesson, for MC distractors)
  const allWordsWithSentences = words.filter(
    w => w.exampleChinese && w.exampleVietnamese
  );

  // Generate quiz
  const generateQuiz = () => {
    if (wordsWithSentences.length === 0) return;

    const shuffled = [...wordsWithSentences].sort(() => Math.random() - 0.5);

    // Determine if MC mode uses Chinese or Vietnamese prompt randomly per question
    const isMCMode = translateMode === 'multiple-choice';

    const generated: SentenceQuestion[] = shuffled.map((word) => {
      if (translateMode === 'vn-to-cn') {
        return {
          id: Math.random().toString(),
          word,
          promptSentence: word.exampleVietnamese!,
          correctAnswer: word.exampleChinese!,
          correctAnswerPinyin: word.examplePinyin,
          relatedWord: word.character,
          relatedPinyin: word.pinyin,
          relatedDefinition: word.definition,
        };
      } else if (translateMode === 'cn-to-vn') {
        return {
          id: Math.random().toString(),
          word,
          promptSentence: word.exampleChinese!,
          promptPinyin: word.examplePinyin,
          correctAnswer: word.exampleVietnamese!,
          relatedWord: word.character,
          relatedPinyin: word.pinyin,
          relatedDefinition: word.definition,
        };
      } else {
        // Multiple choice: randomly choose direction per question
        const isVnPrompt = Math.random() > 0.5;
        const promptSentence = isVnPrompt ? word.exampleVietnamese! : word.exampleChinese!;
        const promptPinyin = isVnPrompt ? undefined : word.examplePinyin;
        const correctAnswer = isVnPrompt ? word.exampleChinese! : word.exampleVietnamese!;
        const correctAnswerPinyin = isVnPrompt ? word.examplePinyin : undefined;

        // Build 4 MC options from other sentences
        const distractorPool = allWordsWithSentences
          .filter(w => w.id !== word.id)
          .map(w => ({
            text: isVnPrompt ? w.exampleChinese! : w.exampleVietnamese!,
            pinyin: isVnPrompt ? w.examplePinyin : undefined
          }))
          .filter((val, index, self) => self.findIndex(t => t.text === val.text) === index && val.text !== correctAnswer)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);

        while (distractorPool.length < 3) {
          distractorPool.push({
            text: isVnPrompt ? '（不知道）' : 'Đáp án khác',
            pinyin: undefined
          });
        }

        const correctAnswerObj: SentenceOption = {
          text: correctAnswer,
          pinyin: correctAnswerPinyin
        };

        const options = [correctAnswerObj, ...distractorPool].sort(() => Math.random() - 0.5);

        return {
          id: Math.random().toString(),
          word,
          promptSentence,
          promptPinyin,
          correctAnswer,
          correctAnswerPinyin,
          options,
          relatedWord: word.character,
          relatedPinyin: word.pinyin,
          relatedDefinition: word.definition,
        };
      }
    });

    setQuestions(generated);
    setCurrentIdx(0);
    setUserInput('');
    setSelectedOption(null);
    setIsSubmitted(false);
    setIsCorrectResult(false);
    setScore(0);
    setShowHint(false);
    setShowAnswer(false);
    setWrongAnswers([]);
    setQuizStarted(true);
  };

  // Normalize text for comparison
  const normalizeText = (text: string): string => {
    return text
      .trim()
      .toLowerCase()
      .replace(/[。！？、，；：""''「」【】（）\.\!\?\,\;\:\"\'\(\)\s]+/g, '')
      .normalize('NFC');
  };

  // Remove Vietnamese tones for fuzzy matching
  const removeVietnameseTones = (str: string): string => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase();
  };

  // Check answer
  const checkAnswer = (input: string, correctAnswer: string, correctAnswerPinyin?: string): boolean => {
    const normInput = normalizeText(input);
    const normCorrect = normalizeText(correctAnswer);

    // Exact match (Chinese characters or Vietnamese)
    if (normInput === normCorrect) return true;

    // Check Pinyin if available (case-insensitive, but tones must be correct)
    if (correctAnswerPinyin) {
      const normPinyinInput = normalizeText(input);
      const normPinyinCorrect = normalizeText(correctAnswerPinyin);
      if (normPinyinInput === normPinyinCorrect) return true;
    }

    // For Vietnamese answers: fuzzy tone-free comparison
    if (translateMode === 'cn-to-vn') {
      const tonesFreeInput = removeVietnameseTones(input).replace(/[^a-z0-9]/g, '');
      const tonesFreeCorrect = removeVietnameseTones(correctAnswer).replace(/[^a-z0-9]/g, '');
      if (tonesFreeInput === tonesFreeCorrect) return true;
    }

    // Levenshtein distance for small typos (allow up to 2 characters difference)
    if (Math.abs(normInput.length - normCorrect.length) <= 2) {
      let diffCount = 0;
      const maxLen = Math.max(normInput.length, normCorrect.length);
      const minLen = Math.min(normInput.length, normCorrect.length);
      for (let i = 0; i < minLen; i++) {
        if (normInput[i] !== normCorrect[i]) diffCount++;
      }
      diffCount += maxLen - minLen;
      if (diffCount <= 2 && maxLen > 4) return true;
    }

    return false;
  };

  // Submit answer (for typing modes)
  const handleSubmitAnswer = () => {
    if (isSubmitted) return;
    if (translateMode !== 'multiple-choice' && !userInput.trim()) return;

    const activeQ = questions[currentIdx];
    const isCorrect = translateMode === 'multiple-choice'
      ? selectedOption?.trim().toLowerCase() === activeQ.correctAnswer.trim().toLowerCase()
      : checkAnswer(userInput, activeQ.correctAnswer, activeQ.correctAnswerPinyin);

    setIsCorrectResult(isCorrect);
    setIsSubmitted(true);
    playFeedTone(isCorrect);

    // Speak Chinese sentence aloud
    if (translateMode === 'vn-to-cn') {
      handleSpeak(activeQ.correctAnswer);
    } else if (translateMode === 'multiple-choice') {
      // Speak the Chinese part
      const chineseSentence = activeQ.word.exampleChinese;
      if (chineseSentence) handleSpeak(chineseSentence);
    }

    if (isCorrect) {
      setScore(prev => prev + 1);
    } else {
      setWrongAnswers(prev => [...prev, activeQ]);
    }
  };

  // Handle MC option click
  const handleSelectMultipleChoiceOpt = (option: string) => {
    if (isSubmitted) return;
    setSelectedOption(option);
    // Auto-submit on click for MC
    const activeQ = questions[currentIdx];
    const isCorrect = option === activeQ.correctAnswer;

    setIsCorrectResult(isCorrect);
    setIsSubmitted(true);
    playFeedTone(isCorrect);

    const chineseSentence = activeQ.word.exampleChinese;
    if (chineseSentence) handleSpeak(chineseSentence);

    if (isCorrect) {
      setScore(prev => prev + 1);
    } else {
      setWrongAnswers(prev => [...prev, activeQ]);
    }
  };

  // Next question
  const handleNextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
      setUserInput('');
      setSelectedOption(null);
      setIsSubmitted(false);
      setIsCorrectResult(false);
      setShowHint(false);
      setShowAnswer(false);
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
    } else {
      setCurrentIdx(prev => prev + 1);
    }
  };

  // Keyboard shortcut: Ctrl+Enter to submit, Enter in textarea just newlines
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!quizStarted || currentIdx >= questions.length) return;

      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (!isSubmitted) {
          if (translateMode === 'multiple-choice' ? selectedOption : userInput.trim()) handleSubmitAnswer();
        } else {
          handleNextQuestion();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [quizStarted, currentIdx, isSubmitted, userInput, selectedOption, translateMode, questions]);

  // Auto focus
  useEffect(() => {
    if (quizStarted && currentIdx < questions.length && inputRef.current) {
      inputRef.current.focus();
    }
  }, [quizStarted, currentIdx]);

  const activeQuestion = questions[currentIdx];
  const isPromptChinese = activeQuestion && (
    translateMode === 'cn-to-vn' ||
    (translateMode === 'multiple-choice' && activeQuestion.promptSentence === activeQuestion.word.exampleChinese)
  );

  // Pinyin tone toolbar (same as Quiz component)
  const pinyinTonesToolbarList = ['ā', 'á', 'ǎ', 'à', 'ō', 'ó', 'ǒ', 'ò', 'ē', 'é', 'ě', 'è', 'ī', 'í', 'ǐ', 'ì', 'ū', 'ú', 'ǔ', 'ù', 'ü', 'ǘ', 'ǚ', 'ǜ'];

  // Insert tone character at cursor position in textarea
  const handleInsertToneChar = (char: string) => {
    if (isSubmitted) return;
    setUserInput(prev => prev + char);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle input change with auto pinyin conversion for vn-to-cn mode
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const rawVal = e.target.value;
    if (translateMode === 'vn-to-cn') {
      // Auto-convert numbered pinyin to tone marks (e.g. ni3 → nǐ)
      const converted = convertNumberedPinyin(rawVal);
      setUserInput(converted);
    } else {
      setUserInput(rawVal);
    }
  };

  return (
    <div className="w-full mx-auto flex flex-col lg:flex-row gap-5 text-slate-800" id="sentence-translation-panel">

      {/* ===== LEFT SIDEBAR: Lesson Selector ===== */}
      <div className="lg:w-70 shrink-0 flex flex-col gap-2" id="sentence-lesson-sidebar">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <BookOpen size={12} className="text-violet-500" />
              Chọn bài luyện dịch
            </span>
          </div>

          <div className="flex flex-row lg:flex-col gap-1 p-2 overflow-x-auto lg:overflow-x-visible" id="sentence-lesson-selector">
            {/* All lessons */}
            <button
              id="sentence-lesson-all"
              onClick={() => setSelectedLesson('all')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2.5 whitespace-nowrap ${selectedLesson === 'all'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-violet-600'
                }`}
            >
              <Layers size={14} className="shrink-0" />
              <div className="flex flex-col gap-0.5">
                <span>Tất cả bài</span>
                <span className={`text-[10px] font-normal ${selectedLesson === 'all' ? 'text-violet-200' : 'text-slate-400'}`}>
                  {words.filter(w => w.exampleChinese && w.exampleVietnamese).length} câu
                </span>
              </div>
            </button>

            {/* Individual lessons */}
            {lessons.map((lesson, idx) => {
              const sentenceCount = words.filter(
                w => w.category === lesson && w.exampleChinese && w.exampleVietnamese
              ).length;

              return (
                <button
                  key={lesson}
                  id={`sentence-lesson-${lesson.replace(/\s+/g, '-')}`}
                  onClick={() => setSelectedLesson(lesson)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2.5 whitespace-nowrap ${selectedLesson === lesson
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-violet-600'
                    }`}
                >
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${selectedLesson === lesson
                    ? 'bg-violet-500 text-white'
                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                    {idx + 1}
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="truncate">{lesson}</span>
                    <span className={`text-[10px] font-normal ${selectedLesson === lesson ? 'text-violet-200' : 'text-slate-400'}`}>
                      {sentenceCount} câu
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick stats */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm hidden lg:block">
          <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-2">Bài đang chọn</div>
          <div className="text-sm font-bold text-slate-800 truncate">{selectedLesson === 'all' ? 'Tất cả các bài' : selectedLesson}</div>
          <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Languages size={12} className="text-violet-500" />
              {wordsWithSentences.length} câu có sẵn
            </span>
          </div>
        </div>
      </div>

      {/* ===== RIGHT CONTENT ===== */}
      <div className="flex-1 min-w-0 flex flex-col gap-5">

        {/* Setup Panel */}
        {!quizStarted ? (
          <div className="bg-white border border-slate-200 p-7 rounded-2xl flex flex-col gap-6 shadow-sm relative overflow-hidden" id="sentence-setup">

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-3 bg-violet-50 text-violet-600 rounded-xl border border-violet-100">
                <Languages size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Luyện Dịch Câu (Sentence Translation)</h2>
                <p className="text-xs text-slate-500">Dịch câu hoàn chỉnh sử dụng từ vựng trong bài — rèn luyện ngữ pháp và ghép câu tự nhiên.</p>
              </div>
            </div>

            {/* Mode selections */}
            <div className="flex flex-col gap-4">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <span>Chọn Hướng Dịch</span>
              </label>

              <div className="grid grid-cols-1 gap-3">
                {/* VN → CN */}
                <button
                  id="mode-vn-to-cn"
                  onClick={() => setTranslateMode('vn-to-cn')}
                  className={`flex gap-4 p-4 text-left border rounded-xl transition cursor-pointer relative ${translateMode === 'vn-to-cn'
                    ? 'border-violet-500 bg-violet-50 text-slate-800 shadow-sm'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                    }`}
                >
                  <div className={`mt-0.5 rounded-full p-1.5 h-6 w-6 flex items-center justify-center text-xs font-bold leading-none ${translateMode === 'vn-to-cn' ? 'bg-violet-500 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>A</div>
                  <div className="flex-1 flex flex-col gap-0.5">
                    <span className="font-semibold text-sm flex items-center gap-2">
                      Việt → Trung
                      <span className="text-[10px] font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">🇻🇳 → 🇨🇳</span>
                    </span>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Đề bài cho <strong>câu tiếng Việt</strong> → Bạn <strong>gõ câu tiếng Trung</strong> tương ứng.<br />
                      <span className="text-violet-500 font-medium">✨ Rèn luyện kỹ năng viết và ghép câu tiếng Trung từ ý nghĩa.</span>
                    </p>
                  </div>
                </button>

                {/* CN → VN */}
                <button
                  id="mode-cn-to-vn"
                  onClick={() => setTranslateMode('cn-to-vn')}
                  className={`flex gap-4 p-4 text-left border rounded-xl transition cursor-pointer relative ${translateMode === 'cn-to-vn'
                    ? 'border-amber-500 bg-amber-50 text-slate-800 shadow-sm'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                    }`}
                >
                  <div className={`mt-0.5 rounded-full p-1.5 h-6 w-6 flex items-center justify-center text-xs font-bold leading-none ${translateMode === 'cn-to-vn' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>B</div>
                  <div className="flex-1 flex flex-col gap-0.5">
                    <span className="font-semibold text-sm flex items-center gap-2">
                      Trung → Việt
                      <span className="text-[10px] font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">🇨🇳 → 🇻🇳</span>
                    </span>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Đề bài cho <strong>câu tiếng Trung (kèm Pinyin)</strong> → Bạn <strong>gõ nghĩa tiếng Việt</strong>.<br />
                      <span className="text-amber-500 font-medium">✨ Rèn luyện kỹ năng đọc hiểu và dịch nghĩa câu.</span>
                    </p>
                  </div>
                </button>

                {/* MC Mode */}
                <button
                  id="mode-multiple-choice"
                  onClick={() => setTranslateMode('multiple-choice')}
                  className={`flex gap-4 p-4 text-left border rounded-xl transition cursor-pointer relative ${translateMode === 'multiple-choice'
                    ? 'border-blue-500 bg-blue-50 text-slate-800 shadow-sm'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                    }`}
                >
                  <div className={`mt-0.5 rounded-full p-1.5 h-6 w-6 flex items-center justify-center text-xs font-bold leading-none ${translateMode === 'multiple-choice' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>C</div>
                  <div className="flex-1 flex flex-col gap-0.5">
                    <span className="font-semibold text-sm flex items-center gap-2">
                      Trắc nghiệm câu
                      <span className="text-[10px] font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">📝 4 đáp án</span>
                    </span>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Đề bài cho <strong>câu tiếng Việt hoặc tiếng Trung</strong> → Bạn <strong>chọn bản dịch đúng</strong> từ 4 đáp án.<br />
                      <span className="text-blue-500 font-medium">✨ Thích hợp ôn nhanh trên điện thoại, không cần gõ bàn phím.</span>
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="flex items-center gap-2.5 mt-2 text-xs text-slate-500 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <HelpCircle size={16} className="text-violet-500 shrink-0" />
              <span>
                Cần tối thiểu <strong className="text-slate-800">{translateMode === 'multiple-choice' ? '4 câu ví dụ' : '1 câu ví dụ'}</strong> trong bài. Bài hiện tại: <strong className="text-slate-800">{selectedLesson === 'all' ? 'Tất cả' : selectedLesson}</strong> — <strong className="text-slate-800">{wordsWithSentences.length} câu</strong>.
              </span>
            </div>

            <button
              id="launch-sentence-quiz"
              disabled={translateMode === 'multiple-choice' ? wordsWithSentences.length < 4 : wordsWithSentences.length === 0}
              onClick={generateQuiz}
              className={`w-full py-4.5 rounded-xl font-bold text-sm shadow opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer ${(translateMode === 'multiple-choice' ? wordsWithSentences.length >= 4 : wordsWithSentences.length > 0)
                ? 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                }`}
            >
              <Play size={16} className="fill-current" />
              <span>Bắt đầu luyện dịch ({wordsWithSentences.length} câu)</span>
            </button>
          </div>
        ) : currentIdx < questions.length ? (
          /* Active Question Card */
          <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col gap-5 shadow-sm leading-relaxed select-none relative" id="active-sentence-card">

            {/* Progress header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs text-slate-500 font-mono">
                Câu: <strong className="text-slate-800 font-bold">{currentIdx + 1}</strong> / {questions.length}
              </span>
              <div className="h-2 w-1/3 bg-slate-100 rounded-full overflow-hidden mx-3">
                <div
                  className={`h-full transition-all duration-300 ${translateMode === 'vn-to-cn' ? 'bg-violet-500' : translateMode === 'cn-to-vn' ? 'bg-amber-400' : 'bg-blue-500'}`}
                  style={{ width: `${((currentIdx) / questions.length) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs text-emerald-600 font-semibold font-mono">Đúng: {score}</span>
            </div>

            {/* Mode indicator */}
            <span className="text-xs text-slate-500 font-medium tracking-wide flex items-center gap-1.5 bg-slate-50 self-start px-2.5 py-1 rounded-full border border-slate-200">
              <span className={`h-1.5 w-1.5 rounded-full ${translateMode === 'vn-to-cn' ? 'bg-violet-500' : translateMode === 'cn-to-vn' ? 'bg-amber-400' : 'bg-blue-500'}`}></span>
              {translateMode === 'vn-to-cn'
                ? 'Hướng dịch: Tiếng Việt → Tiếng Trung'
                : translateMode === 'cn-to-vn'
                  ? 'Hướng dịch: Tiếng Trung → Tiếng Việt'
                  : 'Trắc nghiệm: Chọn bản dịch đúng'}
            </span>

            {/* Prompt sentence card */}
            <div className="mt-1 p-5 bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200 rounded-xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">
                  {isPromptChinese ? '📖 Câu tiếng Trung (đề bài):' : '📖 Câu tiếng Việt (đề bài):'}
                </span>
                {isPromptChinese && (
                  <button
                    onClick={() => handleSpeak(activeQuestion.promptSentence)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white transition cursor-pointer"
                    title="Nghe phát âm"
                  >
                    <Volume2 size={14} />
                  </button>
                )}
              </div>

              <div className="text-lg font-bold text-slate-800 leading-relaxed tracking-wide">
                {activeQuestion.promptSentence}
              </div>

              {/* Show pinyin for Chinese prompt */}
              {activeQuestion.promptPinyin && (
                <div className="text-sm text-amber-600 font-mono mt-0.5">
                  {activeQuestion.promptPinyin}
                </div>
              )}

              {/* Related vocab hint */}
              <div className="flex items-center gap-2 mt-1 pt-2 border-t border-slate-200/60">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest">Từ chính:</span>
                <span className="text-sm font-bold text-slate-700 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                  {activeQuestion.relatedWord}
                </span>
                <span className="text-xs text-amber-600 font-mono">{activeQuestion.relatedPinyin}</span>
                <span className="text-xs text-slate-500">— {activeQuestion.relatedDefinition}</span>
              </div>
            </div>

            {/* Input area */}
            <div className="flex flex-col gap-3">

              {/* === TYPING MODE (vn-to-cn / cn-to-vn) === */}
              {translateMode !== 'multiple-choice' ? (
                <>
                  <div className="flex items-center justify-between text-xs text-slate-500 px-0.5">
                    <label htmlFor="sentence-input" className="font-semibold flex items-center gap-1 text-slate-800">
                      <span>
                        {translateMode === 'vn-to-cn'
                          ? 'Nhập bản dịch tiếng Trung:'
                          : 'Nhập bản dịch tiếng Việt:'}
                      </span>
                    </label>

                    <div className="flex items-center gap-2">
                      {/* Show hint */}
                      {!showHint && !isSubmitted && (
                        <button
                          id="sentence-hint-btn"
                          onClick={() => setShowHint(true)}
                          className="text-slate-500 hover:text-violet-500 transition text-[11px] flex items-center gap-1 cursor-pointer font-medium"
                        >
                          <Eye size={12} className="text-violet-500" />
                          Xem gợi ý
                        </button>
                      )}

                      {/* Show answer */}
                      {!isSubmitted && (
                        <button
                          id="sentence-show-answer-btn"
                          onClick={() => setShowAnswer(!showAnswer)}
                          className="text-slate-500 hover:text-amber-500 transition text-[11px] flex items-center gap-1 cursor-pointer font-medium"
                        >
                          {showAnswer ? <EyeOff size={12} className="text-amber-500" /> : <Eye size={12} className="text-amber-500" />}
                          {showAnswer ? 'Ẩn đáp án' : 'Xem đáp án'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Textarea */}
                  <div className="relative">
                    <textarea
                      ref={inputRef}
                      id="sentence-input"
                      disabled={isSubmitted}
                      value={userInput}
                      onChange={handleInputChange}
                      placeholder={
                        translateMode === 'vn-to-cn'
                          ? 'Gõ câu tiếng Trung tại đây...'
                          : 'Gõ câu tiếng Việt tại đây...'
                      }
                      rows={3}
                      className={`w-full py-3.5 px-4 rounded-xl border font-medium text-sm transition focus:outline-none focus:ring-1 resize-none ${isSubmitted
                        ? isCorrectResult
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700 focus:ring-emerald-500'
                          : 'bg-rose-50 border-rose-500 text-rose-700 focus:ring-rose-500'
                        : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-violet-500 focus:ring-violet-500'
                        }`}
                    />

                    {isSubmitted && (
                      <div className="absolute top-3 right-4">
                        {isCorrectResult ? (
                          <Check size={18} className="text-emerald-500" />
                        ) : (
                          <X size={18} className="text-rose-500" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Pinyin Tone Accent Toolbar - only for vn-to-cn mode */}
                  {translateMode === 'vn-to-cn' && !isSubmitted && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col gap-2">
                      <span className="text-[10px] text-slate-500 font-mono tracking-wide leading-relaxed">
                        💡 <strong>Mẹo nhỏ:</strong> Bạn chỉ cần gõ số thanh điệu (1-4) sau mỗi âm (Ví dụ: gõ <kbd className="text-amber-600 bg-white px-1 rounded border border-slate-200 font-mono text-[10px]">wo3</kbd> sẽ tự biến thành <kbd className="text-emerald-600 bg-white px-1 rounded border border-slate-200 font-mono text-[10px]">wǒ</kbd>). Hoặc click chọn ký tự dưới đây:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {pinyinTonesToolbarList.map((c) => (
                          <button
                            id={`sentence-pinyin-toolbar-${c}`}
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

                  {/* Hint banner */}
                  {showHint && !isSubmitted && (
                    <div className="px-3.5 py-2 rounded-xl bg-violet-50 border border-violet-200 text-xs text-violet-700 leading-relaxed">
                      <strong>Gợi ý:</strong> Câu trả lời bắt đầu bằng: <strong className="font-mono text-sm text-violet-600 bg-white px-1.5 py-0.5 rounded border border-violet-200">
                        "{activeQuestion.correctAnswer.substring(0, Math.min(3, activeQuestion.correctAnswer.length))}..."
                      </strong>
                    </div>
                  )}

                  {/* Show answer */}
                  {showAnswer && !isSubmitted && (
                    <div className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700 leading-relaxed">
                      <strong>Đáp án mẫu:</strong>{' '}
                      <span className="font-semibold text-sm text-amber-800">{activeQuestion.correctAnswer}</span>
                      {activeQuestion.correctAnswerPinyin && (
                        <span className="ml-2 text-amber-600 font-mono text-[11px]">({activeQuestion.correctAnswerPinyin})</span>
                      )}
                    </div>
                  )}
                </>
              ) : (
                /* === MULTIPLE CHOICE MODE === */
                <div className="flex flex-col gap-2.5" id="sentence-mc-grid">
                  <span className="text-xs text-slate-500 px-0.5 font-semibold">Chọn bản dịch đúng:</span>

                  <div className="flex flex-col gap-2">
                    {activeQuestion.options?.map((option, idx) => {
                      const isSelected = selectedOption === option.text;
                      const isCorrectAnswer = option.text === activeQuestion.correctAnswer;

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
                           id={`sentence-mc-opt-${idx}`}
                           key={idx}
                           disabled={isSubmitted}
                           onClick={() => handleSelectMultipleChoiceOpt(option.text)}
                           className={`w-full p-3.5 rounded-xl border text-left text-sm font-medium transition cursor-pointer flex items-center justify-between active:scale-98 ${styleClass}`}
                        >
                          <div className="flex flex-col text-left">
                            <span className="tracking-wide leading-relaxed">{option.text}</span>
                            {option.pinyin && (
                              <span className="text-xs text-amber-600 font-mono mt-0.5">{option.pinyin}</span>
                            )}
                          </div>
                          {isSubmitted && isCorrectAnswer && (
                            <Check size={16} className="text-emerald-500 animate-bounce shrink-0" />
                          )}
                          {isSubmitted && isSelected && !isCorrectAnswer && (
                            <X size={16} className="text-rose-500 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {isSubmitted && (
                <motion.div
                  key="sentence-feedback"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`p-4 rounded-xl border flex flex-col gap-2 shadow-sm ${isCorrectResult
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-rose-50 border-rose-200 text-rose-700'
                    }`}
                  id="sentence-feedback-overlay"
                >
                  <div className="flex items-center gap-2">
                    {isCorrectResult ? (
                      <span className="text-sm font-bold flex items-center gap-1.5">🎉 Chính xác! Bạn dịch rất tốt.</span>
                    ) : (
                      <span className="text-sm font-bold flex items-center gap-1.5">❌ Chưa chính xác!</span>
                    )}
                  </div>

                  <div className="text-xs text-slate-600 flex flex-col gap-1.5 border-t border-slate-200 pt-2 mt-1">
                    <div className="font-semibold text-slate-700">Đáp án chuẩn:</div>
                    <div className="text-base font-bold text-slate-800 bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between gap-3">
                      <div className="flex flex-col gap-0.5">
                        <span>{activeQuestion.correctAnswer}</span>
                        {activeQuestion.correctAnswerPinyin && (
                          <span className="text-amber-600 font-mono text-sm font-normal">{activeQuestion.correctAnswerPinyin}</span>
                        )}
                      </div>
                      {translateMode === 'vn-to-cn' && (
                        <button
                          onClick={() => handleSpeak(activeQuestion.correctAnswer)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition cursor-pointer shrink-0"
                          title="Nghe phát âm câu đáp án"
                        >
                          <Volume2 size={14} />
                        </button>
                      )}
                    </div>

                    {/* Your answer comparison */}
                    {!isCorrectResult && (
                      <div className="mt-1">
                        <div className="text-[11px] text-slate-500 font-mono mb-1">Bạn đã nhập:</div>
                        <div className="text-sm text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200 font-medium">
                          {userInput}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-1" id="sentence-footer-actions">
              <div>
                <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                  <span>Phím tắt:</span>
                  <kbd className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600 shadow-sm">Ctrl+Enter</kbd>
                  <span>để nộp / tiếp tục</span>
                </span>
              </div>

              <div className="flex gap-2">
                {!isSubmitted ? (
                  translateMode !== 'multiple-choice' && (
                  <button
                    id="sentence-submit-btn"
                    disabled={!userInput.trim()}
                    onClick={handleSubmitAnswer}
                    className={`px-6 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow cursor-pointer ${userInput.trim()
                      ? 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                      }`}
                  >
                    <span>Kiểm tra</span>
                    <ChevronRight size={14} />
                  </button>
                  )
                ) : (
                  <button
                    id="sentence-next-btn"
                    onClick={handleNextQuestion}
                    className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <span>{currentIdx + 1 === questions.length ? "Xem kết quả" : "Câu tiếp theo"}</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Results Card */
          <div className="bg-white border border-slate-200 p-8 rounded-2xl flex flex-col gap-6 text-center items-center shadow-lg relative" id="sentence-complete-card">
            <div className="p-4 bg-violet-50 text-violet-600 rounded-full border border-violet-100">
              <Award size={40} className="animate-bounce" />
            </div>

            <div>
              <span className="text-[10px] text-violet-600 font-bold uppercase tracking-widest bg-violet-50 px-2.5 py-1 rounded-full border border-violet-200">Hoàn tất luyện dịch</span>
              <h2 className="text-xl font-extrabold text-slate-800 mt-2.5">Bài luyện dịch câu kết thúc!</h2>
              <p className="text-xs text-slate-500 mt-1">Bạn đã hoàn thành bài dịch câu tiếng Trung.</p>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center justify-center my-1">
              <span className="text-xs text-slate-500 font-mono">Dịch chính xác:</span>
              <div className="text-6xl font-black font-mono text-slate-800 mt-1">
                {score} <span className="text-2xl text-slate-400 font-normal">/ {questions.length}</span>
              </div>
            </div>

            {/* Motivational text */}
            <div className="px-5 py-3 rounded-xl bg-slate-50 text-xs text-slate-600 max-w-sm border border-slate-200 leading-relaxed shadow-sm">
              {score === questions.length ? (
                <span className="text-emerald-700 font-semibold">Hoàn hảo! Bạn đã dịch đúng 100% tất cả các câu. Khả năng ghép câu của bạn rất xuất sắc!</span>
              ) : score >= Math.ceil(questions.length * 0.8) ? (
                <span className="text-emerald-600">Rất tốt! Bạn nắm vững hầu hết các mẫu câu. Hãy ôn lại các câu sai để hoàn thiện hơn.</span>
              ) : score >= Math.ceil(questions.length * 0.5) ? (
                <span className="text-amber-600">Khá tốt! Bạn có căn bản vững. Tiếp tục luyện tập để thành thạo hơn nhé!</span>
              ) : (
                <span className="text-rose-600">Đừng nản! Dịch câu cần thời gian luyện tập. Hãy đọc kỹ ví dụ trong Flashcards rồi thử lại nhé!</span>
              )}
            </div>

            {/* Wrong answers */}
            {wrongAnswers.length > 0 && (
              <div className="w-full text-left flex flex-col gap-2.5 bg-slate-50 border border-slate-200 p-4.5 rounded-2xl" id="sentence-failed-panel">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                  Các câu cần ôn lại ({wrongAnswers.length}):
                </span>
                <div className="flex flex-col gap-2 max-h-[240px] overflow-y-auto pr-1">
                  {wrongAnswers.map((q, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 p-3 rounded-lg flex flex-col gap-1.5 shadow-sm select-text text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono">{q.relatedWord}</span>
                        <span className="text-[10px] text-amber-600 font-mono">{q.relatedPinyin}</span>
                      </div>
                      <div className="text-xs text-slate-600">
                        <strong>Đề:</strong> {q.promptSentence}
                        {q.promptPinyin && (
                          <span className="block text-[11px] text-amber-600 font-mono mt-0.5">{q.promptPinyin}</span>
                        )}
                      </div>
                      <div className="text-xs text-emerald-600 font-semibold">
                        <strong className="text-slate-500 font-normal">Đáp án:</strong> {q.correctAnswer}
                        {q.correctAnswerPinyin && (
                          <span className="block text-[11px] text-amber-600 font-mono mt-0.5">{q.correctAnswerPinyin}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Replay triggers */}
            <div className="grid grid-cols-2 gap-3 w-full border-t border-slate-100 pt-5 mt-2">
              <button
                id="exit-sentence-complete"
                onClick={() => setQuizStarted(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer transition shadow-sm"
              >
                Chọn hướng dịch khác
              </button>
              <button
                id="replay-sentence-complete"
                onClick={generateQuiz}
                className="py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95"
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
