import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, RotateCw, CheckCircle, XCircle, Star, Sparkles, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import { VocabularyWord } from '../types';

interface FlashcardsProps {
  words: VocabularyWord[];
  onUpdateWordStatus: (id: string, isCorrect: boolean) => void;
  onToggleFavorite: (id: string) => void;
}

export default function Flashcards({ words, onUpdateWordStatus, onToggleFavorite }: FlashcardsProps) {
  const [filter, setFilter] = useState<'all' | 'new' | 'learning' | 'mastered' | 'favorite'>('all');
  const [direction, setDirection] = useState<'character-first' | 'meaning-first'>('character-first');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Filter words
  const filteredWords = words.filter((word) => {
    if (filter === 'new') return word.status === 'new';
    if (filter === 'learning') return word.status === 'learning';
    if (filter === 'mastered') return word.status === 'mastered';
    if (filter === 'favorite') return !!word.favorite;
    return true;
  });

  // Reset index when filter changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [filter]);

  const activeWord = filteredWords[currentIndex];

  const handleSpeak = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!('speechSynthesis' in window)) {
      alert("Trình duyệt này không hỗ trợ phát âm (TTS)!");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.85; // slightly slower for clearer listening

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const speakActiveWord = (e?: React.MouseEvent) => {
    if (activeWord) {
      handleSpeak(activeWord.character, e);
    }
  };



  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (filteredWords.length === 0) return;
    setIsFlipped(false);
    // Add micro-delay to let the flip animation finish resetting before next card loads
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredWords.length);
    }, 150);
  };

  const handlePrev = () => {
    if (filteredWords.length === 0) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + filteredWords.length) % filteredWords.length);
    }, 150);
  };

  const handleResponse = (isCorrect: boolean) => {
    if (!activeWord) return;

    // Play correct/incorrect sound or visual reaction
    onUpdateWordStatus(activeWord.id, isCorrect);

    // Advance to next word
    if (filteredWords.length > 1) {
      handleNext();
    } else {
      setIsFlipped(false);
    }
  };

  // Listen for keyboard controls (Arrow keys, Spacebar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (filteredWords.length === 0) return;
      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        handlePrev();
      } else if (e.code === 'Digit1') {
        handleResponse(false); // Cần ôn lại
      } else if (e.code === 'Digit2') {
        handleResponse(true); // Đã thuộc
      } else if (e.code === 'KeyV' || e.code === 'KeyS') {
        speakActiveWord();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, filteredWords.length, activeWord, isFlipped]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto" id="flashcards-section">
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm" id="flashcard-filters">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            id="filter-all"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all duration-200 ${filter === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
          >
            Tất cả ({words.length})
          </button>
          <button
            id="filter-new"
            onClick={() => setFilter('new')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all duration-200 ${filter === 'new'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
          >
            Chưa thuộc ({words.filter(w => w.status === 'new').length})
          </button>
          <button
            id="filter-learning"
            onClick={() => setFilter('learning')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all duration-200 ${filter === 'learning'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
          >
            Đang học ({words.filter(w => w.status === 'learning').length})
          </button>
          <button
            id="filter-mastered"
            onClick={() => setFilter('mastered')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all duration-200 ${filter === 'mastered'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
          >
            Đã thuộc ({words.filter(w => w.status === 'mastered').length})
          </button>
          <button
            id="filter-fav"
            onClick={() => setFilter('favorite')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all duration-150 flex items-center gap-1 ${filter === 'favorite'
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-rose-50'
              }`}
          >
            <Star size={12} className={filter === 'favorite' ? 'fill-rose-500' : ''} />
            Đã thích ({words.filter(w => w.favorite).length})
          </button>
        </div>

        {/* Learning Direction Selector */}
        <div className="flex items-center gap-1.5" id="direction-controls">
          <button
            id="dir-char"
            onClick={() => { setDirection('character-first'); setIsFlipped(false); }}
            className={`p-1.5 rounded-lg text-xs font-medium cursor-pointer border ${direction === 'character-first'
              ? 'bg-slate-900 text-white border-slate-800'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-transparent'
              }`}
            title="Xem chữ Hán trước"
          >
            字 → Nghĩa
          </button>
          <button
            id="dir-mean"
            onClick={() => { setDirection('meaning-first'); setIsFlipped(false); }}
            className={`p-1.5 rounded-lg text-xs font-medium cursor-pointer border ${direction === 'meaning-first'
              ? 'bg-slate-900 text-white border-slate-800'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-transparent'
              }`}
            title="Xem nghĩa trước"
          >
            Nghĩa → 字
          </button>
        </div>
      </div>

      {filteredWords.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-slate-300 text-center gap-4 shadow-sm" id="empty-state">
          <div className="p-3 bg-slate-100 rounded-full text-slate-500">
            <BookOpen size={24} />
          </div>
          <div>
            <h3 className="text-slate-800 font-medium">Không có từ vựng nào</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              Không tìm thấy từ vựng khớp với bộ lọc bạn chọn. Thử thay đổi bộ lọc hoặc thêm từ vựng mới bên mục từ điển!
            </p>
          </div>
          {filter !== 'all' && (
            <button
              id="reset-filter"
              onClick={() => setFilter('all')}
              className="px-4 py-2 rounded-lg bg-slate-800 text-white text-xs font-medium hover:bg-slate-700 transition cursor-pointer shadow-md"
            >
              Xem tất cả từ vựng
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Progress Indicator */}
          <div className="flex items-center justify-between text-slate-500 text-xs px-1" id="flashcard-progress">
            <span className="font-mono">
              Thẻ: <strong className="text-slate-800">{currentIndex + 1}</strong> / {filteredWords.length}
            </span>
            <span className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${activeWord.status === 'mastered'
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : activeWord.status === 'learning'
                  ? 'bg-amber-50 text-amber-600 border border-amber-200'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}>
                {activeWord.status === 'mastered' ? 'Đã thuộc' : activeWord.status === 'learning' ? 'Đang học' : 'Từ mới'}
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 font-medium">{activeWord.category}</span>
            </span>
          </div>

          {/* Card Component with Flip Animation */}
          <div className="relative h-[400px] w-full perspective-1000 select-none cursor-pointer" onClick={handleFlip} id="card-touch-area">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <button
                id="btn-fav"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(activeWord.id);
                }}
                className={`p-2 rounded-full cursor-pointer transition-all duration-200 ${activeWord.favorite
                  ? 'text-rose-500 hover:text-rose-600'
                  : 'text-slate-400 hover:text-slate-600 bg-slate-100/50 hover:bg-slate-100'
                  }`}
                title={activeWord.favorite ? "Bỏ yêu thích" : "Yêu thích"}
              >
                <Star size={18} className={activeWord.favorite ? 'fill-rose-500' : ''} />
              </button>
              <button
                id="btn-audio"
                onClick={speakActiveWord}
                className={`p-2 rounded-full cursor-pointer transition-all duration-200 bg-slate-100/50 hover:bg-slate-100 ${isSpeaking ? 'text-amber-500' : 'text-slate-500 hover:text-slate-700'
                  }`}
                title="Nghe phát âm"
              >
                <Volume2 size={18} className={isSpeaking ? 'animate-pulse' : ''} />
              </button>
            </div>

            {/* FLIP CARD INNER ANCHOR */}
            <motion.div
              id="card-flip-inner"
              style={{ transformStyle: 'preserve-3d' }}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="relative w-full h-full"
            >
              {/* Card Front Side */}
              <div
                className="absolute w-full h-full backface-hidden flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                style={{ backfaceVisibility: 'hidden' }}
              >
                {/* Main front content depending on learning direction */}
                {direction === 'character-first' ? (
                  <div className="flex flex-col items-center gap-4">
                    <span className="text-8xl font-sans tracking-wide text-slate-800 mb-2 filter drop-shadow-sm">
                      {activeWord.character}
                    </span>
                    <span className="text-slate-500 text-xs font-medium flex items-center gap-1.5 mt-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                      <RotateCw size={12} className="animate-spin-slow text-amber-500" /> Bấm để lật xem phiên âm & nghĩa
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-center">
                    <span className="text-3xl font-medium text-emerald-600 tracking-tight leading-relaxed max-w-md">
                      {activeWord.definition}
                    </span>
                    <span className="text-slate-500 text-xs font-medium flex items-center gap-1.5 mt-4 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                      <RotateCw size={12} className="animate-spin-slow text-amber-500" /> Bấm để lật xem chữ Hán & Pinyin
                    </span>
                  </div>
                )}
              </div>

              {/* Card Back Side */}
              <div
                className="absolute w-full h-full flex flex-col items-center justify-between p-7 bg-white rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                {/* Header Back */}
                <span className="text-slate-400 text-xs tracking-wider uppercase font-mono mt-1 font-semibold">Nghĩa và Phiên âm</span>

                {/* Main back content depending on learning direction */}
                <div className="flex flex-col items-center text-center gap-3">
                  <span className="text-6xl font-semibold text-slate-800 tracking-wide mb-1">
                    {activeWord.character}
                  </span>

                  <span className="text-xl font-medium tracking-wide font-mono text-amber-600 bg-amber-50 px-4 py-1.5 rounded-xl border border-amber-200">
                    {activeWord.pinyin}
                  </span>

                  <span className="text-2xl font-semibold text-emerald-600 mt-1">
                    {activeWord.definition}
                  </span>
                </div>

                {/* Bottom Back - Sentence Suggestion */}
                {activeWord.exampleChinese ? (
                  <div className="w-full bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-left flex flex-col gap-1 select-text" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Ví dụ thực tế</span>
                      <button
                        id="btn-synth-example"
                        onClick={() => handleSpeak(activeWord.exampleChinese || '')}
                        className="p-1 rounded bg-white border border-slate-200 text-slate-500 hover:text-slate-800 transition shadow-sm"
                      >
                        <Volume2 size={12} />
                      </button>
                    </div>
                    <p className="text-slate-800 font-sans text-base tracking-wide mt-1 font-medium">{activeWord.exampleChinese}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{activeWord.exampleVietnamese}</p>
                  </div>
                ) : (
                  <div className="h-2"></div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Quick Stats & Help Indicators */}
          <div className="grid grid-cols-2 gap-3 text-slate-500 text-[11px] font-mono px-1 flex-1" id="flashcard-helper-stats">
            <span className="flex items-center gap-1">
              Đã trả lời đúng: <strong className="text-emerald-500 font-bold">{activeWord.correctCount}</strong> lần
            </span>
            <span className="text-right flex items-center justify-end gap-1">
              Đã sai: <strong className="text-rose-500 font-bold">{activeWord.incorrectCount}</strong> lần
            </span>
          </div>

          {/* Action Row Controls */}
          <div className="flex flex-col gap-4 mt-2" id="flashcard-actions">
            {/* Answer Controls */}
            <div className="grid grid-cols-2 gap-4">
              <button
                id="btn-wrong"
                onClick={() => handleResponse(false)}
                className="flex items-center justify-center gap-2.5 py-3 px-5 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-sm transition-all shadow-sm active:scale-95 cursor-pointer"
                title="Phím tắt: 1"
              >
                <XCircle size={18} />
                <span>Chưa thuộc (Phím 1)</span>
              </button>

              <button
                id="btn-right"
                onClick={() => handleResponse(true)}
                className="flex items-center justify-center gap-2.5 py-3 px-5 rounded-2xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold text-sm transition-all shadow-sm active:scale-95 cursor-pointer"
                title="Phím tắt: 2"
              >
                <CheckCircle size={18} />
                <span>Đã thuộc (Phím 2)</span>
              </button>
            </div>

            {/* Navigation Row Controls */}
            <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
              <button
                id="btn-prev"
                onClick={handlePrev}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 cursor-pointer hover:bg-slate-50 py-1.5 px-3.5 rounded-lg transition"
              >
                ← Thẻ trước
              </button>

              <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-mono shadow-sm">Space</kbd> Lật mặt
                <span className="text-slate-300">|</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-mono shadow-sm">← / →</kbd> Chuyển thẻ
              </div>

              <button
                id="btn-next"
                onClick={handleNext}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 cursor-pointer hover:bg-slate-50 py-1.5 px-3.5 rounded-lg transition"
              >
                Thẻ kế tiếp →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
