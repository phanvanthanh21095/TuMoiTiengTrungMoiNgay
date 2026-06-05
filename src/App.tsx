/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Languages,
  Keyboard,
  Plus,
  Search,
  Trash2,
  Edit3,
  Star,
  Bookmark,
  PenTool,
  Trophy,
  ChevronRight,
  Layers,
  Smile,
  RefreshCw,
  HelpCircle,
  FileSpreadsheet,
  Settings,
  Flame,
  CheckCircle,
  Sparkles,
  Palette,
  Eye,
  X,
  MessageSquare,
  FileText,
  Volume2,
  GraduationCap
} from 'lucide-react';

import { VocabularyWord } from './types';
import { INITIAL_VOCABULARY } from './data';
import Flashcards from './components/Flashcards';
import Quiz from './components/Quiz';
import WritingPad from './components/WritingPad';
import Dialogue from './components/Dialogue';
import Reading from './components/Reading';
import SentenceTranslation from './components/SentenceTranslation';
import Grammar from './components/Grammar';
import { convertNumberedPinyin } from './utils/pinyin';

export default function App() {
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [activeTab, setActiveTab] = useState<'flashcards' | 'quiz' | 'translate' | 'grammar' | 'dialogue' | 'reading' | 'dictionary'>(() => {
    const path = window.location.pathname.replace(/^\//, '');
    const tabOptions = ['flashcards', 'quiz', 'translate', 'grammar', 'dialogue', 'reading', 'dictionary'];
    if (path && tabOptions.includes(path)) {
      return path as 'flashcards' | 'quiz' | 'translate' | 'grammar' | 'dialogue' | 'reading' | 'dictionary';
    }
    const savedTab = localStorage.getItem('study_chinese_active_tab');
    if (savedTab && tabOptions.includes(savedTab)) {
      return savedTab as 'flashcards' | 'quiz' | 'translate' | 'grammar' | 'dialogue' | 'reading' | 'dictionary';
    }
    return 'flashcards';
  });

  useEffect(() => {
    localStorage.setItem('study_chinese_active_tab', activeTab);
    if (window.location.pathname !== `/${activeTab}`) {
      window.history.pushState(null, '', `/${activeTab}`);
    }
  }, [activeTab]);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\//, '');
      const tabOptions = ['flashcards', 'quiz', 'translate', 'grammar', 'dialogue', 'reading', 'dictionary'];
      if (path && tabOptions.includes(path)) {
        setActiveTab(path as 'flashcards' | 'quiz' | 'translate' | 'grammar' | 'dialogue' | 'reading' | 'dictionary');
      } else {
        setActiveTab('flashcards');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Search & Filter Dictionary State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Writing Pad display on Flashcards tab toggle
  const [showDraftPad, setShowDraftPad] = useState(true);

  // Form Word Add/Edit State
  const [isFormEditing, setIsFormEditing] = useState(false);
  const [editingWordId, setEditingWordId] = useState<string | null>(null);
  const [formHanzi, setFormHanzi] = useState('');
  const [formPinyin, setFormPinyin] = useState('');
  const [formDefinition, setFormDefinition] = useState('');
  const [formCategory, setFormCategory] = useState('Bài 0: Chào hỏi');
  const [formExampleChinese, setFormExampleChinese] = useState('');
  const [formExamplePinyin, setFormExamplePinyin] = useState('');
  const [formExampleVietnamese, setFormExampleVietnamese] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Statistics State
  const [streak, setStreak] = useState(1);

  // Load words from LocalStorage on mount
  useEffect(() => {
    // Helper function to assign unique IDs to a list of vocabulary words to prevent React key collision bugs
    const ensureUniqueIds = (list: VocabularyWord[]): VocabularyWord[] => {
      const seen = new Set<string>();
      return list.map((word, index) => {
        if (!word.id || seen.has(word.id)) {
          return {
            ...word,
            id: `vocab_${index}_${word.character}`
          };
        }
        seen.add(word.id);
        return word;
      });
    };

    const saved = localStorage.getItem('study_chinese_vocab_v1');
    if (saved) {
      try {
        const parsed: VocabularyWord[] = JSON.parse(saved);
        let hasChanges = false;

        // 1. Migrate old 'Bài 4' to 'Bài 1: Giới thiệu bản thân'
        let migrated = parsed.map(w => {
          if (w.category.trim().toLowerCase() === 'bài 4') {
            hasChanges = true;
            return { ...w, category: 'Bài 1: Giới thiệu bản thân' };
          }
          return w;
        });

        // 2. Merge missing words and update example sentence properties (e.g. examplePinyin) for existing default words
        INITIAL_VOCABULARY.forEach(defaultWord => {
          const existingIndex = migrated.findIndex(w => w.character === defaultWord.character && w.category === defaultWord.category);
          if (existingIndex === -1) {
            migrated.push(defaultWord);
            hasChanges = true;
          } else {
            const existing = migrated[existingIndex];
            if (existing.examplePinyin !== defaultWord.examplePinyin) {
              migrated[existingIndex] = {
                ...existing,
                examplePinyin: defaultWord.examplePinyin,
                exampleChinese: defaultWord.exampleChinese,
                exampleVietnamese: defaultWord.exampleVietnamese
              };
              hasChanges = true;
            }
          }
        });

        // 3. Ensure all loaded and merged words have unique IDs
        const cleanedMigrated = ensureUniqueIds(migrated);
        if (JSON.stringify(cleanedMigrated) !== JSON.stringify(migrated)) {
          hasChanges = true;
        }

        setWords(cleanedMigrated);
        if (hasChanges) {
          localStorage.setItem('study_chinese_vocab_v1', JSON.stringify(cleanedMigrated));
        }
      } catch (e) {
        const cleanedDefaults = ensureUniqueIds(INITIAL_VOCABULARY);
        setWords(cleanedDefaults);
        localStorage.setItem('study_chinese_vocab_v1', JSON.stringify(cleanedDefaults));
      }
    } else {
      const cleanedDefaults = ensureUniqueIds(INITIAL_VOCABULARY);
      setWords(cleanedDefaults);
      localStorage.setItem('study_chinese_vocab_v1', JSON.stringify(cleanedDefaults));
    }

    // Streak initialization
    const scoreStreak = localStorage.getItem('study_chinese_streak') || '1';
    setStreak(parseInt(scoreStreak));
  }, []);

  // Sync to localStorage
  const saveWordsToStorage = (updatedList: VocabularyWord[]) => {
    setWords(updatedList);
    localStorage.setItem('study_chinese_vocab_v1', JSON.stringify(updatedList));
  };

  // Toggle favorite tag
  const handleToggleFavorite = (id: string) => {
    const updated = words.map(w => {
      if (w.id === id) {
        return { ...w, favorite: !w.favorite };
      }
      return w;
    });
    saveWordsToStorage(updated);
  };

  // Update learner score count (Correct / Incorrect)
  const handleUpdateWordStatus = (id: string, isCorrect: boolean) => {
    const updated = words.map(w => {
      if (w.id === id) {
        const correctCount = isCorrect ? (w.correctCount || 0) + 1 : (w.correctCount || 0);
        const incorrectCount = !isCorrect ? (w.incorrectCount || 0) + 1 : (w.incorrectCount || 0);

        // Advance study status automatically
        let status = w.status;
        if (correctCount >= 3 && incorrectCount === 0) {
          status = 'mastered';
        } else if (correctCount > 0) {
          status = 'learning';
        } else {
          status = 'new';
        }

        return { ...w, correctCount, incorrectCount, status };
      }
      return w;
    });

    saveWordsToStorage(updated);

    // Increase quick streak count
    if (isCorrect) {
      setStreak(prev => {
        const nxt = prev + 1;
        localStorage.setItem('study_chinese_streak', nxt.toString());
        return nxt;
      });
    }
  };

  // Add / Edit submission
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formHanzi.trim() || !formPinyin.trim() || !formDefinition.trim()) {
      alert("Vui lòng điền đầy đủ Chữ Hán, Phiên âm và Nghĩa Việt!");
      return;
    }

    if (isFormEditing && editingWordId) {
      // Edit mode
      const updated = words.map(w => {
        if (w.id === editingWordId) {
          return {
            ...w,
            character: formHanzi.trim(),
            pinyin: formPinyin.trim(),
            definition: formDefinition.trim(),
            category: formCategory.trim() || 'Bài 0: Chào hỏi',
            exampleChinese: formExampleChinese.trim() || undefined,
            examplePinyin: formExamplePinyin.trim() || undefined,
            exampleVietnamese: formExampleVietnamese.trim() || undefined
          };
        }
        return w;
      });
      saveWordsToStorage(updated);
      setIsFormEditing(false);
      setEditingWordId(null);
    } else {
      // Create new mode
      const newWord: VocabularyWord = {
        id: Date.now().toString(),
        character: formHanzi.trim(),
        pinyin: formPinyin.trim(),
        definition: formDefinition.trim(),
        category: formCategory.trim() || 'Bài 0: Chào hỏi',
        exampleChinese: formExampleChinese.trim() || undefined,
        examplePinyin: formExamplePinyin.trim() || undefined,
        exampleVietnamese: formExampleVietnamese.trim() || undefined,
        correctCount: 0,
        incorrectCount: 0,
        status: 'new'
      };
      saveWordsToStorage([newWord, ...words]);
    }

    // Reset fields
    setFormHanzi('');
    setFormPinyin('');
    setFormDefinition('');
    setFormExampleChinese('');
    setFormExamplePinyin('');
    setFormExampleVietnamese('');
    setShowAddForm(false);
  };

  // Loader into edit form
  const handleLoadEdit = (word: VocabularyWord) => {
    setFormHanzi(word.character);
    setFormPinyin(word.pinyin);
    setFormDefinition(word.definition);
    setFormCategory(word.category);
    setFormExampleChinese(word.exampleChinese || '');
    setFormExamplePinyin(word.examplePinyin || '');
    setFormExampleVietnamese(word.exampleVietnamese || '');
    setEditingWordId(word.id);
    setIsFormEditing(true);
    setShowAddForm(true);

    // Smooth scroll to top wrapper form
    window.scrollTo({ top: 320, behavior: 'smooth' });
  };

  // Delete word from index
  const handleDeleteWord = (id: string) => {
    const wordToDelete = words.find(w => w.id === id);
    if (!wordToDelete) return;

    const confirmText = `Bạn có chắc chắn muốn xóa từ vựng "${wordToDelete.character}" (${wordToDelete.pinyin}) khỏi danh sách học tập không?`;
    if (window.confirm(confirmText)) {
      const filtered = words.filter(w => w.id !== id);
      saveWordsToStorage(filtered);
    }
  };

  // Reset entire vocabulary list to base template
  const handleRestoreDefaults = () => {
    if (window.confirm("Bạn có muốn đặt lại danh sách từ vựng về mặc định ban đầu không? Các từ mới do bạn thêm sẽ bị xóa.")) {
      const seen = new Set<string>();
      const cleaned = INITIAL_VOCABULARY.map((word, index) => {
        if (!word.id || seen.has(word.id)) {
          return {
            ...word,
            id: `vocab_${index}_${word.character}`
          };
        }
        seen.add(word.id);
        return word;
      });
      saveWordsToStorage(cleaned);
      localStorage.setItem('study_chinese_streak', '1');
      setStreak(1);
    }
  };

  // Text-to-Speech for dictionary words
  const [speakingWordId, setSpeakingWordId] = useState<string | null>(null);

  const handleSpeakChinese = (text: string, wordId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!('speechSynthesis' in window)) {
      alert("Trình duyệt này không hỗ trợ phát âm (TTS)!");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.85;

    utterance.onstart = () => setSpeakingWordId(wordId);
    utterance.onend = () => setSpeakingWordId(null);
    utterance.onerror = () => setSpeakingWordId(null);

    window.speechSynthesis.speak(utterance);
  };

  // Category values extractor (sorted by lesson number)
  const categoriesList = Array.from(new Set(words.map(w => w.category))).sort((a: any, b: any) => {
    const numA = parseInt(a.match(/\d+/)?.[0] || '999');
    const numB = parseInt(b.match(/\d+/)?.[0] || '999');
    return numA - numB;
  });

  // Accent/Diacritic remover helper for Vietnamese search
  const removeVietnameseTones = (str: string): string => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase();
  };

  // Search filter implementation
  const filteredDictionary = words.filter((word) => {
    const queryLower = searchQuery.toLowerCase();
    const normalizedQuery = removeVietnameseTones(searchQuery);

    const matchesCharacter = word.character.toLowerCase().includes(queryLower);
    const matchesPinyin = word.pinyin.toLowerCase().includes(queryLower);
    const matchesDefinition = removeVietnameseTones(word.definition).includes(normalizedQuery);

    const matchesKeyword = matchesCharacter || matchesPinyin || matchesDefinition;
    const matchesCategory = categoryFilter === 'all' || word.category === categoryFilter;

    return matchesKeyword && matchesCategory;
  });

  // Calculate learning metrics
  const totalWordsCount = words.length;
  const masteredCount = words.filter(w => w.status === 'mastered').length;
  const learningCount = words.filter(w => w.status === 'learning').length;
  const newCount = words.filter(w => w.status === 'new').length;
  const favoritedCount = words.filter(w => w.favorite).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500/20 selection:text-indigo-900 flex flex-col" id="main-application-canvas">

      {/* Decorative ambient top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-42 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Structural Layout Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur" id="app-top-header">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold tracking-tight shadow-md shadow-indigo-600/30 border border-indigo-500/20">
              漢
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
                Tiếng Trung
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-indigo-600 font-semibold">Tự Thảo & Đối thoại</span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 font-sans">Ứng dụng học thuộc lòng: Phiên âm Hán tự, Pinyin và Bộ từ vựng chi tiết</p>
            </div>
          </div>

          {/* Quick Streak info and reset links */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-xs font-bold" title="Số từ bấm trả lời đúng liên tiếp">
              <Flame size={14} className="fill-current animate-pulse text-amber-500" />
              <span>Chuỗi nhớ: {streak}</span>
            </div>

            <button
              id="restore-defaults-btn"
              onClick={handleRestoreDefaults}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium px-3.5 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-white transition cursor-pointer flex items-center gap-1 shadow-sm"
              title="Đặt lại toàn bộ từ vựng & thành tích"
            >
              <RefreshCw size={12} />
              Đặt lại gốc
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 py-6 flex flex-col gap-6 flex-1" id="dashboard-container">

        {/* Statistics progress cards bento-grid */}
        <section className="grid grid-cols-2 md:grid-cols-5 gap-3" id="stats-banner-bento">
          {/* Card Total */}
          <div className="bg-white border border-slate-200 p-3.5 rounded-2xl flex flex-col gap-1 shadow-sm">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest flex items-center gap-1">
              <BookOpen size={10} className="text-indigo-500" /> Bộ từ vựng
            </span>
            <span className="text-2xl font-bold text-slate-800">{totalWordsCount} <span className="text-xs font-normal text-slate-500">từ</span></span>
          </div>

          {/* Card Mastered */}
          <div className="bg-white border border-slate-200 p-3.5 rounded-2xl flex flex-col gap-1 shadow-sm">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Đã thuộc lo lau
            </span>
            <span className="text-2xl font-bold text-emerald-600">{masteredCount} <span className="text-xs font-normal text-slate-500">({totalWordsCount ? Math.round((masteredCount / totalWordsCount) * 100) : 0}%)</span></span>
          </div>

          {/* Card Learning */}
          <div className="bg-white border border-slate-200 p-3.5 rounded-2xl flex flex-col gap-1 shadow-sm">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span> Đang học thâm
            </span>
            <span className="text-2xl font-bold text-amber-500">{learningCount} <span className="text-xs font-normal text-slate-500">từ gõ</span></span>
          </div>

          {/* Card New */}
          <div className="bg-white border border-slate-200 p-3.5 rounded-2xl flex flex-col gap-1 shadow-sm">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span> Chờ học thêm
            </span>
            <span className="text-2xl font-bold text-blue-500">{newCount} <span className="text-xs font-normal text-slate-500">mới</span></span>
          </div>

          {/* Card Starred */}
          <div className="bg-white border border-slate-200 p-3.5 rounded-2xl flex-col gap-1 shadow-sm hidden md:flex col-span-1">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest flex items-center gap-1">
              <Star size={10} className="fill-rose-500 text-rose-500" /> Bộ đánh dấu
            </span>
            <span className="text-2xl font-bold text-rose-500">{favoritedCount} <span className="text-xs font-normal text-slate-500">ưa thích</span></span>
          </div>
        </section>

        {/* Primary Dashboard Study-Play Mode Tabs */}
        <section className="flex items-center justify-between border-b border-slate-200 pb-3" id="navigation-tabs-container">
          <div className="flex items-center gap-2 flex-wrap" id="nav-pills">
            <button
              id="tab-flashcards"
              onClick={() => setActiveTab('flashcards')}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition cursor-pointer ${activeTab === 'flashcards'
                ? 'bg-indigo-600 text-white shadow hover:bg-indigo-700'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              <Layers size={14} />
              <span>Học Flashcards ghép Thử viết</span>
            </button>

            <button
              id="tab-quiz"
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition cursor-pointer ${activeTab === 'quiz'
                ? 'bg-indigo-600 text-white shadow hover:bg-indigo-700'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              <Keyboard size={14} />
              <span>Luyện Gõ & Trắc nghiệm</span>
            </button>

            <button
              id="tab-dialogue"
              onClick={() => setActiveTab('dialogue')}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition cursor-pointer ${activeTab === 'dialogue'
                ? 'bg-indigo-600 text-white shadow hover:bg-indigo-700'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              <MessageSquare size={14} />
              <span>Đối thoại / Hội thoại</span>
            </button>

            <button
              id="tab-reading"
              onClick={() => setActiveTab('reading')}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition cursor-pointer ${activeTab === 'reading'
                ? 'bg-indigo-600 text-white shadow hover:bg-indigo-700'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              <FileText size={14} />
              <span>Đoạn văn ngắn</span>
            </button>

            <button
              id="tab-translate"
              onClick={() => setActiveTab('translate')}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition cursor-pointer ${activeTab === 'translate'
                ? 'bg-indigo-600 text-white shadow hover:bg-indigo-700'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              <Languages size={14} />
              <span>Dịch Câu</span>
            </button>

            <button
              id="tab-grammar"
              onClick={() => setActiveTab('grammar')}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition cursor-pointer ${activeTab === 'grammar'
                ? 'bg-indigo-600 text-white shadow hover:bg-indigo-700'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              <GraduationCap size={14} />
              <span>Ngữ Pháp</span>
            </button>

            <button
              id="tab-dictionary"
              onClick={() => setActiveTab('dictionary')}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition cursor-pointer ${activeTab === 'dictionary'
                ? 'bg-indigo-600 text-white shadow hover:bg-indigo-700'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              <BookOpen size={14} />
              <span>Sổ Từ Vựng</span>
            </button>
          </div>
        </section>

        {/* Dynamic Display of Modules */}
        <section id="workspace-payload">
          {activeTab === 'flashcards' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="flashcards-tab-container">

              {/* Flashcard Slider deck (takes 7 columns in grid) */}
              <div className="lg:col-span-7 flex flex-col gap-1.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Bộ học bính âm và nghĩa</span>
                  <button
                    id="toggle-draftpad-btn"
                    onClick={() => setShowDraftPad(!showDraftPad)}
                    className="text-[11px] font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-1 py-1.5 px-3 rounded-lg border border-slate-200 bg-white cursor-pointer transition shadow-sm"
                  >
                    <PenTool size={11} />
                    <span>{showDraftPad ? 'Ẩn bảng tập viết chữ' : 'Hiện bảng tập viết chữ'}</span>
                  </button>
                </div>

                <Flashcards
                  words={words}
                  onToggleFavorite={handleToggleFavorite}
                  onUpdateWordStatus={handleUpdateWordStatus}
                />
              </div>

              {/* Calligraphy Brush stroke Pad (takes 5 columns in grid) */}
              {showDraftPad && (
                <div className="lg:col-span-5 flex flex-col gap-2">
                  <div className="px-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                      <span>Bàn luyện viết bổ trợ</span>
                    </span>
                  </div>

                  {/* Provide the active character on the current deck as tracing visual, if any words exist */}
                  <WritingPad
                    traceWord={
                      words.length > 0
                        ? words[0]?.character || '' // fallback to some word or handle inside
                        : ''
                    }
                  />

                  <div className="p-3 bg-white border border-slate-200 text-[10px] text-slate-600 rounded-xl leading-relaxed shadow-sm">
                    💡 <strong>Hướng dẫn tập viết:</strong> Nhìn vào thẻ Hán tự bên trái, rê chuột hoặc vuốt ngón tay lên khung lưới đỏ để tô từng nét. Bạn có thể bật <strong>"Hiện chữ in mờ"</strong> để xem cấu trúc đối xứng phân cực trước khi tự viết.
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'quiz' && (
            <div className="py-4" id="quiz-tab-container">
              <Quiz
                words={words}
                onUpdateWordStatus={handleUpdateWordStatus}
              />
            </div>
          )}

          {activeTab === 'translate' && (
            <div className="py-4" id="translate-tab-container">
              <SentenceTranslation
                words={words}
              />
            </div>
          )}

          {activeTab === 'grammar' && (
            <div className="py-4" id="grammar-tab-container">
              <Grammar />
            </div>
          )}

          {activeTab === 'dialogue' && (
            <div className="py-4" id="dialogue-tab-container">
              <Dialogue />
            </div>
          )}

          {activeTab === 'reading' && (
            <div className="py-4" id="reading-tab-container">
              <Reading />
            </div>
          )}

          {activeTab === 'dictionary' && (
            <div className="flex flex-col gap-6" id="dictionary-tab-container">

              {/* Split layout: Add/Edit word form and search box */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Search, Filter Lexicon list (7 cols) */}
                <div className="lg:col-span-7 flex flex-col gap-4">

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm" id="dictionary-query-bar">

                    {/* Search Field */}
                    <div className="relative w-full sm:w-auto flex-1">
                      <Search className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        id="dic-search-input"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm theo chữ Hán, Pinyin hoặc Nghĩa Việt..."
                        className="w-full bg-slate-50 pl-10 pr-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none border border-slate-200 focus:border-indigo-500 transition placeholder-slate-400 text-slate-900"
                      />
                    </div>

                    {/* Filter Category dropdown */}
                    <div className="w-full sm:w-auto">
                      <select
                        id="dic-filter-category"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-xs border border-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer text-ellipsis overflow-hidden"
                      >
                        <option value="all">Sổ từ: Mọi phân loại</option>
                        {categoriesList.map((cat, i) => (
                          <option key={i} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Add new toggle button */}
                    <button
                      id="toggle-add-form-btn"
                      onClick={() => {
                        setIsFormEditing(false);
                        setEditingWordId(null);
                        setFormHanzi('');
                        setFormPinyin('');
                        setFormDefinition('');
                        setFormExampleChinese('');
                        setFormExampleVietnamese('');
                        setShowAddForm(!showAddForm);
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer transition flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <Plus size={14} />
                      <span>{showAddForm ? 'Đóng form nhập' : 'Thêm từ mới'}</span>
                    </button>
                  </div>

                  {/* Add / Edit Word Form inline */}
                  {showAddForm && (
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col gap-4 shadow-xl" id="add-word-form-panel">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <Plus size={15} className="text-indigo-500" />
                          {isFormEditing ? `Đang chỉnh sửa từ vựng: "${formHanzi}"` : 'Thêm từ vựng mới vào giáo trình'}
                        </h3>
                        <button
                          id="close-form-panel"
                          onClick={() => setShowAddForm(false)}
                          className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </div>

                      <form onSubmit={handleSubmitForm} className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                          {/* Chinese Char */}
                          <div className="flex flex-col gap-1.5">
                            <label htmlFor="form-hanzi" className="text-xs font-semibold text-slate-600">Chữ Hán (Ký tự tiếng Trung): <span className="text-rose-500">*</span></label>
                            <input
                              id="form-hanzi"
                              type="text"
                              required
                              value={formHanzi}
                              onChange={(e) => setFormHanzi(e.target.value)}
                              placeholder="Ví dụ: 说"
                              className="bg-slate-50 text-xs text-slate-900 p-3 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          {/* Pinyin with Auto Tone Conversion */}
                          <div className="flex flex-col gap-1.5">
                            <label htmlFor="form-pinyin" className="text-xs font-semibold text-slate-600">
                              Phiên âm Pinyin: <span className="text-rose-500">*</span>
                            </label>
                            <input
                              id="form-pinyin"
                              type="text"
                              required
                              value={formPinyin}
                              onChange={(e) => {
                                // Dynamic auto corrector of numbers to accents as they types
                                const val = e.target.value;
                                const converted = convertNumberedPinyin(val);
                                setFormPinyin(converted);
                              }}
                              placeholder="Ví dụ: shuō (gõ 'shuo1')"
                              className="bg-slate-50 text-xs text-slate-900 p-3 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                            />
                            <span className="text-[10px] text-slate-500">Mẹo: gõ bính âm dạng số như "na4" hoặc "hao3" để tự điền đấu chuẩn.</span>
                          </div>

                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                          {/* Definition */}
                          <div className="flex flex-col gap-1.5">
                            <label htmlFor="form-definition" className="text-xs font-semibold text-slate-600">Nghĩa Tiếng Việt: <span className="text-rose-500">*</span></label>
                            <input
                              id="form-definition"
                              type="text"
                              required
                              value={formDefinition}
                              onChange={(e) => setFormDefinition(e.target.value)}
                              placeholder="Ví dụ: nói"
                              className="bg-slate-50 text-xs text-slate-900 p-3 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          {/* Category select dropdown */}
                          <div className="flex flex-col gap-1.5">
                            <label htmlFor="form-category" className="text-xs font-semibold text-slate-600">Phân Loại / Chương Học:</label>
                            <select
                              id="form-category"
                              value={formCategory}
                              onChange={(e) => setFormCategory(e.target.value)}
                              className="bg-slate-50 text-xs text-slate-900 p-3 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                            >
                              {categoriesList.map((cat, i) => (
                                <option key={i} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </div>

                        </div>

                        {/* Practical example sentences (optional) */}
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-3">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Mẫu câu ví dụ thực tế (Không bắt buộc)</span>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] text-slate-500">Câu tiếng Trung:</span>
                              <input
                                id="form-ex-cn"
                                type="text"
                                value={formExampleChinese}
                                onChange={(e) => setFormExampleChinese(e.target.value)}
                                placeholder="Ví dụ: 请慢一点说。"
                                className="bg-white text-xs text-slate-900 p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                              />
                            </div>

                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] text-slate-500">Phiên âm Pinyin:</span>
                              <input
                                id="form-ex-py"
                                type="text"
                                value={formExamplePinyin}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const converted = convertNumberedPinyin(val);
                                  setFormExamplePinyin(converted);
                                }}
                                placeholder="Ví dụ: Qǐng màn yìdiǎn shuō."
                                className="bg-white text-xs text-slate-900 p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                              />
                            </div>

                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] text-slate-500">Dịch nghĩa câu:</span>
                              <input
                                id="form-ex-vn"
                                type="text"
                                value={formExampleVietnamese}
                                onChange={(e) => setFormExampleVietnamese(e.target.value)}
                                placeholder="Ví dụ: Xin vui lòng nói chậm hơn một chút."
                                className="bg-white text-xs text-slate-900 p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                          <button
                            id="reset-form-btn"
                            type="button"
                            onClick={() => {
                              setFormHanzi('');
                              setFormPinyin('');
                              setFormDefinition('');
                              setFormExampleChinese('');
                              setFormExamplePinyin('');
                              setFormExampleVietnamese('');
                            }}
                            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                          >
                            Xóa trắng nháp
                          </button>

                          <button
                            id="submit-form-btn"
                            type="submit"
                            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer transition active:scale-95"
                          >
                            {isFormEditing ? 'Lưu thay đổi' : 'Thêm từ này'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* List of Words */}
                  <div className="flex flex-col gap-2.5" id="lexicon-deck">
                    <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-mono">
                      <span>Bộ tìm kiếm cho kết quả: <strong>{filteredDictionary.length}</strong> từ vựng</span>
                      <span>Tổng toàn bộ: {words.length} từ</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5" id="lexicon-grid-scroll">
                      {filteredDictionary.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                          Không tìm thấy từ vựng khớp với bộ lọc hoặc từ tìm kiếm của bạn. Hãy thử gõ từ khác!
                        </div>
                      ) : (
                        filteredDictionary.map((word) => (
                          <div
                            key={word.id}
                            className="bg-white hover:bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between gap-4 transition group relative shadow-sm select-text"
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              {/* Hanzi sign */}
                              <div className="h-12 min-w-12 px-2 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 text-2xl font-sans tracking-wide shrink-0 whitespace-nowrap">
                                {word.character}
                              </div>

                              {/* Pinyin and Vietnamese meanings */}
                              <div className="flex flex-col gap-0.5 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono text-sm font-bold text-amber-600 tracking-wide">{word.pinyin}</span>
                                  <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.2 rounded font-sans tracking-tight">{word.category}</span>
                                  {word.favorite && (
                                    <Star size={11} className="fill-rose-500 text-rose-500 shrink-0" />
                                  )}
                                </div>
                                <span className="text-slate-700 font-medium text-xs sm:text-sm truncate max-w-sm" title={word.definition}>{word.definition}</span>
                              </div>
                            </div>

                            {/* Option actions */}
                            <div className="flex items-center gap-2 shrink-0">

                              {/* Study indicator badge */}
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border hidden sm:inline-block ${word.status === 'mastered'
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                : word.status === 'learning'
                                  ? 'bg-amber-50 text-amber-600 border-amber-200'
                                  : 'bg-slate-100 text-slate-500 border-slate-200'
                                }`}>
                                {word.status === 'mastered' ? 'Đã thuộc' : word.status === 'learning' ? 'Đang học' : 'Mới tinh'}
                              </span>

                              <button
                                id={`speak-dic-${word.id}`}
                                onClick={(e) => handleSpeakChinese(word.character, word.id, e)}
                                className={`p-1.8 rounded-lg cursor-pointer hover:bg-slate-100 transition ${speakingWordId === word.id ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'
                                  }`}
                                title="Nghe phát âm"
                              >
                                <Volume2 size={14} className={speakingWordId === word.id ? 'animate-pulse' : ''} />
                              </button>

                              <button
                                id={`fav-dic-${word.id}`}
                                onClick={() => handleToggleFavorite(word.id)}
                                className={`p-1.8 rounded-lg cursor-pointer hover:bg-slate-100 transition ${word.favorite ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'
                                  }`}
                                title="Đánh dấu ưa chuộng"
                              >
                                <Star size={14} className={word.favorite ? 'fill-rose-500' : ''} />
                              </button>

                              <button
                                id={`edit-dic-${word.id}`}
                                onClick={() => handleLoadEdit(word)}
                                className="p-1.8 rounded-lg text-slate-400 hover:text-indigo-600 cursor-pointer hover:bg-slate-100 transition"
                                title="Sửa chi tiết từ này"
                              >
                                <Edit3 size={14} />
                              </button>

                              <button
                                id={`del-dic-${word.id}`}
                                onClick={() => handleDeleteWord(word.id)}
                                className="p-1.8 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer hover:bg-slate-100 transition"
                                title="Xóa từ khỏi danh sách"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                  </div>
                </div>

                {/* Left/Right Sidebar explaining Chapter Grammar and Photos context (5 cols) */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col gap-4 shadow-sm" id="grammar-summary">
                    {categoryFilter === 'Bài 2: Thời gian' ? (
                      <>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2">
                          <FileSpreadsheet size={14} className="text-amber-500" />
                          Ngữ pháp Trọng Điểm - Bài 2: Thời gian
                        </span>

                        <div className="flex flex-col gap-4 text-xs text-slate-600 leading-relaxed" id="grammar-docs-content">
                          <div className="flex flex-col gap-1">
                            <strong className="text-slate-900">1. Cách nói Thứ trong tuần (星期 + Số):</strong>
                            <p>Dùng từ "星期" (xīngqī) kết hợp với các số từ 1 đến 6 để chỉ các thứ từ thứ Hai đến thứ Bảy. Chủ Nhật dùng "星期天" (xīngqītiān) hoặc "星期日" (xīngqīrì).</p>
                            <p className="font-semibold text-amber-600 font-mono mt-0.5">Ví dụ: 星期一 (Thứ Hai), 星期六 (Thứ Bảy), 星期天 (Chủ Nhật)</p>
                          </div>

                          <div className="flex flex-col gap-1 border-t border-slate-100 pt-2.5">
                            <strong className="text-slate-900">2. Cấu trúc nói Thứ, Ngày, Tháng, Năm:</strong>
                            <p>Tiếng Trung nói từ đơn vị lớn đến nhỏ: Năm (年 nián) → Tháng (月 yuè) → Ngày/Mồng (号 hào / 日 rì) → Thứ (星期 xīngqī).</p>
                            <p className="font-semibold text-amber-600 font-mono mt-0.5">Ví dụ: 2026年5月26号 (Ngày 26 tháng 5 năm 2026)</p>
                          </div>

                          <div className="flex flex-col gap-1 border-t border-slate-100 pt-2.5">
                            <strong className="text-slate-900">3. Vị trí của trạng từ chỉ thời gian:</strong>
                            <p>Trạng ngữ chỉ thời gian có thể đứng trước chủ ngữ hoặc ngay sau chủ ngữ để xác định mốc thời gian của hành động.</p>
                            <p className="font-semibold text-amber-600 font-mono mt-0.5">Ví dụ: 今天我没去公司。 (Hôm nay tôi không đến công ty.)</p>
                          </div>

                          <div className="flex flex-col gap-1 border-t border-slate-100 pt-2.5">
                            <strong className="text-slate-900">4. Phân biệt "小时" (tiếng/giờ) và "点" (giờ mốc):</strong>
                            <p><strong className="text-slate-900">点 (diǎn)</strong> dùng để nói giờ trên đồng hồ (bây giờ là mấy giờ); <strong className="text-slate-900">小时 (xiǎoshí)</strong> dùng để nói về lượng thời gian (học trong mấy tiếng).</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2">
                          <FileSpreadsheet size={14} className="text-amber-500" />
                          Ngữ pháp Trọng Điểm - Bài 1
                        </span>

                        <div className="flex flex-col gap-4 text-xs text-slate-600 leading-relaxed" id="grammar-docs-content">
                          <div className="flex flex-col gap-1">
                            <strong className="text-slate-900">1. Trợ từ từ hỏi 吗 (ma):</strong>
                            <p>Đặt cuối câu trần thuật để biến câu đó thành câu nghi vấn có-không. Thường dịch là "chăng, phải không, hả?".</p>
                            <p className="font-semibold text-amber-600 font-mono mt-0.5">Ví dụ: 你是学生吗？ (Bạn là học sinh phải không?)</p>
                          </div>

                          <div className="flex flex-col gap-1 border-t border-slate-100 pt-2.5">
                            <strong className="text-slate-900">2. Phó từ cũng 也 (yě):</strong>
                            <p>Đứng trước động từ biểu thị hành động tương đồng với chủ thể khác. Không đứng đầu câu.</p>
                            <p className="font-semibold text-amber-600 font-mono mt-0.5">Ví dụ: 我也是越南人。 (Tôi cũng là người Việt Nam.)</p>
                          </div>

                          <div className="flex flex-col gap-1 border-t border-slate-100 pt-2.5">
                            <strong className="text-slate-900">3. Động từ sở hữu 有 (yǒu):</strong>
                            <p>Biểu thị sự chiếm hữu, sở hữu hoặc tồn tại. Phủ định của <strong className="text-rose-500">有</strong> bắt buộc dùng <strong className="text-rose-500">没有</strong> (không được dùng 不有).</p>
                            <p className="font-semibold text-amber-600 font-mono mt-0.5">Ví dụ: 我没有汉语老师。 (Tôi không có giáo viên tiếng Trung.)</p>
                          </div>

                          <div className="flex flex-col gap-1 border-t border-slate-100 pt-2.5">
                            <strong className="text-slate-900">4. Đại từ chỉ định 这 (đây) vs 那 (kia):</strong>
                            <p><strong className="text-slate-900">这 (zhè)</strong> dùng để chỉ người/vật ở khoảng cách gần người nói; <strong className="text-slate-900">那 (nà)</strong> chỉ người/vật ở xa.</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-3">
                    <Sparkles className="text-indigo-600 shrink-0 mt-0.5" size={16} />
                    <div className="text-xs text-slate-600 leading-relaxed">
                      <strong className="text-slate-900 block mb-1">Cập nhật giáo trình dễ dàng</strong>
                      Bạn có thể bổ sung thêm bất kỳ từ mới nào chụp từ sách hoặc tài liệu học ngoại khóa. Chỉ cần nhập bính âm có số thanh điệu (e.g. `geng4`), hệ thống sẽ tự động căn chỉnh và lưu trữ an toàn trong ví điện tử của trình duyệt của bạn!
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}
        </section>

      </main>

      {/* Styled Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 text-slate-500 text-[11px] text-center py-7 mt-8" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>THIẾT KẾ ĐẶC QUYỀN TRÊN NỀN TẢNG PVT</span>
          <span>© 2026 Học thuộc lòng Tiếng Trung. Bản quyền thuộc về Phan Văn Thành. Biểu trưng bởi phác đồ nét vẽ 田字格</span>
        </div>
      </footer>

    </div>
  );
}
