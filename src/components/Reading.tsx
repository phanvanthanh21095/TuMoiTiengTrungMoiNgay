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
      { chinese: "she 又漂亮又聪明。", pinyin: "Tā yòu piàoliang yòu cōngmíng.", vietnamese: "Cô ấy vừa xinh đẹp vừa thông minh." },
      { chinese: "小梅喜欢学汉语，我也喜欢。", pinyin: "Xiǎoméi xǐhuan xué Hànyǔ, wǒ yě xǐhuan.", vietnamese: "Tiểu Mỹ thích học tiếng Trung, tôi cũng thích." },
      { chinese: "每天我跟 she 一起学习。", pinyin: "Měitiān wǒ gēn tā yìqǐ xuéxí.", vietnamese: "Mỗi ngày tôi cùng cô ấy học tập." },
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
      { chinese: "我的老师经常教我们要努力学习。", pinyin: "Wǒ de lǎoshī jīngcháng jiāo wǒmen yào nǔlì xuéxí.", vietnamese: "Giáo viên của tôi thường dạy chúng tôi phải nỗ lực học tập." },
      { chinese: "我们班的同学 đều rất thích cô ấy。", pinyin: "Wǒmen bān de tóngxué dōu hěn xǐhuan tā.", vietnamese: "Các bạn trong lớp của tôi đều rất thích cô ấy." },
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
  },
  {
    id: "passage-4",
    title: "Đoạn văn 4: Một ngày ở nơi làm việc (我在办公室的一天)",
    lines: [
      { chinese: "我每天早上八点去公司上班。", pinyin: "Wǒ měitiān zǎoshang bā diǎn qù gōngsī shàngbān.", vietnamese: "Mỗi ngày tôi đi làm ở công ty lúc 8 giờ sáng." },
      { chinese: "到了公司，我的第一件事就是打卡。", pinyin: "Dào le gōngsī, wǒ de dì yī jiàn shì jiùshì dǎkǎ.", vietnamese: "Đến công ty, việc đầu tiên của tôi chính là chấm công." },
      { chinese: "今天有很多任务，经理在办公室等我完成报告。", pinyin: "Jīntiān yǒu hěnduō rènwu, jīnglǐ zài bàngōngshì děng wǒ wánchéng bàogào.", vietnamese: "Hôm nay có rất nhiều nhiệm vụ, quản lý đang ở trong văn phòng đợi tôi hoàn thành báo cáo." },
      { chinese: "中午我和同事们一起吃面条，聊天。", pinyin: "Zhōngwǔ wǒ hé tóngshìmén yìqǐ chī miàntiáo, liáotiān.", vietnamese: "Buổi trưa tôi cùng các đồng nghiệp ăn mì và trò chuyện." },
      { chinese: "下午我们在会议室开会，讨论工作总结。", pinyin: "Xiàwǔ wǒmen zài huìyìshì kāihuì, tǎolùn gōngzuò zǒngjié.", vietnamese: "Buổi chiều chúng tôi họp ở phòng họp, thảo luận về bản tổng kết công việc." },
      { chinese: "下班以前，我用电脑给经理发邮件。", pinyin: "Xiàbān yǐqián, wǒ yòng diànnǎo gěi jīnglǐ fā yóujiàn.", vietnamese: "Trước khi tan làm, tôi dùng máy tính gửi email cho quản lý." },
      { chinese: "如果工作没做完，我就要加班，不能早退。", pinyin: "Rúguǒ gōngzuò méi zuò wán, wǒ jiù yào jiābān, bùnéng zǎotuì.", vietnamese: "Nếu công việc chưa làm xong, tôi phải tăng ca, không được về sớm." }
    ]
  },
  {
    id: "passage-5",
    title: "Đoạn văn 5: Giới thiệu bản thân 2 (自我介绍 二)",
    lines: [
      { chinese: "大家好，我介绍一下。", pinyin: "Dà jiā hǎo, wǒ jiè shào yí xià.", vietnamese: "Chào mọi người, tôi xin giới thiệu một chút." },
      { chinese: "我叫成，今年三十一岁。", pinyin: "Wǒ jiào Chéng, jīn nián sān shí yī suì.", vietnamese: "Tôi tên Thành, năm nay 31 tuổi." },
      { chinese: "我是越南人，现在住在越南。", pinyin: "Wǒ shì Yuènán rén, xiàn zài zhù zài Yuènán.", vietnamese: "Tôi là người Việt Nam, hiện tại sống ở Việt Nam." },
      { chinese: "以前我是工程师，现在在语言中心学习中文。", pinyin: "Yǐ qián wǒ shì gōng chéng shī, xiàn zài zài yǔ yán zhōng xīn xué xí Zhōngwén.", vietnamese: "Trước đây tôi là kỹ sư, hiện tại đang học tiếng Trung ở trung tâm ngôn ngữ." },
      { chinese: "我学习中文大约三个星期了。", pinyin: "Wǒ xué xí Zhōngwén dà yuē sān gè xīng qī le.", vietnamese: "Tôi học tiếng Trung được khoảng 3 tuần rồi." },
      { chinese: "我家有四口人，包括爸爸、妈妈、妹妹和我。", pinyin: "Wǒ jiā yǒu sì kǒu rén, bāo kuò bà ba, mā ma, mèi mei hé wǒ.", vietnamese: "Gia đình tôi có 4 người, gồm bố, mẹ, em gái và tôi." },
      { chinese: "我的爱好是玩游戏。", pinyin: "Wǒ de ài hào shì wán yóu xì.", vietnamese: "Sở thích của tôi là chơi game." },
      { chinese: "空闲的时候，我常常听音乐和看电影。", pinyin: "Kòng xián de shí hou, wǒ cháng cháng tīng yīn yuè hé kàn diàn yǐng.", vietnamese: "Lúc rảnh rỗi, tôi thường nghe nhạc và xem phim." },
      { chinese: "我学习中文是为了工作。", pinyin: "Wǒ xué xí Zhōngwén shì wèi le gōng zuò.", vietnamese: "Tôi học tiếng Trung là vì công việc." },
      { chinese: "很高兴认识大家。谢谢。", pinyin: "Hěn gāo xìng rèn shi dà jiā. Xiè xie.", vietnamese: "Rất vui được quen biết mọi người. Cảm ơn." }
    ]
  }
];

