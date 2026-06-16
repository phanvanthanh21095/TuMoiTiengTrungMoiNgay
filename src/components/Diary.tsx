import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Play, Pause, Trash2, Plus, X, ChevronRight, FileText, Calendar, Edit3 } from 'lucide-react';

interface DiaryLine {
  chinese: string;
  pinyin: string;
  vietnamese: string;
}

interface DiaryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title: string; // e.g. "Thứ 3 ngày 16/6/2026"
  lines: DiaryLine[];
}

const SEED_DIARY: DiaryEntry = {
  id: "diary-seed-1",
  date: "2026-06-16",
  title: "Thứ 3 ngày 16/6/2026",
  lines: [
    {
      chinese: "今天是2026年6月16日，星期二。这是我第一次用中文记录这段回忆。",
      pinyin: "Jīntiān shì èr líng èr liù nián liù yuè shí liù rì, xīngqī'èr. Zhè shì wǒ dì yī cì yòng Zhōngwén jìlù zhè duàn huíyì.",
      vietnamese: "Hôm nay là thứ Ba, ngày 16 tháng 6 năm 2026. Đây là lần đầu tiên tôi dùng tiếng Trung để ghi lại kỷ niệm này."
    },
    {
      chinese: "我早上四点半起床。起床以后，我洗漱和吃早饭。",
      pinyin: "Wǒ zǎoshang sì diǎn bàn qǐchuáng. Qǐchuáng yǐhòu, wǒ xǐshù hé chī zǎofàn.",
      vietnamese: "Tôi thức dậy lúc 4 giờ rưỡi sáng. Sau khi thức dậy, tôi vệ sinh cá nhân và ăn sáng."
    },
    {
      chinese: "早上七点，我睡了一会觉。早上八点，我起床学习中文。",
      pinyin: "Zǎoshang qī diǎn, wǒ shuì le yíhuìr jiào. Zǎoshang bā diǎn, wǒ qǐchuáng xuéxí Zhōngwén.",
      vietnamese: "7 giờ sáng, tôi chợp mắt ngủ một lát. 8 giờ sáng, tôi thức dậy học tiếng Trung."
    },
    {
      chinese: "我学习中文已经大约一个月了。",
      pinyin: "Wǒ xuéxí Zhōngwén yǐjīng dàyuē yí ge yuè le.",
      vietnamese: "Tôi học tiếng Trung đã được khoảng một tháng rồi."
    },
    {
      chinese: "大家好！",
      pinyin: "Dàjiā hǎo!",
      vietnamese: "Chào mọi người!"
    },
    {
      chinese: "下午我继续学习。",
      pinyin: "Xiàwǔ wǒ jìxù xuéxí.",
      vietnamese: "Buổi chiều tôi tiếp tục học tập."
    },
    {
      chinese: "下午六点，我洗漱和吃晚饭。吃饭的时候，我和家人一起聊天。",
      pinyin: "Xiàwǔ liù diǎn, wǒ xǐshù hé chī wǎnfàn. Chīfàn de shíhou, wǒ hé jiārén yìqǐ liáotiān.",
      vietnamese: "6 giờ chiều, tôi vệ sinh cá nhân và ăn tối. Lúc ăn cơm, tôi cùng gia đình trò chuyện."
    },
    {
      chinese: "晚上八点，我去家附近的杂货店买一点东西。我一共花了三万四千越南盾。",
      pinyin: "Wǎnshang bā diǎn, wǒ qù jiā fùjìn de záhuòdiàn mǎi yìdiǎn dōngxi. Wǒ yígòng huā le sān wàn sì qiān Yuènán dùn.",
      vietnamese: "8 giờ tối, tôi đi đến cửa hàng tạp hóa gần nhà mua một ít đồ. Tôi đã tiêu tổng cộng 34.000 đồng Việt Nam."
    },
    {
      chinese: "以后，我休息和看社交网络。",
      pinyin: "Yǐhòu, wǒ xiūxi hé kàn shèjiāo wǎngluò.",
      vietnamese: "Sau đó, tôi nghỉ ngơi và xem mạng xã hội."
    },
    {
      chinese: "晚上九点，我继续学习大约一个小时。",
      pinyin: "Wǎnshang jiǔ diǎn, wǒ jìxù xuéxí dàyuē yí ge xiǎoshí.",
      vietnamese: "9 giờ tối, tôi tiếp tục học khoảng một tiếng."
    },
    {
      chinese: "晚上十点，我给朋友发短信。",
      pinyin: "Wǎnshang shí diǎn, wǒ gěi péngyou fā duǎnxìn.",
      vietnamese: "10 giờ tối, tôi gửi tin nhắn cho bạn bè."
    },
    {
      chinese: "晚上十点半，我睡觉。",
      pinyin: "Wǎnshang shí diǎn bàn, wǒ shuìjiào.",
      vietnamese: "10 giờ rưỡi tối, tôi đi ngủ."
    },
    {
      chinese: "结束了一天的工作 and 学习。",
      pinyin: "Jiéshù le yì tiān de gōngzuò hé xuéxí.",
      vietnamese: "Kết thúc một ngày làm việc và học tập."
    }
  ]
};

