import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Play, Pause, Square, ToggleLeft, ToggleRight, Sparkles, ChevronRight, MessageSquare, BookOpen } from 'lucide-react';

interface DialogueLine {
  speaker: 'A' | 'B';
  chinese: string;
  pinyin: string;
  vietnamese: string;
}

interface DialogueData {
  title: string;
  lines: DialogueLine[];
}

interface LessonData {
  id: string;
  lessonTitle: string;
  dialogues: DialogueData[];
}

const LESSONS_DATA: LessonData[] = [
  {
    id: "lesson-0",
    lessonTitle: "Bài 0: Chào hỏi",
    dialogues: [
      {
        title: "Hội thoại 1: Chào hỏi đơn giản",
        lines: [
          { speaker: 'A', chinese: '你好！', pinyin: 'Nǐ hǎo!', vietnamese: 'Xin chào!' },
          { speaker: 'B', chinese: '你好！', pinyin: 'Nǐ hǎo!', vietnamese: 'Xin chào!' },
          { speaker: 'A', chinese: '你好吗？', pinyin: 'Nǐ hǎo ma?', vietnamese: 'Bạn khỏe không?' },
          { speaker: 'B', chinese: '我很好。', pinyin: 'Wǒ hěn hǎo.', vietnamese: 'Tôi rất khỏe.' },
          { speaker: 'A', chinese: '今天忙吗？', pinyin: 'Jīntiān máng ma?', vietnamese: 'Hôm nay bạn bận không?' },
          { speaker: 'B', chinese: '不忙，谢谢。', pinyin: 'Bù máng, xièxie.', vietnamese: 'Không bận, cảm ơn.' }
        ]
      },
      {
        title: "Hội thoại 2: Làm quen – Giới thiệu tên",
        lines: [
          { speaker: 'A', chinese: '你好，我叫安。', pinyin: 'Nǐ hǎo, wǒ jiào Ān.', vietnamese: 'Xin chào, tôi tên An.' },
          { speaker: 'B', chinese: '你好，我叫明。', pinyin: 'Nǐ hǎo, wǒ jiào Míng.', vietnamese: 'Xin chào, tôi tên Minh.' },
          { speaker: 'A', chinese: '你是学生吗？', pinyin: 'Nǐ shì xuésheng ma?', vietnamese: 'Bạn là học sinh à?' },
          { speaker: 'B', chinese: '是的，我是学生。', pinyin: 'Shì de, wǒ shì xuésheng.', vietnamese: 'Vâng, tôi là học sinh.' },
          { speaker: 'A', chinese: '很高兴认识你。', pinyin: 'Hěn gāoxìng rènshi nǐ.', vietnamese: 'Rất vui được quen bạn.' },
          { speaker: 'B', chinese: '我也很高兴。', pinyin: 'Wǒ yě hěn gāoxìng.', vietnamese: 'Tôi cũng rất vui.' }
        ]
      },
      {
        title: "Hội thoại 3: Chào buổi sáng",
        lines: [
          { speaker: 'A', chinese: '早上好！', pinyin: 'Zǎo shang hǎo!', vietnamese: 'Chào buổi sáng!' },
          { speaker: 'B', chinese: '早上好！', pinyin: 'Zǎo shang hǎo!', vietnamese: 'Chào buổi sáng!' },
          { speaker: 'A', chinese: '你今天好吗？', pinyin: 'Nǐ jīntiān hǎo ma?', vietnamese: 'Hôm nay bạn khỏe không?' },
          { speaker: 'B', chinese: '还好。', pinyin: 'Hái hǎo.', vietnamese: 'Cũng ổn.' }
        ]
      }
    ]
  },
  {
    id: "lesson-1",
    lessonTitle: "Bài 1: Giới thiệu bản thân",
    dialogues: [
      {
        title: "Hội thoại 1: Giới thiệu cơ bản",
        lines: [
          { speaker: 'A', chinese: '你好，我介绍一下。', pinyin: 'Nǐ hǎo, wǒ jièshào yíxià.', vietnamese: 'Xin chào, tôi xin giới thiệu một chút.' },
          { speaker: 'B', chinese: '好的。', pinyin: 'Hǎo de.', vietnamese: 'Vâng.' },
          { speaker: 'A', chinese: '我叫安，今年二十五岁。', pinyin: 'Wǒ jiào Ān, jīnnián èrshíwǔ suì.', vietnamese: 'Tôi tên An, năm nay 25 tuổi.' },
          { speaker: 'B', chinese: '你是哪国人？', pinyin: 'Nǐ shì nǎ guó rén?', vietnamese: 'Bạn là người nước nào?' },
          { speaker: 'A', chinese: '我是越南人。', pinyin: 'Wǒ shì Yuènán rén.', vietnamese: 'Tôi là người Việt Nam.' },
          { speaker: 'B', chinese: '很高兴认识你。', pinyin: 'Hěn gāoxìng rènshi nǐ.', vietnamese: 'Rất vui được làm quen với bạn.' }
        ]
      },
      {
        title: "Hội thoại 2: Công việc – Nơi sống",
        lines: [
          { speaker: 'A', chinese: '你好，你现在做什么工作？', pinyin: 'Nǐ hǎo, nǐ xiànzài zuò shénme gōngzuò?', vietnamese: 'Chào bạn, hiện tại bạn làm công việc gì?' },
          { speaker: 'B', chinese: '我是学生。', pinyin: 'Wǒ shì xuéshēng.', vietnamese: 'Tôi là học sinh.' },
          { speaker: 'A', chinese: '你住在哪儿？', pinyin: 'Nǐ zhù zài nǎr?', vietnamese: 'Bạn sống ở đâu?' },
          { speaker: 'B', chinese: '我住在越南。', pinyin: 'Wǒ zhù zài Yuènán.', vietnamese: 'Tôi sống ở Việt Nam.' },
          { speaker: 'A', chinese: '你在公司还是在学校？', pinyin: 'Nǐ zài gōngsī háishì zài xuéxiào?', vietnamese: 'Bạn ở công ty hay ở trường?' },
          { speaker: 'B', chinese: '我在学校学习。', pinyin: 'Wǒ zài xuéxiào xuéxí.', vietnamese: 'Tôi học ở trường.' }
        ]
      },
      {
        title: "Hội thoại 3: Gia đình",
        lines: [
          { speaker: 'A', chinese: '我可以问你一个问题吗？', pinyin: 'Wǒ kěyǐ wèn nǐ yí gè wèntí ma?', vietnamese: 'Tôi có thể hỏi bạn một câu không?' },
          { speaker: 'B', chinese: '可以。', pinyin: 'Kěyǐ.', vietnamese: 'Được.' },
          { speaker: 'A', chinese: '你家有几口人？', pinyin: 'Nǐ jiā yǒu jǐ kǒu rén?', vietnamese: 'Gia đình bạn có mấy người?' },
          { speaker: 'B', chinese: '我家有四口人。', pinyin: 'Wǒ jiā yǒu sì kǒu rén.', vietnamese: 'Gia đình tôi có 4 người.' },
          { speaker: 'A', chinese: '你有兄弟姐妹吗？', pinyin: 'Nǐ yǒu xiōngdì jiěmèi ma?', vietnamese: 'Bạn có anh chị em không?' },
          { speaker: 'B', chinese: '有，我有一个弟弟。', pinyin: 'Yǒu, wǒ yǒu yí gè dìdi.', vietnamese: 'Có, tôi có một em trai.' }
        ]
      }
    ]
  },
  {
    id: "lesson-2",
    lessonTitle: "Bài 2: Thời gian",
    dialogues: [
      {
        title: "Hội thoại 1: Hỏi giờ – Sinh hoạt buổi sáng",
        lines: [
          { speaker: 'A', chinese: '现在几点？', pinyin: 'Xiànzài jǐ diǎn?', vietnamese: 'Bây giờ là mấy giờ?' },
          { speaker: 'B', chinese: '现在早上八点。', pinyin: 'Xiànzài zǎoshang bā diǎn.', vietnamese: 'Bây giờ là 8 giờ sáng.' },
          { speaker: 'A', chinese: '你每天早上几点起床？', pinyin: 'Nǐ měitiān zǎoshang jǐ diǎn qǐchuáng?', vietnamese: 'Mỗi ngày bạn mấy giờ thức dậy?' },
          { speaker: 'B', chinese: '我每天早上七点起床。', pinyin: 'Wǒ měitiān zǎoshang qī diǎn qǐchuáng.', vietnamese: 'Mỗi ngày tôi thức dậy lúc 7 giờ sáng.' },
          { speaker: 'A', chinese: '起床以后你做什么？', pinyin: 'Qǐchuáng yǐhòu nǐ zuò shénme?', vietnamese: 'Sau khi thức dậy bạn làm gì?' },
          { speaker: 'B', chinese: '早上的时候我吃早饭，然后上班。', pinyin: 'Zǎoshang de shíhou wǒ chī zǎofàn, ránhòu shàngbān.', vietnamese: 'Buổi sáng tôi ăn sáng rồi đi làm.' }
        ]
      },
      {
        title: "Hội thoại 2: Hỏi ngày – Thứ – Thời gian",
        lines: [
          { speaker: 'A', chinese: '今天几月几号？', pinyin: 'Jīntiān jǐ yuè jǐ hào?', vietnamese: 'Hôm nay là ngày bao nhiêu tháng mấy?' },
          { speaker: 'B', chinese: '今天十二月二十四号。', pinyin: 'Jīntiān shí\'èr yuè èrshísì hào.', vietnamese: 'Hôm nay là ngày 24 tháng 12.' },
          { speaker: 'A', chinese: '今天星期几？', pinyin: 'Jīntiān xīngqī jǐ?', vietnamese: 'Hôm nay là thứ mấy?' },
          { speaker: 'B', chinese: '今天是星期三。', pinyin: 'Jīntiān shì xīngqī sān.', vietnamese: 'Hôm nay là thứ Tư.' },
          { speaker: 'A', chinese: '昨天你忙不忙？', pinyin: 'Zuótiān nǐ máng bu máng?', vietnamese: 'Hôm qua bạn có bận không?' },
          { speaker: 'B', chinese: '昨天我工作了一整天，很忙。', pinyin: 'Zuótiān wǒ gōngzuò le yì zhěngtian, hěn máng.', vietnamese: 'Hôm qua tôi làm việc cả ngày, rất bận.' }
        ]
      },
      {
        title: "Hội thoại 3: Thời gian làm việc – Kế hoạch",
        lines: [
          { speaker: 'A', chinese: '你每天工作几个小时？', pinyin: 'Nǐ měitiān gōngzuò jǐ gè xiǎoshí?', vietnamese: 'Mỗi ngày bạn làm việc mấy tiếng?' },
          { speaker: 'B', chinese: '我每天工作八个小时。', pinyin: 'Wǒ měitiān gōngzuò bā gè xiǎoshí.', vietnamese: 'Mỗi ngày tôi làm việc 8 tiếng.' },
          { speaker: 'A', chinese: '你晚上忙吗？', pinyin: 'Nǐ wǎnshang máng ma?', vietnamese: 'Buổi tối bạn có bận không?' },
          { speaker: 'B', chinese: '晚上的时候不太忙。', pinyin: 'Wǎnshang de shíhou bú tài máng.', vietnamese: 'Buổi tối thì không bận lắm.' },
          { speaker: 'A', chinese: '明天你上班吗？', pinyin: 'Míngtiān nǐ shàngbān ma?', vietnamese: 'Ngày mai bạn có đi làm không?' },
          { speaker: 'B', chinese: '明天要上班。', pinyin: 'Míngtiān yào shàngbān.', vietnamese: 'Ngày mai phải đi làm.' }
        ]
      }
    ]
  },
  {
    id: "lesson-3",
    lessonTitle: "Bài 3: Một ngày của tôi",
    dialogues: [
      {
        title: "Hội thoại 1: Buổi sáng",
        lines: [
          { speaker: 'A', chinese: '你每天几点起床？', pinyin: 'Nǐ měitiān jǐ diǎn qǐchuáng?', vietnamese: 'Mỗi ngày bạn dậy mấy giờ?' },
          { speaker: 'B', chinese: '我每天六点起床。', pinyin: 'Wǒ měitiān liù diǎn qǐchuáng.', vietnamese: 'Mình dậy lúc 6 giờ mỗi ngày.' },
          { speaker: 'A', chinese: '你早上做什么？', pinyin: 'Nǐ zǎoshang zuò shénme?', vietnamese: 'Buổi sáng bạn làm gì?' },
          { speaker: 'B', chinese: '我早上洗漱和吃早饭。', pinyin: 'Wǒ zǎoshang xǐshù hé chī zǎofàn.', vietnamese: 'Buổi sáng mình vệ sinh cá nhân và ăn sáng.' },
          { speaker: 'A', chinese: '吃早饭后，你做什么？', pinyin: 'Chī zǎofàn hòu, nǐ zuò shénme?', vietnamese: 'Sau khi ăn sáng, bạn làm gì?' },
          { speaker: 'B', chinese: '我准备出门去上班。', pinyin: 'Wǒ zhǔnbèi chūmén qù shàngbān.', vietnamese: 'Mình chuẩn bị ra ngoài đi làm.' }
        ]
      },
      {
        title: "Hội thoại 2: Buổi chiều",
        lines: [
          { speaker: 'A', chinese: '你下午做什么？', pinyin: 'Xiàwǔ nǐ zuò shénme?', vietnamese: 'Buổi chiều bạn làm gì?' },
          { speaker: 'B', chinese: '我下午工作或者休息。', pinyin: 'Wǒ xiàwǔ gōngzuò huòzhě xiūxi.', vietnamese: 'Buổi chiều mình làm việc hoặc nghỉ ngơi.' },
          { speaker: 'A', chinese: '你有空的时候做什么？', pinyin: 'Nǐ yǒu kòng de shíhou zuò shénme?', vietnamese: 'Khi rảnh bạn làm gì?' },
          { speaker: 'B', chinese: '我喜欢看书或者听音乐。', pinyin: 'Wǒ xǐhuān kàn shū huòzhě tīng yīnyuè.', vietnamese: 'Mình thích đọc sách hoặc nghe nhạc.' },
          { speaker: 'A', chinese: '有时候你出去运动吗？', pinyin: 'Yǒu shíhou nǐ chūqù yùndòng ma?', vietnamese: 'Có khi nào bạn ra ngoài tập thể dục không?' },
          { speaker: 'B', chinese: '有时候我去游泳或者散步。', pinyin: 'Yǒu shíhou wǒ qù yóuyǒng huòzhě sànbù.', vietnamese: 'Có khi mình đi bơi hoặc đi dạo.' }
        ]
      },
      {
        title: "Hội thoại 3: Buổi tối",
        lines: [
          { speaker: 'A', chinese: '你晚上几点回家？', pinyin: 'Nǐ wǎnshang jǐ diǎn huí jiā?', vietnamese: 'Buổi tối bạn về nhà lúc mấy giờ?' },
          { speaker: 'B', chinese: '我六点回家。', pinyin: 'Wǒ liù diǎn huí jiā.', vietnamese: 'Mình về nhà lúc 6 giờ.' },
          { speaker: 'A', chinese: '晚上你喜欢做什么？', pinyin: 'Wǎnshang nǐ xǐhuān zuò shénme?', vietnamese: 'Buổi tối bạn thích làm gì?' },
          { speaker: 'B', chinese: '我喜欢看电影和听音乐。', pinyin: 'Wǒ xǐhuān kàn diànyǐng hé tīng yīnyuè.', vietnamese: 'Mình thích xem phim và nghe nhạc.' },
          { speaker: 'A', chinese: '睡觉之前，你做什么？', pinyin: 'Shuìjiào zhīqián, nǐ zuò shénme?', vietnamese: 'Trước khi đi ngủ bạn làm gì?' },
          { speaker: 'B', chinese: '我洗澡然后睡觉。', pinyin: 'Wǒ xǐzǎo ránhòu shuìjiào.', vietnamese: 'Mình tắm rồi đi ngủ.' }
        ]
      }
    ]
  },
  {
    id: "lesson-4",
    lessonTitle: "Bài 4: Một ngày nơi làm việc",
    dialogues: [
      {
        title: "Hội thoại 1: Đi làm và chấm công",
        lines: [
          { speaker: 'A', chinese: '你今天几点上班？', pinyin: 'Nǐ jīntiān jǐ diǎn shàngbān?', vietnamese: 'Hôm nay bạn đi làm lúc mấy giờ?' },
          { speaker: 'B', chinese: '我八点准时上班, 到公司先打卡。', pinyin: 'Wǒ bā diǎn zhǔnshí shàngbān, dào gōngsī xiān dǎkǎ.', vietnamese: 'Mình đi làm đúng tám giờ, đến công ty việc đầu tiên là chấm công.' },
          { speaker: 'A', chinese: '经理在办公室吗？', pinyin: 'Jīnglǐ zài bàngōngshì ma?', vietnamese: 'Quản lý có ở trong văn phòng không?' },
          { speaker: 'B', chinese: '他不在办公室，他在会议室开会。', pinyin: 'Tā bú zài bàngōngshì, tā zài huìyìshì kāihuì.', vietnamese: 'Anh ấy không ở văn phòng, anh ấy đang ở phòng họp họp.' }
        ]
      },
      {
        title: "Hội thoại 2: Công việc và Nhiệm vụ",
        lines: [
          { speaker: 'A', chinese: '今天你有什么任务？', pinyin: 'Jīntiān nǐ yǒu shénme rènwu?', vietnamese: 'Hôm nay bạn có nhiệm vụ gì?' },
          { speaker: 'B', chinese: '我要写工作总结，然后发邮件给经理。', pinyin: 'Wǒ yào xiě gōngzuò zǒngjié, ránhòu fā yóujiàn gěi jīnglǐ.', vietnamese: 'Mình phải viết tổng kết công việc, sau đó gửi email cho quản lý.' },
          { speaker: 'A', chinese: '你需要用电脑或者打印机吗？', pinyin: 'Nǐ xūyào yòng diànnǎo huòzhě dǎyìnjī ma?', vietnamese: 'Bạn có cần dùng máy tính hay máy in không?' },
          { speaker: 'B', chinese: '需要，我正在复印和打印文件。', pinyin: 'Xūyào, wǒ zhèngzài fùyìn hé dǎyìn wénjiàn.', vietnamese: 'Có chứ, mình đang photocopy và in tài liệu.' }
        ]
      },
      {
        title: "Hội thoại 3: Tăng ca và tan làm",
        lines: [
          { speaker: 'A', chinese: '今天你需要加班吗？', pinyin: 'Jīntiān nǐ xūyào jiābān ma?', vietnamese: 'Hôm nay bạn có cần tăng ca không?' },
          { speaker: 'B', chinese: '今天工作很多，我要加班一个小时，不能早退。', pinyin: 'Jīntiān gōngzuò hěnduō, wǒ yào jiābān yí gè xiǎoshí, bùnéng zǎotuì.', vietnamese: 'Hôm nay nhiều việc quá, mình phải tăng ca một tiếng, không được về sớm.' },
          { speaker: 'A', chinese: '同事们都下班了吗？', pinyin: 'Tóngshìmén dōu xiàbān le ma?', vietnamese: 'Các đồng nghiệp đã tan làm hết chưa?' },
          { speaker: 'B', chinese: '有些同事已经回家了，有些还在工作。', pinyin: 'Yǒuxiē tóngshì yǐjīng huí jiā le, yǒuxiē hái zài gōngzuò.', vietnamese: 'Một số đồng nghiệp đã về nhà rồi, một số vẫn đang làm việc.' }
        ]
      }
    ]
  }
];

