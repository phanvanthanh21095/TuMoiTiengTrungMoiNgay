import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Play, Pause, Square, ToggleLeft, ToggleRight, Sparkles, ChevronRight, BookOpen, Plus, Trash2, X, FileText } from 'lucide-react';

interface ReadingLine {
  chinese: string;
  pinyin: string;
  vietnamese: string;
}

interface PassageData {
  id: string;
  title: string;
  lines: ReadingLine[];
  isCustom?: boolean;
}

const DEFAULT_PASSAGES: PassageData[] = [
  {
    id: "passage-1",
    title: "Đoạn văn 1: Bạn tốt của tôi (我的好朋友)",
    lines: [
      { chinese: "我有一个很好的朋友。", pinyin: "Wǒ yǒu yí ge hěn hǎo de péngyou.", vietnamese: "Tôi có một người bạn rất tốt." },
      { chinese: "她的名字叫小梅。", pinyin: "Tā de míngzi shì Xiǎoméi.", vietnamese: "Tên của cô ấy là Tiểu Mỹ." },
      { chinese: "她又漂亮又聪明。", pinyin: "Tā yòu piàoliang yòu cōngmíng.", vietnamese: "Cô ấy vừa xinh đẹp vừa thông minh." },
      { chinese: "小梅喜欢学汉语，我也喜欢。", pinyin: "Xiǎoméi xǐhuan xué Hànyǔ, wǒ yě xǐhuan.", vietnamese: "Tiểu Mỹ thích học tiếng Trung, tôi cũng thích." },
      { chinese: "每天我跟她一起学习。", pinyin: "Měitiān wǒ gēn tā yìqǐ xuéxí.", vietnamese: "Mỗi ngày tôi cùng cô ấy học tập." },
      { chinese: "我们想去上海旅行。", pinyin: "Wǒmen xiǎng qù Shànghǎi lǚxíng.", vietnamese: "Chúng tôi muốn đi du lịch Thượng Hải." },
      { chinese: "小梅跟我说汉语不太难，我们一定会努力学习。", pinyin: "Xiǎoméi gēn wǒ shuō Hànyǔ bú tài nán, wǒmen yídìng huì nǔlì xuéxí.", vietnamese: "Tiểu Mỹ nói với tôi tiếng Trung không khó lắm, chúng tôi nhất định sẽ nỗ lực học tập." }
    ]
  },
  {
    id: "passage-2",
    title: "Đoạn văn 2: Giáo viên tiếng Trung (我的汉语老师)",
    lines: [
      { chinese: "我有一个很好的汉语老师。", pinyin: "Wǒ yǒu yí ge hěn hǎo de Hànyǔ lǎoshī.", vietnamese: "Tôi có một giáo viên tiếng Trung rất tốt." },
      { chinese: "我的老师是中国人。", pinyin: "Wǒ de lǎoshī shì Zhōngguó rén.", vietnamese: "Giáo viên của tôi là người Trung Quốc." },
      { chinese: "她又漂亮又善良。", pinyin: "Tā yòu piàoliang yòu shànliáng.", vietnamese: "Cô ấy vừa xinh đẹp vừa lương thiện." },
      { chinese: "她工作很努力。", pinyin: "Tā gōngzuò hěn nǔlì.", vietnamese: "Cô ấy làm việc rất nỗ lực." },
      { chinese: "她的课非常有趣。", pinyin: "Tā de kè fēicháng yǒuqù.", vietnamese: "Giờ học của cô ấy vô cùng thú vị." },
      { chinese: "我的老师经常教我们要努力 học tập。", pinyin: "Wǒ de lǎoshī jīngcháng jiāo wǒmen yào nǔlì xuéxí.", vietnamese: "Giáo viên của tôi thường dạy chúng tôi phải nỗ lực học tập." },
      { chinese: "我们班的同学都很喜欢她。", pinyin: "Wǒmen bān de tóngxué dōu hěn xǐhuan tā.", vietnamese: "Các bạn trong lớp của tôi đều rất thích cô ấy." },
      { chinese: "我希望她的生活永远幸福。", pinyin: "Wǒ xīwàng tā de shēnghuó yǒngyuǎn xìngfú.", vietnamese: "Tôi hy vọng cuộc sống của cô ấy mãi mãi hạnh phúc." }
    ]
  },
  {
    id: "passage-3",
    title: "Đoạn văn 3: Giới thiệu bản thân (自我介绍)",
    lines: [
      { chinese: "我是周梅兰，今年二十三岁。", pinyin: "Wǒ shì Zhōu Méilán, jīnnián èrshí sān suì.", vietnamese: "Tôi là Chu Mai Lan, năm nay 23 tuổi." },
      { chinese: "我是越南人。", pinyin: "Wǒ shì Yuènán rén.", vietnamese: "Tôi là người Việt Nam." },
      { chinese: "我的老家是河南，现在我家住在河内。", pinyin: "Wǒ de lǎojiā shì Hénán, xiànzài wǒ jiā zhù zài Hénèi.", vietnamese: "Quê của tôi ở Hà Nam, hiện tại gia đình tôi sống ở Hà Nội." },
      { chinese: "我家有四口人：爸爸，妈妈，妹妹和我。", pinyin: "Wǒ jiā yǒu sì kǒu rén: Bàba, māma, mèimei hé wǒ.", vietnamese: "Gia đình tôi có 4 người: Bố, mẹ, em gái và tôi." },
      { chinese: "我爸妈都是农民，妹妹还是个学生。", pinyin: "Wǒ bà mā dōu shì nóngmín, mèimei háishì ge xuésheng.", vietnamese: "Bố mẹ tôi đều là nông dân, em gái vẫn là học sinh." },
      { chinese: "我有很多有趣的爱好比如：听音乐，唱歌，旅游，看电影，……", pinyin: "Wǒ yǒu hěnduō yǒuqù de àihào bìrú: Tīng yīnyuè, chànggē, lǚyóu, kàn diànyǐng,......", vietnamese: "Tôi có nhiều sở thích thú vị như: nghe nhạc, hát, du lịch, xem phim,..." }
    ]
  }
];

