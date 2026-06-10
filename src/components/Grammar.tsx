import React, { useState, useEffect } from 'react';
import { Volume2, BookOpen, ChevronRight, GraduationCap, Sparkles } from 'lucide-react';

interface GrammarExample {
  chinese: string;
  pinyin: string;
  vietnamese: string;
}

interface GrammarPoint {
  title: string;
  description: string;
  formula?: string;
  tableHeaders?: string[];
  tableRows?: string[][];
  examples: GrammarExample[];
}

interface GrammarLesson {
  id: string;
  lessonTitle: string;
  points: GrammarPoint[];
}

const GRAMMAR_DATA: GrammarLesson[] = [
  {
    id: "lesson-0",
    lessonTitle: "Bài 0: Chào hỏi",
    points: [
      {
        title: "1. Hậu tố chỉ số nhiều 们 (men)",
        description: "们 (men) là hậu tố biểu thị số nhiều, thường đặt sau đại từ nhân xưng hoặc danh từ chỉ người để biểu thị số nhiều (các, bọn, chúng).",
        formula: "[Đại từ/Danh từ chỉ người] + 们 (men)",
        tableHeaders: ["Từ gốc", "Pinyin", "Nghĩa", "Dạng số nhiều", "Pinyin số nhiều", "Nghĩa số nhiều"],
        tableRows: [
          ["我 (wǒ)", "wǒ", "tôi", "我们", "wǒmen", "chúng tôi"],
          ["你 (nǐ)", "nǐ", "bạn", "你们", "nǐmen", "các bạn"],
          ["他 (tā)", "tā", "anh ấy", "他们", "tāmen", "bọn họ (nam / chung)"],
          ["她 (tā)", "tā", "cô ấy", "她们", "tāmen", "bọn họ (nữ)"]
        ],
        examples: [
          { chinese: "我们是学生。", pinyin: "Wǒmen shì xuésheng.", vietnamese: "Chúng tôi là học sinh." },
          { chinese: "你们好吗？", pinyin: "Nǐmen hǎo ma?", vietnamese: "Các bạn khỏe không?" }
        ]
      },
      {
        title: "2. Cấu trúc chào hỏi cơ bản",
        description: "Dùng để chào hỏi một đối tượng cụ thể khi gặp mặt. Đối tượng chào hỏi có thể đặt sau từ 你好 (Nǐ hǎo).",
        formula: "你好 (Nǐ hǎo) + (đối tượng)",
        examples: [
          { chinese: "你好！", pinyin: "Nǐ hǎo!", vietnamese: "Xin chào!" },
          { chinese: "你好，老师！", pinyin: "Nǐ hǎo, lǎoshī!", vietnamese: "Chào thầy/cô!" }
        ]
      },
      {
        title: "3. Cấu trúc giới thiệu tên",
        description: "Dùng để giới thiệu tên của bản thân. Động từ 叫 (jiào) có nghĩa là gọi là, tên là.",
        formula: "我叫 (Wǒ jiào) + [TÊN]",
        examples: [
          { chinese: "我叫安。", pinyin: "Wǒ jiào Ān.", vietnamese: "Tôi tên An." },
          { chinese: "我叫玲玲。", pinyin: "Wǒ jiào Línglíng.", vietnamese: "Tôi tên Linh Linh." }
        ]
      }
    ]
  },
  {
    id: "lesson-1",
    lessonTitle: "Bài 1: Giới thiệu bản thân",
    points: [
      {
        title: "1. Trợ từ nghi vấn 吗 (ma) - Dùng để hỏi",
        description: "Muốn hỏi có / không, ta thêm 吗 (ma) vào cuối câu trần thuật.",
        formula: "[Câu trần thuật] + 吗 (ma) ?",
        examples: [
          { chinese: "你是越南人吗？", pinyin: "Nǐ shì Yuènán rén ma?", vietnamese: "Bạn là người Việt Nam không?" },
          { chinese: "你在公司工作吗？", pinyin: "Nǐ zài gōngsī gōngzuò ma?", vietnamese: "Bạn làm việc ở công ty không?" }
        ]
      },
      {
        title: "2. Động từ sở hữu 有 (yǒu) / 没有 (méi yǒu) - Có / Không có",
        description: "有 (yǒu) nghĩa là 'có'. Dạng phủ định của nó là 没有 (méi yǒu), nghĩa là 'không có'. Tuyệt đối không dùng 不有 (bù yǒu).",
        formula: "主语 (Chủ ngữ) + 有 (yǒu) / 没有 (méi yǒu) + 宾语 (Tân ngữ)",
        examples: [
          { chinese: "我有工作。", pinyin: "Wǒ yǒu gōngzuò.", vietnamese: "Tôi có công việc." },
          { chinese: "我没有公司。", pinyin: "Wǒ méi yǒu gōngsī.", vietnamese: "Tôi không có công ty." }
        ]
      },
      {
        title: "3. Đại từ nghi vấn 怎么 (zěnme) - Sao / Thế nào",
        description: "Dùng để hỏi cách thức thực hiện hành động (thế nào) hoặc hỏi nguyên nhân (sao / sao lại).",
        formula: "Cách nói 1: 怎么 (zěnme) + Động từ (Hỏi cách làm)\nCách nói 2: 怎么 (zěnme) + 不 (bù)/Trạng thái (Hỏi sao lại)",
        examples: [
          { chinese: "怎么说？", pinyin: "Zěnme shuō?", vietnamese: "Nói sao?" },
          { chinese: "怎么学习汉语？", pinyin: "Zěnme xuéxí Hànyǔ?", vietnamese: "Học tiếng Trung thế nào?" },
          { chinese: "你怎么不来？", pinyin: "Nǐ zěnme bù lái?", vietnamese: "Sao bạn không đến?" },
          { chinese: "你怎么在公司？", pinyin: "Nǐ zěnme zài gōngsī?", vietnamese: "Sao bạn ở công ty?" }
        ]
      },
      {
        title: "4. Giới từ/Phó từ 在 (zài) - Ở / Đang",
        description: "在 (zài) có 3 cách dùng phổ biến tùy thuộc vào vị trí của địa điểm và hành động trong câu.",
        formula: "Cách 1: 在 (zài) + Địa điểm (ở đâu)\nCách 2: 在 (zài) + Địa điểm + Động từ (ở đâu làm gì)\nCách 3: 在 (zài) + Động từ (đang làm gì)",
        examples: [
          { chinese: "我在越南。", pinyin: "Wǒ zài Yuènán.", vietnamese: "Tôi ở Việt Nam." },
          { chinese: "我在公司。", pinyin: "Wǒ zài gōngsī.", vietnamese: "Tôi ở công ty." },
          { chinese: "我在公司工作。", pinyin: "Wǒ zài gōngsī gōngzuò.", vietnamese: "Tôi làm việc ở công ty." },
          { chinese: "我在越南学习汉语。", pinyin: "Wǒ zài Yuènán xuéxí Hànyǔ.", vietnamese: "Tôi học tiếng Trung ở Việt Nam." },
          { chinese: "我在工作。", pinyin: "Wǒ zài gōngzuò.", vietnamese: "Tôi đang làm việc." },
          { chinese: "我在学习汉语。", pinyin: "Wǒ zài xuéxí Hànyǔ.", vietnamese: "Tôi đang học tiếng Trung." }
        ]
      }
    ]
  },
  {
    id: "lesson-2",
    lessonTitle: "Bài 2: Thời gian",
    points: [
      {
        title: "1. Cách nói thứ trong tuần",
        description: "Để nói các thứ trong tuần, tiếng Trung sử dụng cấu trúc ghép 星期 (xīngqī) với các số từ 1 đến 6. Riêng Chủ Nhật sẽ dùng 天 (tiān) hoặc 日 (rì).",
        formula: "星期 (xīngqī) + [SỐ]",
        tableHeaders: ["Thứ", "Tiếng Trung", "Pinyin"],
        tableRows: [
          ["Thứ 2", "星期一", "xīngqī yī"],
          ["Thứ 3", "星期二", "xīngqī èr"],
          ["Thứ 4", "星期三", "xīngqī sān"],
          ["Thứ 5", "星期四", "xīngqī sì"],
          ["Thứ 6", "星期五", "xīngqī wǔ"],
          ["Thứ 7", "星期六", "xīngqī liù"],
          ["Chủ nhật", "星期天 / 星期日", "xīngqī tiān / xīngqī rì"]
        ],
        examples: [
          { chinese: "今天是星期三。", pinyin: "Jīntiān shì xīngqī sān.", vietnamese: "Hôm nay là thứ Tư." },
          { chinese: "星期天我休息。", pinyin: "Xīngqītian wǒ xiūxi.", vietnamese: "Chủ nhật tôi nghỉ ngơi." }
        ]
      },
      {
        title: "2. Cách nói Ngày - Tháng - Năm",
        description: "Thứ tự biểu thị thời gian trong tiếng Trung đi từ lớn đến nhỏ: NĂM + THÁNG + NGÀY. Năm đọc từng số kèm từ 年 (nián). Tháng ghép số với 月 (yuè). Ngày ghép số với 号 (hào) trong văn nói hoặc 日 (rì) trong văn viết.",
        formula: "[NĂM] 年 (nián) + [THÁNG] 月 (yuè) + [NGÀY] 号 (hào)",
        examples: [
          { chinese: "二〇二五年", pinyin: "èr líng èr wǔ nián", vietnamese: "Năm 2025" },
          { chinese: "一月", pinyin: "yī yuè", vietnamese: "Tháng 1" },
          { chinese: "十二月", pinyin: "shí'èr yuè", vietnamese: "Tháng 12" },
          { chinese: "一号", pinyin: "yī hào", vietnamese: "Ngày 1" },
          { chinese: "十号", pinyin: "shí hào", vietnamese: "Ngày 10" },
          { chinese: "二十五号", pinyin: "èrshíwǔ hào", vietnamese: "Ngày 25" },
          { chinese: "今天是二〇二五年十二月二十四号。", pinyin: "Jīntiān shì èr líng èr wǔ nián shí'èr yuè èrshísì hào.", vietnamese: "Hôm nay là ngày 24 tháng 12 năm 2025." }
        ]
      },
      {
        title: "3. Cách nói giờ và phút",
        description: "Để biểu thị giờ giấc, chúng ta ghép số giờ với 点 (diǎn) và số phút với 分 (fēn). Có thể thêm từ chỉ buổi trong ngày vào trước giờ để làm rõ thời gian sáng/tối.",
        formula: "(BUỔI) + [SỐ] 点 (diǎn) + [SỐ] 分 (fēn)",
        tableHeaders: ["Giờ", "Tiếng Trung", "Pinyin"],
        tableRows: [
          ["7 giờ", "七点", "qī diǎn"],
          ["7 giờ 10", "七点十分", "qī diǎn shí fēn"],
          ["7 giờ 30", "七点半", "qī diǎn bàn"],
          ["7 giờ 45", "七点四十五分", "qī diǎn sìshíwǔ fēn"]
        ],
        examples: [
          { chinese: "现在早上八点。", pinyin: "Xiànzài zǎoshang bā diǎn.", vietnamese: "Bây giờ là 8 giờ sáng." },
          { chinese: "下午三点开会。", pinyin: "Xiàwǔ sān diǎn kāihuì.", vietnamese: "Chiều 3 giờ họp." }
        ]
      },
      {
        title: "4. Cách nói giờ rưỡi với 半 (bàn)",
        description: "Khi muốn nói 'rưỡi' (30 phút), ta thay thế 30 分 (sānshí fēn) bằng từ 半 (bàn).",
        formula: "[SỐ] 点 (diǎn) + 半 (bàn)",
        tableHeaders: ["Giờ", "Tiếng Trung", "Pinyin"],
        tableRows: [
          ["7 giờ 30", "七点半", "qī diǎn bàn"],
          ["9 giờ 30", "九点半", "jiǔ diǎn bàn"]
        ],
        examples: [
          { chinese: "我每天早上七点半起床。", pinyin: "Wǒ měitiān zǎoshang qī diǎn bàn qǐchuáng.", vietnamese: "Mỗi ngày tôi thức dậy lúc 7 giờ rưỡi sáng." },
          { chinese: "我下午五点半下班。", pinyin: "Wǒ xiàwǔ wǔ diǎn bàn xiàbān.", vietnamese: "Tôi tan làm lúc 5 giờ rưỡi chiều." }
        ]
      }
    ]
  },
  {
    id: "lesson-3",
    lessonTitle: "Bài 3: Một ngày của tôi",
    points: [
      {
        title: "1. Vị trí thời gian trong câu",
        description: "Trong tiếng Trung, từ chỉ thời gian phải đứng trước động từ (có thể đứng trước hoặc đứng sau chủ ngữ) để biểu thị thời gian xảy ra hành động.",
        formula: "主语 (Chủ ngữ) + 时间 (Thời gian) + 动词 (Động từ)\nHoặc: 时间 (Thời gian) + 主语 (Chủ ngữ) + 动词 (Động từ)",
        examples: [
          { chinese: "我早上起床。", pinyin: "Wǒ zǎoshang qǐchuáng.", vietnamese: "Tôi thức dậy buổi sáng." },
          { chinese: "我晚上看电影。", pinyin: "Wǒ wǎnshang kàn diànyǐng.", vietnamese: "Tôi xem phim buổi tối." }
        ]
      },
      {
        title: "2. Cấu trúc 一...就... (Yī... jiù...) - Vừa... là...",
        description: "Diễn tả hành động B xảy ra ngay sau khi hành động A kết thúc (Vừa... là/thì...).",
        formula: "一 (yī) + Hành động A + 就 (jiù) + Hành động B",
        examples: [
          { chinese: "一回家就洗澡。", pinyin: "Yì huí jiā jiù xǐzǎo.", vietnamese: "Vừa về nhà là đi tắm." },
          { chinese: "一起床就出门。", pinyin: "Yì qǐchuáng jiù chūmén.", vietnamese: "Vừa thức dậy là ra ngoài." }
        ]
      },
      {
        title: "3. Cấu trúc ...的时候 (...de shíhou) - Khi... / Lúc...",
        description: "Dùng để diễn tả một hành động, sự việc đang xảy ra tại một thời điểm hoặc khoảng thời gian nào đó.",
        formula: "[Hành động/Thời gian] + 的时候 (de shíhou)",
        examples: [
          { chinese: "回家的时候，我看手机。", pinyin: "Huí jiā de shíhou, wǒ kàn shǒujī.", vietnamese: "Lúc về nhà, tôi xem điện thoại." },
          { chinese: "吃饭的时候，我们聊天。", pinyin: "Chī fàn de shíhou, wǒmen liáotiān.", vietnamese: "Khi ăn cơm, chúng tôi trò chuyện." }
        ]
      }
    ]
  },
  {
    id: "lesson-4",
    lessonTitle: "Bài 4: Một ngày ở nơi làm việc",
    points: [
      {
        title: "1. Cấu trúc giới từ 给 (gěi) - Làm gì cho ai",
        description: "Giới từ 给 (gěi) kết hợp với tân ngữ chỉ đối tượng đứng trước động từ để biểu thị hành động hướng tới hoặc phục vụ đối tượng đó.",
        formula: "主语 (Chủ ngữ) + 给 (gěi) + Người + 动词 (Động từ)",
        examples: [
          { chinese: "我给同事发邮件。", pinyin: "Wǒ gěi tóngshì fā yóujiàn.", vietnamese: "Tôi gửi email cho đồng nghiệp." },
          { chinese: "他给经理打电话。", pinyin: "Tā gěi jīnglǐ dǎ diànhuà.", vietnamese: "Anh ấy gọi điện cho quản lý." }
        ]
      },
      {
        title: "2. Động từ năng nguyện 要 (yào) / 想 (xiǎng) - Muốn / Cần làm gì",
        description: "Dùng để diễn tả ý định, mong muốn hoặc nhu cầu cần thiết phải thực hiện một hành động.",
        formula: "主语 (Chủ ngữ) + 要 (yào) / 想 (xiǎng) + 动词 (Động từ)",
        examples: [
          { chinese: "我今天想请一天假。", pinyin: "Wǒ jīntiān xiǎng qǐng yì tiān jià.", vietnamese: "Hôm nay tôi muốn xin nghỉ một ngày." },
          { chinese: "他明天要加班。", pinyin: "Tā míngtiān yào jiābān.", vietnamese: "Ngày mai anh ấy phải tăng ca." }
        ]
      },
      {
        title: "3. Động từ năng nguyện 可以 (kěyǐ) / 能 (néng) - Có thể / Được phép làm gì",
        description: "Có thể diễn tả khả năng (năng lực làm được việc gì - thường dùng 能) hoặc sự cho phép, tính khả thi của hành động (thường dùng 可以).",
        formula: "主语 (Chủ ngữ) + 可以 (kěyǐ) / 能 (néng) + 动词 (Động từ)",
        examples: [
          { chinese: "你可以在办公室休息一下。", pinyin: "Nǐ kěyǐ zài bàngōngshì xiūxi yíxià.", vietnamese: "Bạn có thể nghỉ ngơi một chút ở văn phòng." },
          { chinese: "我能完成今天的任务。", pinyin: "Wǒ néng wánchéng jīntiān de rènwu.", vietnamese: "Tôi có thể hoàn thành nhiệm vụ hôm nay." }
        ]
      }
    ]
  },
  {
    id: "lesson-5",
    lessonTitle: "Bài 5: Sở thích",
    points: [
      {
        title: "1. Cấu trúc bày tỏ sở thích với 喜欢 (xǐhuan)",
        description: "Dùng để diễn tả việc chủ ngữ thích hoặc không thích (不喜欢 - bù xǐhuan) làm việc gì đó hoặc đối với một sự vật nào đó.",
        formula: "主语 (Chủ ngữ) + 喜欢 (xǐhuan) / 不喜欢 (bù xǐhuan) + [Động từ/Danh từ]",
        examples: [
          { chinese: "我喜欢拍照。", pinyin: "Wǒ xǐhuan pāizhào.", vietnamese: "Tôi thích chụp ảnh." },
          { chinese: "他不喜欢运动。", pinyin: "Tā bù xǐhuan yùndòng.", vietnamese: "Anh ấy không thích vận động." }
        ]
      },
      {
        title: "2. Cấu trúc bày tỏ hứng thú với 对...感兴趣 (duì... gǎn xìngqù)",
        description: "Dùng để diễn tả chủ ngữ có hứng thú, quan tâm đối với một lĩnh vực, sự vật hay hành động nào đó.",
        formula: "主语 (Chủ ngữ) + 对 (duì) + [Danh từ] + 感兴趣 (gǎn xìngqù)",
        examples: [
          { chinese: "我对摄影很感兴趣。", pinyin: "Wǒ duì shèyǐng hěn gǎn xìngqù.", vietnamese: "Tôi rất hứng thú với nhiếp ảnh." },
          { chinese: "她对做手工感兴趣。", pinyin: "Tā duì zuò shǒugōng gǎn xìngqù.", vietnamese: "Cô ấy hứng thú với việc làm thủ công." }
        ]
      },
      {
        title: "3. Cấu trúc phó từ tần suất 常 (cháng) / 经常 (jīngcháng) - Thường xuyên",
        description: "Phó từ chỉ tần suất, đứng trước động từ để biểu thị hành động diễn ra thường xuyên.",
        formula: "主语 (Chủ ngữ) + 常 (cháng) / 经常 (jīngcháng) + 动词 (Động từ)",
        examples: [
          { chinese: "我经常做瑜伽。", pinyin: "Wǒ jīngcháng zuò yújiā.", vietnamese: "Tôi thường xuyên tập yoga." },
          { chinese: "他常看纪录片。", pinyin: "Tā cháng kàn jìlùpiàn.", vietnamese: "Anh ấy thường xem phim tài liệu." }
        ]
      }
    ]
  },
  {
    id: "lesson-6",
    lessonTitle: "Bài 6: Mua sắm",
    points: [
      {
        title: "1. Câu hỏi cầu khiến/lịch sự: 可以 (kěyǐ) ... 吗 (ma)?",
        description: "Dùng để đưa ra yêu cầu hoặc hỏi ý kiến một cách lịch sự, nhẹ nhàng.\n* Mẹo từ vựng: 一下 (yíxià) chỉ hành động diễn ra nhanh/thử một chút; 一点 (yìdiǎn) chỉ mức độ/số lượng ít; 还是 (háishi) dùng trong câu hỏi (hoặc là); 或者 (huòzhě) dùng trong câu trần thuật.",
        formula: "可以 (kěyǐ) + 动词 (Động từ) + 吗 (ma)?",
        examples: [
          { chinese: "可以试一下吗？", pinyin: "Kěyǐ shì yíxià ma?", vietnamese: "Tôi thử một chút được không?" },
          { chinese: "可以便宜一点吗？", pinyin: "Kěyǐ piányi yìdiǎn ma?", vietnamese: "Có thể rẻ hơn một chút không?" }
        ]
      },
      {
        title: "2. Cấu trúc yêu cầu: 给我 (gěi wǒ) ... - Lấy cho tôi ...",
        description: "Dùng khi mua sắm hoặc nhờ vả để yêu cầu người khác lấy cho mình món đồ nào đó.",
        formula: "给我 (gěi wǒ) + [SỐ LƯỢNG] + [DANH TỪ]",
        examples: [
          { chinese: "给我一件这个。", pinyin: "Gěi wǒ yí jiàn zhège.", vietnamese: "Lấy cho tôi một cái này." },
          { chinese: "给我两瓶水。", pinyin: "Gěi wǒ liǎng píng shuǐ.", vietnamese: "Lấy cho tôi hai chai nước." }
        ]
      },
      {
        title: "3. Câu hỏi thăm dò: 还有 (hái yǒu) ... 吗 (ma)? - Còn ... không?",
        description: "Dùng để hỏi xem cửa hàng hoặc người đối thoại còn mặt hàng hoặc lựa chọn nào khác không.",
        formula: "还有 (hái yǒu) + [DANH TỪ] + 吗 (ma)?",
        examples: [
          { chinese: "还有别的颜色吗？", pinyin: "Hái yǒu bié de yánsè ma?", vietnamese: "Còn màu khác không?" },
          { chinese: "还有大一点的吗？", pinyin: "Hái yǒu dà yìdiǎn de ma?", vietnamese: "Còn cái to hơn không?" }
        ]
      }
    ]
  },
  {
    id: "lesson-7",
    lessonTitle: "Bài 7: Gọi điện thoại",
    points: [
      {
        title: "1. Cấu trúc gọi điện thoại: 给 (gěi) + Người + 打电话 (dǎ diànhuà)",
        description: "Dùng để biểu thị hành động chủ động gọi điện thoại cho một đối tượng cụ thể nào đó.",
        formula: "给 (gěi) + Người + 打电话 (dǎ diànhuà)",
        examples: [
          { chinese: "我给妈妈打电话。", pinyin: "Wǒ gěi māma dǎ diànhuà.", vietnamese: "Tôi gọi điện cho mẹ." },
          { chinese: "他要给老师打电话。", pinyin: "Tā yào gěi lǎoshī dǎ diànhuà.", vietnamese: "Anh ấy muốn gọi điện cho thầy giáo." }
        ]
      },
      {
        title: "2. Cấu trúc đồng tham gia: S + 跟 (gēn) + Người/Sự việc + 动词 (Động từ)",
        description: "Từ 跟 (gēn) có nghĩa là 'với', 'cùng', 'giữa'. Cấu trúc này dùng để nhấn mạnh một đối tượng cùng tham gia thực hiện hành động với chủ ngữ.",
        formula: "主语 (Chủ ngữ) + 跟 (gēn) + Người/Sự việc + 动词 (Động từ) (+ Tân ngữ)",
        examples: [
          { chinese: "我跟你打电话。", pinyin: "Wǒ gēn nǐ dǎ diànhuà.", vietnamese: "Tôi nói chuyện điện thoại với bạn." },
          { chinese: "她跟老师说话。", pinyin: "Tā gēn lǎoshī shuōhuà.", vietnamese: "Cô ấy nói chuyện với thầy giáo." }
        ]
      }
    ]
  },
  {
    id: "lesson-8",
    lessonTitle: "Bài 8: Hỏi đường",
    points: [
      {
        title: "1. Cấu trúc hỏi đường lịch sự: 请问 + [Địa điểm] + 在哪里？",
        description: "Dùng để lịch sự hỏi vị trí của một địa điểm hoặc người.",
        formula: "请问 (Qǐngwèn) + [Địa điểm] + 在哪里 (zài nǎlǐ)?",
        examples: [
          { chinese: "请问, 地铁站在哪里？", pinyin: "Qǐngwèn, dìtiě zhàn zài nǎlǐ?", vietnamese: "Xin hỏi, ga tàu điện ngầm ở đâu?" },
          { chinese: "请问, 便利店在哪里？", pinyin: "Qǐngwèn, biànlìdiàn zài nǎlǐ?", vietnamese: "Xin hỏi, cửa hàng tiện lợi ở đâu?" }
        ]
      },
      {
        title: "2. Cấu trúc chỉ vị trí tương đối: [Địa điểm A] + 在 + [Địa điểm B] + 的旁边 / 对面 / 前面 / 后面",
        description: "Nói vị trí tương đối của một địa điểm so với một địa điểm khác.",
        formula: "[A] + 在 (zài) + [B] + 的旁边 (de pángbiān) / 对面 (duìmiàn) / 前面 (qiánmiàn) / 后面 (hòumiàn)",
        examples: [
          { chinese: "学校在公园的旁边。", pinyin: "Xuēxiào zài gōngyuán de pángbiān.", vietnamese: "Trường học ở bên cạnh công viên." },
          { chinese: "超市在地铁站的对面。", pinyin: "Chāoshì zài dìtiě zhàn de duìmiàn.", vietnamese: "Siêu thị ở đối diện ga tàu điện ngầm." }
        ]
      },
      {
        title: "3. Cấu trúc hướng dẫn đi/rẽ: 往 + [Hướng/Bên] + 走 / 拐",
        description: "Cách dùng để hướng dẫn rẽ hoặc đi về một hướng cụ thể.",
        formula: "往 (Wǎng) + [左/右/前...] + 走 (zǒu) / 拐 (guǎi)",
        examples: [
          { chinese: "往左走，然后右拐。", pinyin: "Wǎng zuǒ zǒu, ránhòu yòu guǎi.", vietnamese: "Đi thẳng sang trái, sau đó rẽ phải." },
          { chinese: "往前走，过红绿灯左拐。", pinyin: "Wǎng qián zǒu, guò hónglǜdēng zuǒ guǎi.", vietnamese: "Đi thẳng, qua đèn giao thông rồi rẽ trái." }
        ]
      },
      {
        title: "4. Cấu trúc hỏi thời gian đi bộ: 走路 + [đến...] + 需要多长时间？",
        description: "Hỏi hoặc trả lời thời gian đi bộ từ một nơi đến một nơi khác.",
        formula: "走路 (zǒulù) + [đến...] + 需要多长时间 (xūyào duōcháng shíjiān)?\nHoặc: 从 [A] 走路到 [B] 需要多长时间？",
        examples: [
          { chinese: "从地铁站走路到学校需要多长时间？", pinyin: "Cóng dìtiě zhàn zǒulù dào xuéxiào xūyào duōcháng shíjiān?", vietnamese: "Đi bộ từ ga tàu điện ngầm đến trường mất bao lâu?" },
          { chinese: "从酒店走路到机场很近。", pinyin: "Cóng jiǔdiàn zǒulù dào jīchǎng hěn jìn.", vietnamese: "Đi bộ từ khách sạn đến sân bay rất gần." }
        ]
      }
    ]
  },
  {
    id: "lesson-9",
    lessonTitle: "Bài 9: Màu sắc",
    points: [
      {
        title: "1. Cấu trúc Tính Từ + 一点儿 (yìdiǎnr) - Hơn một chút",
        description: "Dùng khi muốn nói màu đậm hơn / nhạt hơn / sáng hơn một chút.",
        formula: "Tính Từ + 一点儿 (yìdiǎnr)",
        examples: [
          { chinese: "这个颜色亮一点儿。", pinyin: "Zhège yánsè liàng yìdiǎnr.", vietnamese: "Màu này sáng hơn một chút." },
          { chinese: "我想要浅一点儿的颜色。", pinyin: "Wǒ xiǎng yào qiǎn yìdiǎnr de yánsè.", vietnamese: "Tôi muốn màu nhạt hơn một chút." }
        ]
      },
      {
        title: "2. Cấu trúc 看起来 (kàn qǐlái) + Tính từ - Trông có vẻ...",
        description: "Dùng khi nhận xét màu sắc bằng cảm nhận thị giác.",
        formula: "看起来 (kàn qǐlái) + Tính từ",
        examples: [
          { chinese: "这个颜色看起来很好看。", pinyin: "Zhège yánsè kàn qǐlái hěn hǎokàn.", vietnamese: "Màu này nhìn rất đẹp." },
          { chinese: "深色看起来比较稳重。", pinyin: "Shēnsè kàn qǐlái bǐjiào wěnzhòng.", vietnamese: "Màu đậm trông khá chững chạc." }
        ]
      },
      {
        title: "3. Cấu trúc 比较 (bǐjiào) + Tính từ - Khá, tương đối",
        description: "Dùng khi so sánh nhẹ, nói mức độ vừa phải.",
        formula: "比较 (bǐjiào) + Tính từ",
        examples: [
          { chinese: "白色比较干净。", pinyin: "Báisè bǐjiào gānjìng.", vietnamese: "Màu trắng khá sạch sẽ." },
          { chinese: "这个颜色比较深。", pinyin: "Zhège yánsè bǐjiào shēn.", vietnamese: "Màu này khá đậm." }
        ]
      }
    ]
  },
  {
    id: "lesson-10",
    lessonTitle: "Bài 10: Tiền tệ",
    points: [
      {
        title: "1. Cấu trúc hỏi tổng số tiền: 一共 + 多少钱？",
        description: "Dùng để hỏi tổng số tiền phải trả là bao nhiêu.",
        formula: "一共 (yígòng) + 多少钱 (duōshao qián)?",
        examples: [
          { chinese: "一共多少钱？", pinyin: "Yígòng duōshao qián?", vietnamese: "Tổng cộng bao nhiêu tiền?" },
          { chinese: "一共一百五十块。", pinyin: "Yígòng yībǎi wǔshí kuài.", vietnamese: "Tổng cộng là 150 tệ." }
        ]
      },
      {
        title: "2. Cấu trúc diễn tả số tiền đã tiêu: 花 + 多少钱 + 买...",
        description: "Dùng để nói đã tiêu / đã tốn bao nhiêu tiền để mua một món đồ nào đó.",
        formula: "花 (huā) + [Số tiền] + 买 (mǎi) + [Món đồ]",
        examples: [
          { chinese: "我花一百块买这个。", pinyin: "Wǒ huā yībǎi kuài mǎi zhège.", vietnamese: "Tôi tốn 100 tệ để mua cái này." },
          { chinese: "他花很多钱买手机。", pinyin: "Tā huā hěn duō qián mǎi shǒujī.", vietnamese: "Anh ấy tốn rất nhiều tiền để mua điện thoại." }
        ]
      }
    ]
  }
];