// Clean up standard Chinese translation slightly
SEED_DIARY.lines[12].chinese = "结束了一天的工作和学习。";

export default function Diary() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [selectedEntryIndex, setSelectedEntryIndex] = useState<number>(0);

  const [showPinyin, setShowPinyin] = useState<boolean>(true);
  const [showVietnamese, setShowVietnamese] = useState<boolean>(true);
  const [displayMode, setDisplayMode] = useState<'paragraph' | 'lines'>('paragraph');

  // TTS Voice state
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [pitch, setPitch] = useState<number>(1.0);
  const [rate, setRate] = useState<number>(0.85);

  // Playing state
  const [isPlayingSeq, setIsPlayingSeq] = useState<boolean>(false);
  const [isPlayingContinuous, setIsPlayingContinuous] = useState<boolean>(false);
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);

  // Form states
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newDate, setNewDate] = useState<string>('');
  const [newTitle, setNewTitle] = useState<string>('');
  const [rawTextLines, setRawTextLines] = useState<string>('');

  const isPlayingRef = useRef<boolean>(false);
  const seqTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load diaries from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('study_chinese_diary_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          setEntries(parsed);
        } else {
          setEntries([SEED_DIARY]);
        }
      } catch (e) {
        setEntries([SEED_DIARY]);
      }
    } else {
      setEntries([SEED_DIARY]);
    }
  }, []);

  const saveEntries = (updatedEntries: DiaryEntry[]) => {
    // Sort entries by date descending (newest first)
    const sorted = [...updatedEntries].sort((a, b) => b.date.localeCompare(a.date));
    localStorage.setItem('study_chinese_diary_v1', JSON.stringify(sorted));
    setEntries(sorted);
  };

  const currentEntry = entries[selectedEntryIndex] || entries[0] || SEED_DIARY;

  // Load SpeechSynthesis voices
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
    isPlayingRef.current = false;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (seqTimeoutRef.current) {
      clearTimeout(seqTimeoutRef.current);
    }
    setIsPlayingSeq(false);
    setIsPlayingContinuous(false);
    setActiveLineIndex(null);
  };

  const speakLine = (line: DiaryLine, index: number, onEndCallback?: () => void) => {
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

  const handleLineClick = (line: DiaryLine, index: number) => {
    speakLine(line, index);
  };

  const playSequence = (startIndex = 0) => {
    if (!currentEntry || !currentEntry.lines.length) return;
    handleStop();
    setIsPlayingSeq(true);
    isPlayingRef.current = true;

    const playNext = (index: number) => {
      if (!isPlayingRef.current) return;
      if (index >= currentEntry.lines.length) {
        handleStop();
        return;
      }

      speakLine(currentEntry.lines[index], index, () => {
        if (!isPlayingRef.current) return;
        seqTimeoutRef.current = setTimeout(() => {
          if (!isPlayingRef.current) return;
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

  const playContinuous = (startIndex = 0) => {
    if (!currentEntry || !currentEntry.lines.length) return;
    handleStop();
    setIsPlayingContinuous(true);
    isPlayingRef.current = true;

    const playNext = (index: number) => {
      if (!isPlayingRef.current) return;
      if (index >= currentEntry.lines.length) {
        handleStop();
        return;
      }

      speakLine(currentEntry.lines[index], index, () => {
        if (!isPlayingRef.current) return;
        seqTimeoutRef.current = setTimeout(() => {
          if (!isPlayingRef.current) return;
          playNext(index + 1);
        }, 100);
      });
    };

    playNext(startIndex);
  };

  const toggleContinuous = () => {
    if (isPlayingContinuous) {
      handleStop();
    } else {
      playContinuous(0);
    }
  };

  const getDayOfWeekName = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      return days[date.getDay()];
    } catch (e) {
      return '';
    }
  };

  const handleAddDiary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate.trim() || !rawTextLines.trim()) {
      alert("Vui lòng nhập ngày và nội dung nhật ký!");
      return;
    }

    const inputLines = rawTextLines.split('\n').filter(l => l.trim() !== '');
    const lines: DiaryLine[] = [];

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

    // Format Title e.g. "Thứ 3 ngày 16/6/2026"
    const parsedDate = new Date(newDate);
    const dayOfWeek = getDayOfWeekName(newDate);
    const day = parsedDate.getDate();
    const month = parsedDate.getMonth() + 1;
    const year = parsedDate.getFullYear();
    const generatedTitle = `${dayOfWeek} ngày ${day}/${month}/${year}`;

    const newDiaryEntry: DiaryEntry = {
      id: `diary-${Date.now()}`,
      date: newDate,
      title: newTitle.trim() || generatedTitle,
      lines
    };

    const updated = [...entries, newDiaryEntry];
    saveEntries(updated);

    // Reset Form
    setNewDate('');
    setNewTitle('');
    setRawTextLines('');
    setShowAddForm(false);
    setSelectedEntryIndex(0); // Selected new top entry
  };

  const handleDeleteDiary = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc chắn muốn xóa trang nhật ký này?")) {
      handleStop();
      const filtered = entries.filter(entry => entry.id !== id);
      if (filtered.length === 0) {
        saveEntries([SEED_DIARY]);
      } else {
        saveEntries(filtered);
      }
      setSelectedEntryIndex(0);
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
    <div className="flex flex-col gap-6" id="diary-outer-wrapper">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="diary-main-container">
        
        {/* Left column (4 cols): Diary Selection list & Add Form */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Calendar size={14} className="text-indigo-600" />
                Nhật ký theo ngày
              </span>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md text-[10px] font-bold text-indigo-600 transition cursor-pointer flex items-center gap-0.5"
              >
                <Plus size={10} />
                Viết nhật ký
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleAddDiary} className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex flex-col gap-2.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <h4 className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <FileText size={12} className="text-indigo-600" /> Viết nhật ký mới
                  </h4>
                  <button type="button" onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={12} />
                  </button>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold text-slate-500">Chọn ngày:</span>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="bg-white text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold text-slate-500">Tiêu đề (Tự chọn):</span>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ví dụ: Thứ 3 ngày 16/6/2026"
                    className="bg-white text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold text-slate-500 flex flex-col">
                    <span>Nội dung nhật ký:</span>
                    <span className="text-[9px] text-slate-400 font-normal mt-0.5">Nhập theo cấu trúc: Chữ Hán | Pinyin | Nghĩa Việt</span>
                  </span>
                  <textarea
                    value={rawTextLines}
                    onChange={(e) => setRawTextLines(e.target.value)}
                    placeholder="今天是2026年... | Jīntiān shì... | Hôm nay là...&#13;我早上四点半起床。 | Wǒ zǎoshang sì... | Tôi thức dậy lúc 4 giờ..."
                    rows={6}
                    className="bg-white text-[11px] p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow"
                >
                  Lưu nhật ký
                </button>
              </form>
            )}

            {/* List of diary days */}
            <div className="max-h-[300px] overflow-y-auto flex flex-col gap-2 pr-1 custom-scrollbar">
              {entries.map((entry, idx) => (
                <button
                  key={entry.id}
                  onClick={() => {
                    handleStop();
                    setSelectedEntryIndex(idx);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer border ${selectedEntryIndex === idx
                    ? 'bg-indigo-55/70 border-indigo-200 text-indigo-700 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="truncate">{entry.title}</span>
                    <span className="text-[9px] text-slate-400 font-mono font-normal">{entry.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {entry.id !== 'diary-seed-1' && (
                      <Trash2
                        size={12}
                        className="text-slate-400 hover:text-rose-500 cursor-pointer"
                        onClick={(e) => handleDeleteDiary(entry.id, e)}
                      />
                    )}
                    <ChevronRight size={14} className={selectedEntryIndex === idx ? 'text-indigo-500' : 'text-slate-400'} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* TTS config */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col gap-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Volume2 size={14} className="text-amber-500" />
              Cấu hình giọng đọc
            </span>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Giọng đọc:</label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="bg-slate-50 text-xs text-slate-800 p-2.5 rounded-lg border border-slate-200 focus:outline-none cursor-pointer w-full text-ellipsis overflow-hidden"
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
                <span className="text-[10px] text-slate-500 font-semibold">Tốc độ: {rate}x</span>
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
                <span className="text-[10px] text-slate-500 font-semibold">Trầm bổng: {pitch}</span>
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

          {/* Visibility Options */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2 mb-1">
              Hiển thị
            </span>
            <div className="flex items-center justify-between py-1 text-xs font-medium text-slate-700">
              <span>Phiên âm Pinyin</span>
              <button
                onClick={() => setShowPinyin(!showPinyin)}
                className={`w-9 h-5 flex items-center rounded-full p-1 duration-300 cursor-pointer ${showPinyin ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'}`}
              >
                <div className="bg-white w-3.5 h-3.5 rounded-full shadow-md" />
              </button>
            </div>
            <div className="flex items-center justify-between py-1 text-xs font-medium text-slate-700 border-t border-slate-50 pt-2">
              <span>Dịch tiếng Việt</span>
              <button
                onClick={() => setShowVietnamese(!showVietnamese)}
                className={`w-9 h-5 flex items-center rounded-full p-1 duration-300 cursor-pointer ${showVietnamese ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'}`}
              >
                <div className="bg-white w-3.5 h-3.5 rounded-full shadow-md" />
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

        {/* Right column (8 cols): Diary Content Display & TTS player */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{currentEntry.title}</h3>
              <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider mt-0.5">Nhật ký cá nhân</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={toggleContinuous}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow cursor-pointer ${isPlayingContinuous
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
              >
                {isPlayingContinuous ? <Pause size={14} /> : <Play size={14} />}
                <span>{isPlayingContinuous ? 'Tạm Dừng' : 'Đọc Liền Mạch'}</span>
              </button>

              <button
                onClick={toggleSequence}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow cursor-pointer ${isPlayingSeq
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
              >
                {isPlayingSeq ? <Pause size={14} /> : <Play size={14} />}
                <span>{isPlayingSeq ? 'Tạm Dừng' : 'Đọc Từng Câu'}</span>
              </button>
            </div>
          </div>

          {/* Reading screen */}
          <div className="bg-slate-100/50 border border-slate-200 p-6 rounded-3xl shadow-inner min-h-[450px]">
            {displayMode === 'paragraph' ? (
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm text-slate-800 leading-relaxed font-sans select-text flex flex-wrap gap-x-2 gap-y-4">
                {currentEntry.lines.map((line, index) => {
                  const isActive = activeLineIndex === index;
                  return (
                    <span
                      key={index}
                      onClick={() => handleLineClick(line, index)}
                      className={`cursor-pointer px-1 rounded transition-all duration-200 border-b-2 hover:bg-indigo-55/40 ${isActive
                        ? 'bg-indigo-100 border-indigo-500 text-indigo-900 font-bold scale-[1.02] shadow-sm'
                        : 'border-transparent text-slate-800'
                        }`}
                      title="Bấm để nghe phát âm"
                    >
                      <span className="text-lg tracking-wide">{line.chinese}</span>
                      {showPinyin && (
                        <span className="block text-[14px] font-mono text-amber-600 tracking-tight leading-none mt-0.5">
                          {line.pinyin}
                        </span>
                      )}
                      {showVietnamese && (
                        <span className="block text-[12px] text-slate-500 font-normal leading-tight mt-0.5">
                          {line.vietnamese}
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {currentEntry.lines.map((line, index) => {
                  const isActive = activeLineIndex === index;
                  return (
                    <div
                      key={index}
                      onClick={() => handleLineClick(line, index)}
                      className={`p-4 rounded-2xl shadow-sm border transition-all duration-300 relative cursor-pointer select-text flex items-start gap-3 bg-white ${isActive
                        ? 'bg-indigo-50 border-indigo-300 shadow-md ring-1 ring-indigo-200'
                        : 'border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 border text-xs font-semibold ${isActive ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                        {isActive ? <Volume2 size={13} className="animate-bounce" /> : index + 1}
                      </div>
                      <div className="flex-1">
                        <p className={`text-base tracking-wide font-sans ${isActive ? 'text-indigo-950 font-semibold' : 'text-slate-800'}`}>
                          {line.chinese}
                        </p>
                        {showPinyin && (
                          <p className="text-[15px] font-mono text-amber-600 tracking-wide mt-1">
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