export default function Dialogue() {
  const [selectedLessonIndex, setSelectedLessonIndex] = useState<number>(0);
  const [selectedDialogueIndex, setSelectedDialogueIndex] = useState<number>(0);

  const [showPinyin, setShowPinyin] = useState<boolean>(true);
  const [showVietnamese, setShowVietnamese] = useState<boolean>(true);

  // Voices selection
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceA, setVoiceA] = useState<string>('');
  const [voiceB, setVoiceB] = useState<string>('');

  // Custom speech settings for speaker A and B
  const [pitchA, setPitchA] = useState<number>(0.9);
  const [pitchB, setPitchB] = useState<number>(1.1);
  const [rateA, setRateA] = useState<number>(0.85);
  const [rateB, setRateB] = useState<number>(0.9);

  // Playing sequence state
  const [isPlayingSeq, setIsPlayingSeq] = useState<boolean>(false);
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);
  const [currentSpeakerSpeaking, setCurrentSpeakerSpeaking] = useState<'A' | 'B' | null>(null);

  const isPlayingRef = useRef<boolean>(false);
  const seqTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentLesson = LESSONS_DATA[selectedLessonIndex];
  const currentDialogue = currentLesson.dialogues[selectedDialogueIndex] || currentLesson.dialogues[0];

  // Load voices on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        // Filter Chinese voices primarily, but fallback to all voices
        const zhVoices = availableVoices.filter(v => v.lang.startsWith('zh') || v.lang.includes('CN') || v.lang.includes('TW') || v.lang.includes('HK'));
        setVoices(availableVoices);

        // Pick defaults
        if (zhVoices.length > 0) {
          // Voice A default is first Chinese voice found (typically mainland CN)
          setVoiceA(zhVoices[0].name);

          // Voice B default should be zh-TW (Taiwan)
          const twVoice = zhVoices.find(v => v.lang.toLowerCase().includes('tw') || v.lang.toLowerCase().includes('hant'));
          if (twVoice) {
            setVoiceB(twVoice.name);
          } else {
            // fallback
            setVoiceB(zhVoices[1 % zhVoices.length].name);
          }
        } else {
          // fallback to any voices or first found
          const defaults = availableVoices.filter(v => v.lang.startsWith('en'));
          if (defaults.length > 0) {
            setVoiceA(defaults[0].name);
            setVoiceB(defaults[1 % defaults.length].name);
          }
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
    setActiveLineIndex(null);
    setCurrentSpeakerSpeaking(null);
  };

  const speakLine = (line: DialogueLine, index: number, onEndCallback?: () => void) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert("Trình duyệt không hỗ trợ tổng hợp giọng nói!");
      return;
    }

    window.speechSynthesis.cancel();
    setActiveLineIndex(index);
    setCurrentSpeakerSpeaking(line.speaker);

    const utterance = new SpeechSynthesisUtterance(line.chinese);
    utterance.lang = 'zh-CN';

    // Find selected voice
    const voiceName = line.speaker === 'A' ? voiceA : voiceB;
    const selectedVoiceObj = voices.find(v => v.name === voiceName);
    if (selectedVoiceObj) {
      utterance.voice = selectedVoiceObj;
    }

    // Apply custom parameters
    if (line.speaker === 'A') {
      utterance.pitch = pitchA;
      utterance.rate = rateA;
    } else {
      utterance.pitch = pitchB;
      utterance.rate = rateB;
    }

    utterance.onend = () => {
      setCurrentSpeakerSpeaking(null);
      if (onEndCallback) {
        onEndCallback();
      } else {
        setActiveLineIndex(null);
      }
    };

    utterance.onerror = () => {
      setCurrentSpeakerSpeaking(null);
      if (onEndCallback) {
        onEndCallback();
      } else {
        setActiveLineIndex(null);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  // Play dialogue line by line sequentially
  const playDialogueSequence = (startIndex = 0) => {
    handleStop();
    setIsPlayingSeq(true);
    isPlayingRef.current = true;

    const playNext = (index: number) => {
      if (!isPlayingRef.current) return;
      if (index >= currentDialogue.lines.length) {
        handleStop();
        return;
      }

      speakLine(currentDialogue.lines[index], index, () => {
        if (!isPlayingRef.current) return;
        // Delay 1s between lines for natural rhythm
        seqTimeoutRef.current = setTimeout(() => {
          if (!isPlayingRef.current) return;
          playNext(index + 1);
        }, 1000);
      });
    };

    playNext(startIndex);
  };

  const toggleSequence = () => {
    if (isPlayingSeq) {
      handleStop();
    } else {
      playDialogueSequence(0);
    }
  };

  // Clean up synthesis on unmount
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
    <div className="flex flex-col gap-6" id="dialogue-outer-wrapper">

      {/* Tab cha: Danh sách Bài học */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col gap-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <BookOpen size={14} className="text-indigo-600" />
          Bài Học Đối Thoại
        </span>
        <div className="flex flex-wrap gap-2 mt-1">
          {LESSONS_DATA.map((lesson, idx) => (
            <button
              key={lesson.id}
              onClick={() => {
                handleStop();
                setSelectedLessonIndex(idx);
                setSelectedDialogueIndex(0);
              }}
              className={`px-5 py-3 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${selectedLessonIndex === idx
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
            >
              <span>{lesson.lessonTitle}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Dialogue Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="dialogue-main-container">

        {/* Sidebar: Selection and settings (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">

          {/* Dialogue Selection */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <MessageSquare size={14} className="text-indigo-600" />
              Chọn Đoạn Hội Thoại
            </span>
            <div className="flex flex-col gap-2">
              {currentLesson.dialogues.map((d, i) => (
                <button
                  key={i}
                  onClick={() => {
                    handleStop();
                    setSelectedDialogueIndex(i);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer border ${selectedDialogueIndex === i
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                >
                  <span>{d.title}</span>
                  <ChevronRight size={14} className={selectedDialogueIndex === i ? 'text-indigo-500' : 'text-slate-400'} />
                </button>
              ))}
            </div>
          </div>

          {/* Voice and TTS Configs */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col gap-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Sparkles size={14} className="text-amber-500" />
              Cấu hình giọng đọc (TTS)
            </span>

            {/* Voice Speaker A */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-indigo-600"></span> Giọng đọc Nhân vật A:
              </label>
              <select
                value={voiceA}
                onChange={(e) => setVoiceA(e.target.value)}
                className="bg-slate-50 text-xs text-slate-800 p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
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
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <span className="text-[10px] text-slate-500">Tốc độ: {rateA}x</span>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.05"
                    value={rateA}
                    onChange={(e) => setRateA(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">Độ trầm/bổng: {pitchA}</span>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.05"
                    value={pitchA}
                    onChange={(e) => setPitchA(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>
            </div>

            {/* Voice Speaker B */}
            <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-3">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-600"></span> Giọng đọc Nhân vật B (Mặc định zh-TW):
              </label>
              <select
                value={voiceB}
                onChange={(e) => setVoiceB(e.target.value)}
                className="bg-slate-50 text-xs text-slate-800 p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
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
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <span className="text-[10px] text-slate-500">Tốc độ: {rateB}x</span>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.05"
                    value={rateB}
                    onChange={(e) => setRateB(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">Độ trầm/bổng: {pitchB}</span>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.05"
                    value={pitchB}
                    onChange={(e) => setPitchB(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 border-t border-slate-100 pt-2 leading-relaxed">
              💡 <strong>Mẹo nhỏ:</strong> Nếu thiết bị của bạn không có nhiều giọng đọc tiếng Trung, bạn có thể chỉnh <strong>Tốc độ</strong> và <strong>Độ trầm/bổng</strong> khác nhau để tạo ra sự khác biệt rõ rệt giữa hai nhân vật.
            </div>
          </div>

          {/* View Options */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2 mb-1">
              Tùy Chọn Hiển Thị
            </span>
            <div className="flex items-center justify-between py-1 text-xs font-medium text-slate-700">
              <span>Hiện phiên âm Pinyin</span>
              <button onClick={() => setShowPinyin(!showPinyin)} className="focus:outline-none cursor-pointer">
                {showPinyin ? <ToggleRight className="text-indigo-600 h-6 w-6" /> : <ToggleLeft className="text-slate-400 h-6 w-6" />}
              </button>
            </div>
            <div className="flex items-center justify-between py-1 text-xs font-medium text-slate-700 border-t border-slate-50 pt-2">
              <span>Hiện dịch nghĩa tiếng Việt</span>
              <button onClick={() => setShowVietnamese(!showVietnamese)} className="focus:outline-none cursor-pointer">
                {showVietnamese ? <ToggleRight className="text-indigo-600 h-6 w-6" /> : <ToggleLeft className="text-slate-400 h-6 w-6" />}
              </button>
            </div>
          </div>

        </div>

        {/* Main chat window layout (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">

          {/* Play control bar */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="flex flex-col">
              <h3 className="text-sm font-bold text-slate-900">{currentDialogue.title}</h3>
              <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider mt-0.5">{currentLesson.lessonTitle}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleSequence}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow cursor-pointer ${isPlayingSeq
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
              >
                {isPlayingSeq ? <Pause size={14} /> : <Play size={14} />}
                <span>{isPlayingSeq ? 'Tạm Dừng' : 'Đọc Toàn Bộ'}</span>
              </button>
            </div>
          </div>

          {/* Dialogue Stream Grid */}
          <div className="bg-slate-100/50 border border-slate-200 p-6 rounded-3xl shadow-inner min-h-[450px] flex flex-col gap-4 overflow-y-auto">
            {currentDialogue.lines.map((line, index) => {
              const isSpeakerA = line.speaker === 'A';
              const isActive = activeLineIndex === index;
              const isSpeakingNow = isActive && currentSpeakerSpeaking === line.speaker;

              return (
                <div
                  key={index}
                  className={`flex gap-3 max-w-[85%] ${isSpeakerA ? 'self-start flex-row' : 'self-end flex-row-reverse'
                    }`}
                >
                  {/* Speaker Avatar Icon */}
                  <div
                    onClick={() => speakLine(line, index)}
                    className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 cursor-pointer shadow-sm select-none border transition-all duration-200 active:scale-95 ${isSpeakerA
                      ? isSpeakingNow
                        ? 'bg-indigo-600 text-white border-indigo-500 ring-4 ring-indigo-100'
                        : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
                      : isSpeakingNow
                        ? 'bg-emerald-600 text-white border-emerald-500 ring-4 ring-emerald-100'
                        : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                      }`}
                    title={`Bấm để nghe nhân vật ${line.speaker} nói`}
                  >
                    {isSpeakingNow ? (
                      <Volume2 size={15} className="animate-bounce" />
                    ) : (
                      line.speaker
                    )}
                  </div>

                  {/* Dialog Content Bubble */}
                  <div
                    onClick={() => speakLine(line, index)}
                    className={`p-4 rounded-2xl shadow-sm border transition-all duration-300 relative cursor-pointer select-text ${isSpeakerA
                      ? isActive
                        ? 'bg-indigo-50/90 border-indigo-300 shadow-md ring-1 ring-indigo-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                      : isActive
                        ? 'bg-emerald-50/90 border-emerald-300 shadow-md ring-1 ring-emerald-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                  >
                    {/* Chinese Text */}
                    <p className={`text-base tracking-wide font-sans ${isSpeakerA ? 'text-indigo-950' : 'text-emerald-950'
                      }`}>
                      {line.chinese}
                    </p>

                    {/* Pinyin Text */}
                    {showPinyin && (
                      <p className="text-[15px] font-mono text-amber-600 tracking-wide mt-1">
                        {line.pinyin}
                      </p>
                    )}

                    {/* Vietnamese translation */}
                    {showVietnamese && (
                      <p className="text-xs text-slate-500 mt-1 border-t border-slate-100 pt-1">
                        {line.vietnamese}
                      </p>
                    )}

                    {/* Play Indicator dot */}
                    {isActive && (
                      <span className={`absolute top-2 right-2 h-1.5 w-1.5 rounded-full ${isSpeakerA ? 'bg-indigo-600 animate-ping' : 'bg-emerald-600 animate-ping'
                        }`}></span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
}