export default function Grammar() {
  const [selectedLessonIdx, setSelectedLessonIdx] = useState<number>(0);
  const [activePointIdx, setActivePointIdx] = useState<number>(0);
  const [speakingText, setSpeakingText] = useState<string | null>(null);

  const currentLesson = GRAMMAR_DATA[selectedLessonIdx] || GRAMMAR_DATA[0];
  const activePoint = currentLesson.points[activePointIdx] || currentLesson.points[0];

  const handleSpeak = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert("Trình duyệt không hỗ trợ phát âm!");
      return;
    }
    window.speechSynthesis.cancel();
    setSpeakingText(text);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.85;

    utterance.onend = () => setSpeakingText(null);
    utterance.onerror = () => setSpeakingText(null);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col gap-6" id="grammar-outer-wrapper">
      {/* Lesson Selection Tab */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col gap-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <BookOpen size={14} className="text-indigo-600" />
          Bài Học Ngữ Pháp
        </span>
        <div className="flex flex-wrap gap-2 mt-1">
          {GRAMMAR_DATA.map((lesson, idx) => (
            <button
              key={lesson.id}
              onClick={() => {
                setSelectedLessonIdx(idx);
                setActivePointIdx(0);
              }}
              className={`px-5 py-3 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${selectedLessonIdx === idx
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
            >
              <span>{lesson.lessonTitle}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="grammar-main-container">

        {/* Sidebar: Grammar Points list (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <GraduationCap size={14} className="text-indigo-600" />
              Điểm ngữ pháp trong bài
            </span>
            <div className="flex flex-col gap-2">
              {currentLesson.points.map((point, i) => (
                <button
                  key={i}
                  onClick={() => setActivePointIdx(i)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer border ${activePointIdx === i
                    ? 'bg-indigo-55/70 border-indigo-200 text-indigo-700 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                >
                  <span className="truncate pr-2">{point.title}</span>
                  <ChevronRight size={14} className={activePointIdx === i ? 'text-indigo-500' : 'text-slate-400'} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Detail View (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col gap-5">
            {/* Header */}
            <div className="flex flex-col border-b border-slate-100 pb-4">
              <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider mb-1">{currentLesson.lessonTitle}</span>
              <h3 className="text-base font-bold text-slate-900">{activePoint.title}</h3>
            </div>

            {/* Explanation / Description */}
            <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-150">
              <span className="font-bold text-slate-800 block mb-1">💡 Giải thích ngữ pháp:</span>
              {activePoint.description}
            </div>

            {/* Formula / Structure */}
            {activePoint.formula && (
              <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl flex flex-col gap-1.5">
                <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">Cấu trúc / Công thức:</span>
                <span className="text-sm font-mono font-bold text-indigo-950 bg-white px-3 py-2 rounded-lg border border-indigo-100 shadow-sm inline-block w-fit">
                  {activePoint.formula}
                </span>
              </div>
            )}

            {/* Vocabulary Table (if any) */}
            {activePoint.tableRows && activePoint.tableHeaders && (
              <div className="overflow-x-auto border border-slate-200 rounded-xl mt-2">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-700">
                    <tr>
                      {activePoint.tableHeaders.map((header, index) => (
                        <th key={index} className="px-4 py-3 text-left font-semibold">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {activePoint.tableRows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50/50">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-4 py-3 text-slate-600">
                            {cell.includes('→') ? (
                              <span className="font-medium text-slate-900">{cell}</span>
                            ) : (
                              cell
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Example Sentences */}
            <div className="flex flex-col gap-3 mt-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <Sparkles size={14} className="text-amber-500" />
                Câu ví dụ minh họa:
              </span>
              <div className="grid grid-cols-1 gap-3">
                {activePoint.examples.map((ex, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSpeak(ex.chinese)}
                    className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 cursor-pointer transition flex items-start justify-between group"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-base font-semibold text-slate-950 font-sans tracking-wide">{ex.chinese}</span>
                      <span className="text-xs font-mono text-amber-600">{ex.pinyin}</span>
                      <span className="text-xs text-slate-500 border-t border-slate-100 pt-1 mt-1">{ex.vietnamese}</span>
                    </div>
                    <button
                      className={`p-2 rounded-lg shrink-0 transition ${speakingText === ex.chinese ? 'bg-indigo-600 text-white shadow' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                        }`}
                    >
                      <Volume2 size={14} className={speakingText === ex.chinese ? 'animate-pulse' : ''} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