export default function Reading() {
  const [passages, setPassages] = useState<PassageData[]>([]);
  const [selectedPassageIndex, setSelectedPassageIndex] = useState<number>(0);
  
  const [showPinyin, setShowPinyin] = useState<boolean>(true);
  const [showVietnamese, setShowVietnamese] = useState<boolean>(true);
  const [displayMode, setDisplayMode] = useState<'paragraph' | 'lines'>('paragraph');
  
  // Voices selection
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [pitch, setPitch] = useState<number>(1.0);
  const [rate, setRate] = useState<number>(0.85);

  // Playing sequence state
  const [isPlayingSeq, setIsPlayingSeq] = useState<boolean>(false);
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);
  
  // Add new custom passage state
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [rawTextLines, setRawTextLines] = useState<string>('');

  const seqTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load custom passages from LocalStorage and sync
  useEffect(() => {
    const saved = localStorage.getItem('study_chinese_passages_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPassages([...DEFAULT_PASSAGES, ...parsed]);
      } catch (e) {
        setPassages(DEFAULT_PASSAGES);
      }
    } else {
      setPassages(DEFAULT_PASSAGES);
    }
  }, []);

  const savePassages = (customPassages: PassageData[]) => {
    localStorage.setItem('study_chinese_passages_v1', JSON.stringify(customPassages));
    setPassages([...DEFAULT_PASSAGES, ...customPassages]);
  };

  const currentPassage = passages[selectedPassageIndex] || passages[0] || DEFAULT_PASSAGES[0];

  // Load voices on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        const zhVoices = availableVoices.filter(v => v.lang.startsWith('zh') || v.lang.includes('CN') || v.lang.includes('TW') || v.lang.includes('HK'));
        setVoices(availableVoices);
        
        if (zhVoices.length > 0) {
          setSelectedVoice(zhVoices[0].name);
        } else if (availableVoices.length > 0) {
          setSelectedVoice(availableVoices[0].name);
        }
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  const handleStop = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (seqTimeoutRef.current) {
      clearTimeout(seqTimeoutRef.current);
    }
    setIsPlayingSeq(false);
    setActiveLineIndex(null);
  };

  const speakLine = (line: ReadingLine, index: number, onEndCallback?: () => void) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert("Trình duyệt không hỗ trợ tổng hợp giọng nói!");
      return;
    }

    window.speechSynthesis.cancel();
    setActiveLineIndex(index);

    const utterance = new SpeechSynthesisUtterance(line.chinese);
    utterance.lang = 'zh-CN';

    const selectedVoiceObj = voices.find(v => v.name === selectedVoice);
    if (selectedVoiceObj) {
      utterance.voice = selectedVoiceObj;
    }

    utterance.pitch = pitch;
    utterance.rate = rate;

    utterance.onend = () => {
      if (onEndCallback) {
        onEndCallback();
      } else {
        setActiveLineIndex(null);
      }
    };

    utterance.onerror = () => {
      if (onEndCallback) {
        onEndCallback();
      } else {
        setActiveLineIndex(null);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const playSequence = (startIndex = 0) => {
    if (!currentPassage || !currentPassage.lines.length) return;
    setIsPlayingSeq(true);
    
    const playNext = (index: number) => {
      if (index >= currentPassage.lines.length) {
        handleStop();
        return;
      }
      
      speakLine(currentPassage.lines[index], index, () => {
        seqTimeoutRef.current = setTimeout(() => {
          playNext(index + 1);
        }, 1200);
      });
    };

    playNext(startIndex);
  };

  const toggleSequence = () => {
    if (isPlayingSeq) {
      handleStop();
    } else {
      playSequence(0);
    }
  };

  const handleAddPassage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !rawTextLines.trim()) {
      alert("Vui lòng điền đầy đủ tiêu đề và nội dung đoạn văn!");
      return;
    }

    // Parse input lines
    // Expecting format: Line 1 Chinese | Pinyin | Meaning (each sentence on new line)
    // Or try to intelligently split
    const inputLines = rawTextLines.split('\n').filter(l => l.trim() !== '');
    const lines: ReadingLine[] = [];

    inputLines.forEach(lineStr => {
      const parts = lineStr.split('|');
      if (parts.length >= 1) {
        lines.push({
          chinese: parts[0]?.trim() || '',
          pinyin: parts[1]?.trim() || '',
          vietnamese: parts[2]?.trim() || ''
        });
      }
    });

    if (lines.length === 0) {
      alert("Định dạng không hợp lệ. Vui lòng nhập ít nhất 1 dòng văn bản.");
      return;
    }

    const newPassage: PassageData = {
      id: `custom-${Date.now()}`,
      title: `Đoạn văn tự thêm: ${newTitle.trim()}`,
      lines,
      isCustom: true
    };

    const customOnly = passages.filter(p => p.isCustom);
    const updatedCustom = [...customOnly, newPassage];
    savePassages(updatedCustom);

    setNewTitle('');
    setRawTextLines('');
    setShowAddForm(false);
    setSelectedPassageIndex(passages.length); // Select newly added passage
  };

  const handleDeletePassage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc chắn muốn xóa đoạn văn tự thêm này?")) {
      handleStop();
      const customOnly = passages.filter(p => p.isCustom && p.id !== id);
      savePassages(customOnly);
      setSelectedPassageIndex(0);
    }
  };

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (seqTimeoutRef.current) {
        clearTimeout(seqTimeoutRef.current);
      }
    };
  }, []);

  const zhVoicesList = voices.filter(v => v.lang.startsWith('zh') || v.lang.includes('CN') || v.lang.includes('TW') || v.lang.includes('HK'));

  return (
    <div className="flex flex-col gap-6" id="reading-outer-wrapper">
      
      {/* Passage Selection List */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col gap-2">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <BookOpen size={14} className="text-indigo-600" />
            Danh Sách Đoạn Văn Ngắn
          </span>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1 bg-indigo-550 text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
          >
            <Plus size={12} />
            Tự thêm đoạn văn
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddPassage} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col gap-3 mt-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <FileText size={13} className="text-indigo-600" /> Nhập đoạn văn mới
              </h4>
              <button type="button" onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-slate-600">Tiêu đề đoạn văn:</span>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ví dụ: Giới thiệu gia đình tôi"
                className="bg-white text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-slate-600">Nội dung câu (Mỗi câu 1 dòng, định dạng: Chữ Hán | Pinyin | Nghĩa Việt):</span>
              <textarea
                value={rawTextLines}
                onChange={(e) => setRawTextLines(e.target.value)}
                placeholder="Ví dụ:&#13;我喜欢学汉语。| Wǒ xǐhuan xué Hànyǔ. | Tôi thích học tiếng Trung.&#13;汉语很有趣。| Hànyǔ hěn yǒuqù. | Tiếng Trung rất thú vị."
                rows={5}
                className="bg-white text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                required
              />
            </div>

            <button
              type="submit"
              className="py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow"
            >
              Thêm Đoạn Văn Này
            </button>
          </form>
        )}

        <div className="flex flex-wrap gap-2 mt-1">
          {passages.map((passage, idx) => (
            <button
              key={passage.id}
              onClick={() => {
                handleStop();
                setSelectedPassageIndex(idx);
              }}
              className={`px-4 py-3 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
                selectedPassageIndex === idx
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{passage.title}</span>
              {passage.isCustom && (
                <Trash2
                  size={12}
                  className={`shrink-0 ${selectedPassageIndex === idx ? 'text-indigo-200 hover:text-white' : 'text-slate-400 hover:text-rose-500'}`}
                  onClick={(e) => handleDeletePassage(passage.id, e)}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Reading Passage Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="reading-main-container">
        
        {/* Settings Sidebar (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* TTS Config */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col gap-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Sparkles size={14} className="text-amber-500" />
              Cấu hình giọng đọc
            </span>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Chọn giọng phát âm:</label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="bg-slate-50 text-xs text-slate-800 p-2.5 rounded-lg border border-slate-200 focus:outline-none cursor-pointer"
              >
                {zhVoicesList.length > 0 ? (
                  zhVoicesList.map((v, i) => (
                    <option key={i} value={v.name}>{v.name} ({v.lang})</option>
                  ))
                ) : (
                  voices.map((v, i) => (
                    <option key={i} value={v.name}>{v.name} ({v.lang})</option>
                  ))
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold">Tốc độ đọc: {rate}x</span>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.05"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold">Độ trầm bổng: {pitch}</span>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.05"
                  value={pitch}
                  onChange={(e) => setPitch(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Display Toggles */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2 mb-1">
              Tùy Chọn Hiển Thị
            </span>
            
            <div className="flex items-center justify-between py-1 text-xs font-medium text-slate-700">
              <span>Hiển thị phiên âm Pinyin</span>
              <button onClick={() => setShowPinyin(!showPinyin)} className="focus:outline-none cursor-pointer">
                {showPinyin ? <ToggleRight className="text-indigo-600 h-6 w-6" /> : <ToggleLeft className="text-slate-400 h-6 w-6" />}
              </button>
            </div>

            <div className="flex items-center justify-between py-1 text-xs font-medium text-slate-700 border-t border-slate-50 pt-2">
              <span>Hiển dịch nghĩa Tiếng Việt</span>
              <button onClick={() => setShowVietnamese(!showVietnamese)} className="focus:outline-none cursor-pointer">
                {showVietnamese ? <ToggleRight className="text-indigo-600 h-6 w-6" /> : <ToggleLeft className="text-slate-400 h-6 w-6" />}
              </button>
            </div>

            <div className="flex items-center justify-between py-1 text-xs font-medium text-slate-700 border-t border-slate-50 pt-2">
              <span>Dạng hiển thị</span>
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => setDisplayMode('paragraph')}
                  className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition ${displayMode === 'paragraph' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
                >
                  Đoạn văn
                </button>
                <button
                  onClick={() => setDisplayMode('lines')}
                  className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition ${displayMode === 'lines' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
                >
                  Từng dòng
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Passage Display Area (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Controls Bar */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{currentPassage.title}</h3>
              <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider mt-0.5">Luyện đọc lưu loát</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleSequence}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow cursor-pointer ${
                  isPlayingSeq
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                {isPlayingSeq ? <Pause size={14} /> : <Play size={14} />}
                <span>{isPlayingSeq ? 'Tạm Dừng' : 'Đọc Toàn Bộ'}</span>
              </button>

              {isPlayingSeq && (
                <button
                  onClick={handleStop}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 cursor-pointer transition"
                  title="Dừng đọc"
                >
                  <Square size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Reading Screen Bubble */}
          <div className="bg-slate-100/50 border border-slate-200 p-6 rounded-3xl shadow-inner min-h-[450px]">
            {displayMode === 'paragraph' ? (
              // Paragraph representation
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm text-slate-800 leading-relaxed font-sans select-text flex flex-wrap gap-x-2 gap-y-3">
                {currentPassage.lines.map((line, index) => {
                  const isActive = activeLineIndex === index;
                  return (
                    <span
                      key={index}
                      onClick={() => speakLine(line, index)}
                      className={`cursor-pointer px-1 rounded transition-all duration-200 border-b-2 hover:bg-indigo-50/50 ${
                        isActive
                          ? 'bg-indigo-100 border-indigo-500 text-indigo-900 font-bold scale-[1.02] shadow-sm'
                          : 'border-transparent text-slate-800'
                      }`}
                      title="Bấm để nghe đọc câu này"
                    >
                      <span className="text-lg tracking-wide">{line.chinese}</span>
                      {showPinyin && (
                        <span className="block text-[11px] font-mono text-amber-600 tracking-tight leading-none mt-0.5">
                          {line.pinyin}
                        </span>
                      )}
                      {showVietnamese && (
                        <span className="block text-[11px] text-slate-500 font-normal leading-tight mt-0.5">
                          {line.vietnamese}
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            ) : (
              // Line-by-line list representation (similar to chat, but centered/single-flow list without avatar characters)
              <div className="flex flex-col gap-4">
                {currentPassage.lines.map((line, index) => {
                  const isActive = activeLineIndex === index;
                  return (
                    <div
                      key={index}
                      onClick={() => speakLine(line, index)}
                      className={`p-4 rounded-2xl shadow-sm border transition-all duration-300 relative cursor-pointer select-text flex items-start gap-3 bg-white ${
                        isActive
                          ? 'bg-indigo-50 border-indigo-300 shadow-md ring-1 ring-indigo-200'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 border text-xs font-semibold ${
                        isActive ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {isActive ? <Volume2 size={13} className="animate-bounce" /> : index + 1}
                      </div>

                      <div className="flex-1">
                        <p className={`text-base tracking-wide font-sans ${isActive ? 'text-indigo-950 font-semibold' : 'text-slate-800'}`}>
                          {line.chinese}
                        </p>
                        {showPinyin && (
                          <p className="text-xs font-mono text-amber-600 tracking-wide mt-1">
                            {line.pinyin}
                          </p>
                        )}
                        {showVietnamese && (
                          <p className="text-xs text-slate-500 mt-1 border-t border-slate-100 pt-1">
                            {line.vietnamese}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