// Clean up English words in Chinese character fields in DEFAULT_PASSAGES
DEFAULT_PASSAGES[0].lines[2].chinese = "她又漂亮又聪明。";
DEFAULT_PASSAGES[0].lines[4].chinese = "每天我跟她一起学习。";
DEFAULT_PASSAGES[1].lines[6].chinese = "我们班的同学都很喜欢 she (她)。".replace("she (她)", "她");

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
  const [isPlayingContinuous, setIsPlayingContinuous] = useState<boolean>(false);
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);

  // Add new custom passage state
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [rawTextLines, setRawTextLines] = useState<string>('');

  const isPlayingRef = useRef<boolean>(false);
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
    handleStop();
    setIsPlayingSeq(true);
    isPlayingRef.current = true;

    const playNext = (index: number) => {
      if (!isPlayingRef.current) return;
      if (index >= currentPassage.lines.length) {
        handleStop();
        return;
      }

      speakLine(currentPassage.lines[index], index, () => {
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
    if (!currentPassage || !currentPassage.lines.length) return;
    handleStop();
    setIsPlayingContinuous(true);
    isPlayingRef.current = true;

    const playNext = (index: number) => {
      if (!isPlayingRef.current) return;
      if (index >= currentPassage.lines.length) {
        handleStop();
        return;
      }

      speakLine(currentPassage.lines[index], index, () => {
        if (!isPlayingRef.current) return;
        // Natural transition delay between sentences (around 100ms)
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

  const handleAddPassage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !rawTextLines.trim()) {
      alert("Vui lòng điền đầy đủ tiêu đề và nội dung đoạn văn!");
      return;
    }

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
    setSelectedPassageIndex(passages.length);
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

      {/* Main Reading Passage Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="reading-main-container">

        {/* Left Sidebar (4 cols): Selection list and configurations */}
        <div className="lg:col-span-4 flex flex-col gap-4">

          {/* Passage Selection Card (Vertical stacked list) */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <BookOpen size={14} className="text-indigo-600" />
                Chọn Đoạn Văn Ngắn
              </span>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-105 border border-indigo-200 rounded text-[10px] font-bold text-indigo-600 transition cursor-pointer flex items-center gap-0.5"
              >
                <Plus size={10} />
                Thêm mới
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleAddPassage} className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex flex-col gap-2.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <h4 className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <FileText size={12} className="text-indigo-600" /> Nhập đoạn văn mới
                  </h4>
                  <button type="button" onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={12} />
                  </button>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold text-slate-500">Tiêu đề:</span>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ví dụ: Giới thiệu bản thân"
                    className="bg-white text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold text-slate-500">Nội dung (Chữ Hán | Pinyin | Nghĩa Việt):</span>
                  <textarea
                    value={rawTextLines}
                    onChange={(e) => setRawTextLines(e.target.value)}
                    placeholder="Câu 1 Chữ Hán | Pinyin | Nghĩa Việt&#13;Câu 2 Chữ Hán | Pinyin | Nghĩa Việt"
                    rows={4}
                    className="bg-white text-[11px] p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow"
                >
                  Thêm đoạn văn
                </button>
              </form>
            )}

            {/* Vertical list of passages */}
            <div className="flex flex-col gap-2">
              {passages.map((passage, idx) => (
                <button
                  key={passage.id}
                  onClick={() => {
                    handleStop();
                    setSelectedPassageIndex(idx);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer border ${selectedPassageIndex === idx
                    ? 'bg-indigo-55/70 border-indigo-200 text-indigo-700 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                >
                  <span className="truncate pr-2">{passage.title}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {passage.isCustom && (
                      <Trash2
                        size={12}
                        className="text-slate-400 hover:text-rose-500 cursor-pointer"
                        onClick={(e) => handleDeletePassage(passage.id, e)}
                      />
                    )}
                    <ChevronRight size={14} className={selectedPassageIndex === idx ? 'text-indigo-500' : 'text-slate-400'} />
                  </div>
                </button>
              ))}
            </div>
          </div>

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

        {/* Right Content Area (8 cols): Passage text and controls */}
        <div className="lg:col-span-8 flex flex-col gap-4">

          {/* Passage Control Bar */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{currentPassage.title}</h3>
              <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider mt-0.5">Luyện đọc lưu loát</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Play continuous button */}
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

              {/* Play sequence button */}
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

          {/* Reading Display Screen */}
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
                      className={`cursor-pointer px-1 rounded transition-all duration-200 border-b-2 hover:bg-indigo-50/50 ${isActive
                        ? 'bg-indigo-100 border-indigo-500 text-indigo-900 font-bold scale-[1.02] shadow-sm'
                        : 'border-transparent text-slate-800'
                        }`}
                      title="Bấm để nghe đọc câu này"
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
              // Line-by-line representation
              <div className="flex flex-col gap-4">
                {currentPassage.lines.map((line, index) => {
                  const isActive = activeLineIndex === index;
                  return (
                    <div
                      key={index}
                      onClick={() => speakLine(line, index)}
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
