import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, RefreshCw, Award, ArrowLeft, Clock, GraduationCap, Languages } from 'lucide-react';
import { convertNumberedPinyin } from '../utils/pinyin';
import { GoogleGenAI } from '@google/genai';

interface QuestionMultipleChoice {
  id: number;
  type: 'multiple-choice';
  prompt: string;
  options: { label: string; text: string; pinyin: string; isCorrect: boolean }[];
  correctOption: string;
  explanation?: string;
}

interface QuestionFreeText {
  id: number;
  type: 'free-text';
  prompt: string;
  suggestions?: string[];
}

const ai = new GoogleGenAI({ apiKey: (import.meta as any).env.VITE_GEMINI_API_KEY || '' });

async function gradeWithAI(answersToGrade: any[], checkTones: boolean) {
  const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("No Gemini API key found. Using fallback local grading.");
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        Bạn là giáo viên tiếng Trung. Hãy chấm điểm các câu trả lời tự luận sau.
        
        Cấu hình chấm thi:
        - "checkTones" (chấm thanh điệu): ${checkTones}. 
          + Nếu checkTones là true: Câu trả lời tiếng Trung/Pinyin phải chính xác tuyệt đối cả về từ vựng lẫn dấu thanh điệu thì mới được điểm tối đa. Nếu sai thanh điệu hoặc thiếu dấu thanh điệu, hãy trừ điểm hoặc cho 0 điểm câu đó.
          + Nếu checkTones là false: Chấp nhận Pinyin không có dấu thanh điệu hoặc có dấu thanh điệu sai. TUY NHIÊN, KHÔNG ĐƯỢC CHẤP NHẬN SAI TỪ VỰNG HOẶC SAI CHÍNH TẢ PHÁT ÂM (ví dụ: viết "shengban" thay vì "shangban", hoặc viết sai hẳn mặt chữ Hán). Nếu sai từ hoặc sai âm chính tả như vậy, câu đó lập tức nhận 0 điểm (không cho điểm thành phần).
        
        Dưới đây là danh sách câu trả lời của học sinh kèm theo đề bài và đáp án gợi ý:
        ${JSON.stringify(answersToGrade)}
        
        Yêu cầu phản hồi:
        Hãy chấm điểm và trả về kết quả dưới dạng mảng JSON chứa kết quả cho từng câu có định dạng:
        [
          {
            "id": "p2_1",
            "score": number (từ 0 đến maxScore tương ứng của câu đó),
            "feedback": "lời giải thích/nhận xét ngắn gọn bằng tiếng Việt (ví dụ: 'Đúng câu mẫu', 'Sai dấu thanh của từ ...', 'Thiếu động từ ...')"
          }
        ]
        Không được thêm bất kỳ văn bản nào khác ngoài mảng JSON trên.
      `,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text) as Array<{ id: string; score: number; feedback: string }>;
    }
  } catch (e) {
    console.error("Gemini AI grading error:", e);
  }
  return null;
}

const part1_de1: QuestionMultipleChoice[] = [
  {
    id: 1,
    type: 'multiple-choice',
    prompt: 'Muốn nói: "Tôi quen bạn rồi."',
    options: [
      { label: 'A', text: '我认识你。', pinyin: 'Wǒ rènshi nǐ', isCorrect: true },
      { label: 'B', text: '我是认识你。', pinyin: 'Wǒ shì rènshi nǐ', isCorrect: false },
      { label: 'C', text: '我认识是你。', pinyin: 'Wǒ rènshi shì nǐ', isCorrect: false },
      { label: 'D', text: '我认识的你。', pinyin: 'Wǒ rènshi de nǐ', isCorrect: false },
    ],
    correctOption: 'A',
    explanation: 'Động từ "quen biết" là 认识 (rènshi). Trong câu khẳng định thông thường (S + V + O), không cần thêm "是" (shì) trừ khi muốn nhấn mạnh. Vậy "我认识你" (Tôi quen bạn) là đúng nhất.'
  },
  {
    id: 2,
    type: 'multiple-choice',
    prompt: 'Muốn nói: "Chúng tôi là học sinh."',
    options: [
      { label: 'A', text: '我们学生。', pinyin: 'Wǒmen xuéshēng', isCorrect: false },
      { label: 'B', text: '我们是学生。', pinyin: 'Wǒmen shì xuéshēng', isCorrect: true },
      { label: 'C', text: '我们有学生。', pinyin: 'Wǒmen yǒu xuéshēng', isCorrect: false },
      { label: 'D', text: '我们在学生。', pinyin: 'Wǒmen zài xuéshēng', isCorrect: false },
    ],
    correctOption: 'B',
    explanation: 'Động từ "là" trong tiếng Trung là 是 (shì). Cấu trúc: Chủ ngữ + 是 + Danh từ. "我们在学生" (ở học sinh) hay "我们有学生" (có học sinh) đều sai nghĩa.'
  },
  {
    id: 3,
    type: 'multiple-choice',
    prompt: 'Muốn hỏi: "Bạn đến từ đâu?"',
    options: [
      { label: 'A', text: '你是哪儿？', pinyin: 'Nǐ shì nǎr', isCorrect: false },
      { label: 'B', text: '你从哪儿来？', pinyin: 'Nǐ cóng nǎr lái', isCorrect: true },
      { label: 'C', text: '你来哪儿？', pinyin: 'Nǐ lái nǎr', isCorrect: false },
      { label: 'D', text: '你在哪儿来？', pinyin: 'Nǐ zài nǎr lái', isCorrect: false },
    ],
    correctOption: 'B',
    explanation: 'Cấu trúc "đến từ đâu" là 从 + địa điểm + 来 (cóng... lái). "哪儿" là đại từ nghi vấn (ở đâu). Do đó "你从哪儿来？" là câu hỏi chính xác.'
  },
  {
    id: 4,
    type: 'multiple-choice',
    prompt: 'Muốn nói: "Tôi biết nói tiếng Trung."',
    options: [
      { label: 'A', text: '我会说汉语。', pinyin: 'Wǒ huì shuō Hànyǔ', isCorrect: true },
      { label: 'B', text: '我说会汉语。', pinyin: 'Wǒ shuō huì Hànyǔ', isCorrect: false },
      { label: 'C', text: '我汉语会说。', pinyin: 'Wǒ Hànyǔ huì shuō', isCorrect: false },
      { label: 'D', text: '我是说汉语。', pinyin: 'Wǒ shì shuō Hànyǔ', isCorrect: false },
    ],
    correctOption: 'A',
    explanation: 'Biết làm gì đó thông qua học tập, rèn luyện dùng trợ động từ 会 (huì). Cấu trúc: 主语 (Chủ ngữ) + 会 + 动词 (Động từ) + 宾语 (Tân ngữ).'
  },
  {
    id: 5,
    type: 'multiple-choice',
    prompt: 'Muốn nói: "Bây giờ tôi đang học."',
    options: [
      { label: 'A', text: '现在我学习。', pinyin: 'Xiànzài wǒ xuéxí', isCorrect: false },
      { label: 'B', text: '我现在在学习。', pinyin: 'Wǒ xiànzài zài xuéxí', isCorrect: true },
      { label: 'C', text: '我学习现在。', pinyin: 'Wǒ xuéxí xiànzài', isCorrect: false },
      { label: 'D', text: '我在现在学习。', pinyin: 'Wǒ zài xiànzài xuéxí', isCorrect: false },
    ],
    correctOption: 'B',
    explanation: 'Để diễn tả hành động đang xảy ra, dùng phó từ 在 (zài) trước động từ. Phó từ chỉ thời gian (现在 - bây giờ) có thể đứng trước hoặc sau chủ ngữ. Câu "我现在在学习" (Tôi bây giờ đang học tập) là chuẩn xác nhất.'
  },
  {
    id: 6,
    type: 'multiple-choice',
    prompt: 'Muốn nói: "Tôi có một chút thời gian."',
    options: [
      { label: 'A', text: '我有时间一点。', pinyin: 'Wǒ yǒu shíjiān yīdiǎn', isCorrect: false },
      { label: 'B', text: '我有一点时间。', pinyin: 'Wǒ yǒu yīdiǎn shíjiān', isCorrect: true },
      { label: 'C', text: '我一点有时间。', pinyin: 'Wǒ yīdiǎn yǒu shíjiān', isCorrect: false },
      { label: 'D', text: '我时间有一点。', pinyin: 'Wǒ shíjiān yǒu yīdiǎn', isCorrect: false },
    ],
    correctOption: 'B',
    explanation: 'Cấu trúc chỉ số lượng ít cho danh từ là: 动词 (Động từ) + 一点(儿) (yìdiǎn(r)) + 名词 (Danh từ). Ở đây động từ là 有 (có), danh từ là 时间 (thời gian), nên "有一点时间" là đúng.'
  },
  {
    id: 7,
    type: 'multiple-choice',
    prompt: 'Muốn nói: "Hôm nay trời đã tối rồi."',
    options: [
      { label: 'A', text: '今天是晚上了。', pinyin: 'Jīntiān shì wǎnshang le', isCorrect: false },
      { label: 'B', text: '今天晚上了。', pinyin: 'Jīntiān wǎnshang le', isCorrect: false },
      { label: 'C', text: '今天已经晚上了。', pinyin: 'Jīntiān yǐjīng wǎnshang le', isCorrect: true },
      { label: 'D', text: '今天到了晚上。', pinyin: 'Jīntiān dào le wǎnshang', isCorrect: false },
    ],
    correctOption: 'C',
    explanation: 'Để nhấn mạnh một sự việc ĐÃ xảy ra hoặc đạt đến một trạng thái nào đó, ta dùng cấu trúc 已经... 了 (yǐjīng... le). "今天已经晚上了" diễn đạt rất tự nhiên "Hôm nay đã tối mất rồi".'
  },
  {
    id: 8,
    type: 'multiple-choice',
    prompt: 'Muốn nói: "Tôi thường gọi điện cho đồng nghiệp."',
    options: [
      { label: 'A', text: '我常常打电话同事。', pinyin: 'Wǒ chángcháng dǎ diànhuà tóngshì', isCorrect: false },
      { label: 'B', text: '我常常给同事打电话。', pinyin: 'Wǒ chángcháng gěi tóngshì dǎ diànhuà', isCorrect: true },
      { label: 'C', text: '我打电话常常同事。', pinyin: 'Wǒ dǎ diànhuà chángcháng tóngshì', isCorrect: false },
      { label: 'D', text: '我同事常常打电话。', pinyin: 'Wǒ tóngshì chángcháng dǎ diànhuà', isCorrect: false },
    ],
    correctOption: 'B',
    explanation: 'Trong tiếng Trung, giới từ chỉ đối tượng tiếp nhận hành động (给 - cho ai đó) phải đứng TRƯỚC động từ chính. Cấu trúc chuẩn là 给 + Người nhận + 打电话. Do đó "给同事打电话" mới chính xác.'
  },
  {
    id: 9,
    type: 'multiple-choice',
    prompt: 'Muốn nói: "Hôm qua tôi không đi làm."',
    options: [
      { label: 'A', text: '昨天我不上班。', pinyin: 'Zuótiān wǒ bù shàngbān', isCorrect: false },
      { label: 'B', text: '昨天我没有上班。', pinyin: 'Zuótiān wǒ méiyǒu shàngbān', isCorrect: true },
      { label: 'C', text: '我昨天不上班了。', pinyin: 'Wǒ zuótiān bù shàngbān le', isCorrect: false },
      { label: 'D', text: '昨天我不是上班。', pinyin: 'Zuótiān wǒ bú shì shàngbān', isCorrect: false },
    ],
    correctOption: 'B',
    explanation: 'Để phủ định một hành động đã KHÔNG xảy ra trong quá khứ (hôm qua - 昨天), bắt buộc phải dùng 没 hoặc 没有 (méiyǒu). Không được dùng 不 (bù) vì 不 thường dùng phủ định hiện tại/tương lai hoặc thói quen.'
  },
  {
    id: 10,
    type: 'multiple-choice',
    prompt: 'Muốn nói: "Chúng tôi gặp nhau ở siêu thị."',
    options: [
      { label: 'A', text: '我们在超市认识。', pinyin: 'Wǒmen zài chāoshì rènshi', isCorrect: false },
      { label: 'B', text: '我们在超市见面。', pinyin: 'Wǒmen zài chāoshì jiànmiàn', isCorrect: true },
      { label: 'C', text: '我们在超市。', pinyin: 'Wǒmen zài chāoshì', isCorrect: false },
      { label: 'D', text: '我们在超市认识的。', pinyin: 'Wǒmen zài chāoshì rènshi de', isCorrect: false },
    ],
    correctOption: 'B',
    explanation: 'Trạng ngữ chỉ địa điểm có cấu trúc: 在 + Địa điểm + Động từ (Làm gì ở đâu). Động từ "gặp nhau, gặp mặt" là 见面 (jiànmiàn). "我们在超市见面" là cách nói chính xác nhất.'
  }
];

const part2_de1: QuestionFreeText[] = [
  { id: 1, type: 'free-text', prompt: 'Bây giờ bạn đang ở nhà hay ở công ty?', suggestions: ['我现在在家。 (Wǒ xiànzài zài jiā.)', '我现在在公司。 (Wǒ xiànzài zài gōngsī.)'] },
  { id: 2, type: 'free-text', prompt: 'Hôm nay bạn đi làm lúc mấy giờ?', suggestions: ['今天我早上八点上班。 (Jīntiān wǒ zǎoshang bā diǎn shàngbān.)', '我今天九点去上班。 (Wǒ jīntiān jiǔ diǎn qù shàngbān.)'] },
  { id: 3, type: 'free-text', prompt: 'Buổi tối bạn thường làm gì để thư giãn?', suggestions: ['晚上我常常听音乐和看书。 (Wǎnshang wǒ chángcháng tīng yīnyuè hé kàn shū.)', '我常常看电影。 (Wǒ chángcháng kàn diànyǐng.)'] },
  { id: 4, type: 'free-text', prompt: 'Bạn thích màu gì?', suggestions: ['我喜欢蓝色和白色。 (Wǒ xǐhuan lánsè hé báisè.)', '我很喜欢黑色。 (Wǒ hěn xǐhuan hēisè.)'] },
  { id: 5, type: 'free-text', prompt: 'Cuối tuần bạn thường làm gì?', suggestions: ['周末我常常去买东西。 (Zhōumò wǒ chángcháng qù mǎi dōngxi.)', '周末我有时候在家休息，有时候和朋友去喝咖啡。 (Zhōumò wǒ yǒushíhou zài jiā xiūxi, yǒushíhou hé péngyou qù hē kāfēi.)'] },
  { id: 6, type: 'free-text', prompt: 'Bạn có hay mua sắm ở siêu thị không?', suggestions: ['我经常去超市买东西。 (Wǒ jīngcháng qù chāoshì mǎi dōngxi.)', '我不常去超市。 (Wǒ bù cháng qù chāoshì.)'] },
  { id: 7, type: 'free-text', prompt: 'Khi rảnh, bạn thích xem phim hay nghe nhạc?', suggestions: ['有空的时候，我喜欢看电影。 (Yǒu kòng de shíhou, wǒ xǐhuan kàn diànyǐng.)', '我都喜欢。 (Wǒ dōu xǐhuan.)'] },
  { id: 8, type: 'free-text', prompt: 'Bạn có thường gọi điện cho bạn bè không?', suggestions: ['我常常给朋友打电话。 (Wǒ chángcháng gěi péngyou dǎ diànhuà.)', '我不常给他们打电话，我们常常发短信。 (Wǒ bù cháng gěi tāmen dǎ diànhuà, wǒmen chángcháng fā duǎnxìn.)'] },
  { id: 9, type: 'free-text', prompt: 'Bạn nuôi thú cưng gì ? tại sao?', suggestions: ['我养一只猫，因为它很可爱。 (Wǒ yǎng yī zhī māo, yīnwèi tā hěn kě\'ài.)', '我养狗，因为狗是人类的好朋友。 (Wǒ yǎng gǒu, yīnwèi gǒu shì rénlèi de hǎo péngyou.)'] },
  { id: 10, type: 'free-text', prompt: 'Bạn thích ăn món gì?', suggestions: ['我喜欢吃牛肉面和饺子。 (Wǒ xǐhuan chī niúròu miàn hé jiǎozi.)', '我很喜欢吃中国菜。 (Wǒ hěn xǐhuan chī zhōngguó cài.)'] },
];

const part3_de1 = [
  { id: 1, type: 'free-text', prompt: '现在我在公司上班。 (Xiànzài wǒ zài gōngsī shàngbān.)' },
  { id: 2, type: 'free-text', prompt: '我每天早上七点起床。 (Wǒ měitiān zǎoshang qī diǎn qǐchuáng.)' },
  { id: 3, type: 'free-text', prompt: '下班以后，我常常回家做饭。 (Xiàbān yǐhòu, wǒ chángcháng huí jiā zuò fàn.)' },
  { id: 4, type: 'free-text', prompt: '他不喜欢黑色，喜欢白色。 (Tā bù xǐhuan hēisè, xǐhuan báisè.)' },
  { id: 5, type: 'free-text', prompt: '今天我很忙，没有时间休息。 (Jīntiān wǒ hěn máng, méiyǒu shíjiān xiūxi.)' },
  { id: 6, type: 'free-text', prompt: '这个东西太贵了，便宜一点吧。 (Zhège dōngxi tài guì le, piányi yìdiǎn ba.)' },
  { id: 7, type: 'free-text', prompt: '晚上我在家看书和听音乐。 (Wǎnshang wǒ zài jiā kàn shū hé tīng yīnyuè.)' },
  { id: 8, type: 'free-text', prompt: '她有时候去超市买东西。 (Tā yǒu shíhou qù chāoshì mǎi dōngxi.)' },
  { id: 9, type: 'free-text', prompt: '我很高兴认识你。 (Wǒ hěn gāoxìng rènshi nǐ.)' },
  { id: 10, type: 'free-text', prompt: '现在打电话不方便，我一会儿再打给你。 (Xiànzài dǎ diànhuà bù fāngbiàn, wǒ yíhuìr zài dǎ gěi nǐ.)' },
];

const part4_de1 = [
  { id: 1, type: 'free-text', prompt: 'Bây giờ tôi đang ở văn phòng.', suggestions: ['现在我在办公室。 (Xiànzài wǒ zài bàngōngshì.)', '我现在在办公室。 (Wǒ xiànzài zài bàngōngshì.)'] },
  { id: 2, type: 'free-text', prompt: 'Mỗi ngày tôi thường dậy sớm.', suggestions: ['我每天早上起床很早。 (Wǒ měitiān zǎoshang qǐchuáng hěn zǎo.)', '我每天都早起。 (Wǒ měitiān dōu zǎoqǐ.)'] },
  { id: 3, type: 'free-text', prompt: 'Sau khi tan làm, tôi về nhà nghỉ ngơi.', suggestions: ['下班以后，我回家休息。 (Xiàbān yǐhòu, wǒ huí jiā xiūxi.)'] },
  { id: 4, type: 'free-text', prompt: 'Tôi không thích màu tối, tôi thích màu sáng.', suggestions: ['我不喜欢深色，我喜欢浅色。 (Wǒ bù xǐhuan shēnsè, wǒ xǐhuan qiǎnsè.)', '我不喜欢黑色，我喜欢白色。 (Wǒ bù xǐhuan hēisè, wǒ xǐhuan báisè.)'] },
  { id: 5, type: 'free-text', prompt: 'Hôm nay tôi rất bận, không có thời gian.', suggestions: ['今天我很忙，没有时间。 (Jīntiān wǒ hěn máng, méiyǒu shíjiān.)', '今天我太忙了，没有时间。 (Jīntiān wǒ tài máng le, méiyǒu shíjiān.)'] },
  { id: 6, type: 'free-text', prompt: 'Cái này đắt quá, có thể rẻ hơn một chút không?', suggestions: ['这个太贵了，便宜一点吧？ (Zhège tài guì le, piányi yìdiǎn ba?)', '这个太贵了，可以便宜一点吗？ (Zhège tài guì le, kěyǐ piányi yìdiǎn ma?)'] },
  { id: 7, type: 'free-text', prompt: 'Buổi tối tôi thường xem phim hoặc nghe nhạc.', suggestions: ['晚上我常常看电影或者听音乐。 (Wǎnshang wǒ chángcháng kàn diànyǐng huòzhě tīng yīnyuè.)'] },
  { id: 8, type: 'free-text', prompt: 'Cuối tuần tôi có lúc ở nhà, có lúc ra ngoài.', suggestions: ['周末我有时候在家，有时候出去。 (Zhōumò wǒ yǒushíhou zài jiā, yǒushíhou chūqù.)'] },
  { id: 9, type: 'free-text', prompt: 'Tôi có một con mèo, nó là thú cưng của tôi.', suggestions: ['我有一只猫，它是我的宠物。 (Wǒ yǒu yī zhī māo, tā shì wǒ de chǒngwù.)'] },
  { id: 10, type: 'free-text', prompt: 'Bây giờ tôi đang bận, lát nữa sẽ gọi lại cho bạn.', suggestions: ['现在我很忙，一会儿再打给你。 (Xiànzài wǒ hěn máng, yíhuìr zài dǎ gěi nǐ.)'] },
];

// ==================== ĐỀ 2 (BÀI 0 - 6) ====================
const part1_de2: QuestionMultipleChoice[] = [
  {
    id: 1,
    type: 'multiple-choice',
    prompt: 'Khi muốn chào thầy giáo một cách lịch sự, bạn nên nói thế nào?',
    options: [
      { label: 'A', text: '你好老师', pinyin: 'Nǐ hǎo lǎoshī', isCorrect: false },
      { label: 'B', text: '老师，您好！', pinyin: 'Lǎoshī, nín hǎo!', isCorrect: true },
      { label: 'C', text: '老师，你好 ma？', pinyin: 'Lǎoshī, nǐ hǎo ma?', isCorrect: false },
      { label: 'D', text: '老师再见', pinyin: 'Lǎoshī zàijiàn', isCorrect: false },
    ],
    correctOption: 'B',
    explanation: 'Sử dụng "您" (nín) thay cho "你" (nǐ) thể hiện sự tôn kính và lịch sự khi chào thầy cô giáo: "老师，您好！"'
  },
  {
    id: 2,
    type: 'multiple-choice',
    prompt: 'Cách hỏi họ của đối phương một cách lịch sự, tôn kính:',
    options: [
      { label: 'A', text: '你叫什么？', pinyin: 'Nǐ jiào shénme?', isCorrect: false },
      { label: 'B', text: '请问您贵姓？', pinyin: 'Qǐngwèn nín guìxìng?', isCorrect: true },
      { label: 'C', text: '你名字是什么？', pinyin: 'Nǐ míngzi shì shénme?', isCorrect: false },
      { label: 'D', text: '您好名字？', pinyin: 'Nín hǎo míngzi?', isCorrect: false },
    ],
    correctOption: 'B',
    explanation: '"请问" (qǐngwèn) nghĩa là xin hỏi, "贵姓" (guìxìng) là cách nói trang trọng tôn kính để hỏi họ của người khác.'
  },
  {
    id: 3,
    type: 'multiple-choice',
    prompt: 'Muốn nói "Bây giờ là 8 giờ rưỡi tối", câu nào sau đây đúng?',
    options: [
      { label: 'A', text: '现在是早上八点半。', pinyin: 'Xiànzài shì zǎoshang bā diǎn bàn.', isCorrect: false },
      { label: 'B', text: '现在晚上八点半。', pinyin: 'Xiànzài wǎnshang bā diǎn bàn.', isCorrect: true },
      { label: 'C', text: '现在是晚上八点三十分分。', pinyin: 'Xiànzài shì wǎnshang bā diǎn sānshí fēn fēn.', isCorrect: false },
      { label: 'D', text: '现在晚上八点。', pinyin: 'Xiànzài wǎnshang bā diǎn.', isCorrect: false },
    ],
    correctOption: 'B',
    explanation: 'Để diễn đạt giờ giấc, ta nói buổi trước rồi đến giờ: "晚上" (buổi tối) + "八点半" (8 rưỡi).'
  },
  {
    id: 4,
    type: 'multiple-choice',
    prompt: 'Muốn hỏi "Mấy giờ bạn đi làm?", bạn chọn câu nào?',
    options: [
      { label: 'A', text: '你几点上班？', pinyin: 'Nǐ jǐ diǎn shàngbān?', isCorrect: true },
      { label: 'B', text: '你上班几点？', pinyin: 'Nǐ shàngbān jǐ diǎn?', isCorrect: false },
      { label: 'C', text: '几点你下班？', pinyin: 'Jǐ diǎn nǐ xiàbān?', isCorrect: false },
      { label: 'D', text: '你什么时候上班了？', pinyin: 'Nǐ shénme shíhou shàngbān le?', isCorrect: false },
    ],
    correctOption: 'A',
    explanation: 'Từ hỏi thời gian "几点" (mấy giờ) đứng trước động từ "上班" (đi làm): "你几点上班？"'
  },
  {
    id: 5,
    type: 'multiple-choice',
    prompt: 'Chọn câu có nghĩa: "Tôi thích nghe nhạc và đọc sách."',
    options: [
      { label: 'A', text: '我喜欢听音乐和看书。', pinyin: 'Wǒ xǐhuan tīng yīnyuè hé kàn shū.', isCorrect: true },
      { label: 'B', text: '我喜欢听音乐看电影。', pinyin: 'Wǒ xǐhuan tīng yīnyuè kàn diànyǐng.', isCorrect: false },
      { label: 'C', text: '我想听音乐看书。', pinyin: 'Wǒ xiǎng tīng yīnyuè kàn shū.', isCorrect: false },
      { label: 'D', text: '我喜欢和朋友听音乐。', pinyin: 'Wǒ xǐhuan hé péngyou tīng yīnyuè.', isCorrect: false },
    ],
    correctOption: 'A',
    explanation: '"听音乐" (tīng yīnyuè - nghe nhạc), "看书" (kàn shū - đọc sách), liên từ "和" dùng kết nối hai hành động/sở thích.'
  },
  {
    id: 6,
    type: 'multiple-choice',
    prompt: 'Muốn hỏi "Cái này bao nhiêu tiền?", bạn nói thế nào?',
    options: [
      { label: 'A', text: '这个多少钱？', pinyin: 'Zhège duōshao qián?', isCorrect: true },
      { label: 'B', text: '这个太贵了。', pinyin: 'Zhège tài guì le.', isCorrect: false },
      { label: 'C', text: '那个是什么钱？', pinyin: 'Nàge shì shénme qián?', isCorrect: false },
      { label: 'D', text: '这个便宜钱？', pinyin: 'Zhège piányi qián?', isCorrect: false },
    ],
    correctOption: 'A',
    explanation: '"多少钱" (duōshao qián) là cụm từ để hỏi giá tiền: "这个多少钱？" (Cái này bao nhiêu tiền?).'
  },
  {
    id: 7,
    type: 'multiple-choice',
    prompt: 'Chọn câu có nghĩa: "Cuối tuần tôi thường đi siêu thị mua đồ."',
    options: [
      { label: 'A', text: '周末我常常去超市买东西。', pinyin: 'Zhōumò wǒ chángcháng qù chāoshì mǎi dōngxi.', isCorrect: true },
      { label: 'B', text: '周末我有时候去超市。', pinyin: 'Zhōumò wǒ yǒushíhou qù chāoshì.', isCorrect: false },
      { label: 'C', text: '我常常去超市周末。', pinyin: 'Wǒ chángcháng qù chāoshì zhōumò.', isCorrect: false },
      { label: 'D', text: '周末我不常去超市买东西。', pinyin: 'Zhōumò wǒ bù cháng qù chāoshì mǎi dōngxi.', isCorrect: false },
    ],
    correctOption: 'A',
    explanation: '"周末" (cuối tuần), "常常" (thường xuyên), "去超市买东西" (đi siêu thị mua đồ). Trạng ngữ thời gian/tần suất đứng trước cụm động từ.'
  },
  {
    id: 8,
    type: 'multiple-choice',
    prompt: 'Điền từ thích hợp vào chỗ trống: 我___说汉语。 (Tôi biết nói tiếng Trung.)',
    options: [
      { label: 'A', text: '懂', pinyin: 'dǒng', isCorrect: false },
      { label: 'B', text: '会', pinyin: 'huì', isCorrect: true },
      { label: 'C', text: '在', pinyin: 'zài', isCorrect: false },
      { label: 'D', text: '是', pinyin: 'shì', isCorrect: false },
    ],
    correctOption: 'B',
    explanation: 'Sử dụng động từ năng nguyện "会" (huì) để diễn tả khả năng có được thông qua việc học tập, rèn luyện.'
  },
  {
    id: 9,
    type: 'multiple-choice',
    prompt: 'Chọn câu đúng để nói: "Hôm qua tôi không đi học."',
    options: [
      { label: 'A', text: '昨天我不去学校。', pinyin: 'Zuótiān wǒ bú qù xuéxiào.', isCorrect: false },
      { label: 'B', text: '昨天我没去学校。', pinyin: 'Zuótiān wǒ méi qù xuéxiào.', isCorrect: true },
      { label: 'C', text: '昨天我是不去学校。', pinyin: 'Zuótiān wǒ bú shì qù xuéxiào.', isCorrect: false },
      { label: 'D', text: '我昨天不上班了。', pinyin: 'Wǒ zuótiān bú shàngbān le.', isCorrect: false },
    ],
    correctOption: 'B',
    explanation: 'Để phủ định hành động trong quá khứ, sử dụng phó từ "没" hoặc "没有", không dùng "不".'
  },
  {
    id: 10,
    type: 'multiple-choice',
    prompt: 'Khi mua hàng, muốn nói: "Đắt quá, rẻ một chút đi!", bạn chọn câu nào?',
    options: [
      { label: 'A', text: '太贵了，便宜一点吧！', pinyin: 'Tài guì le, piányi yìdiǎn ba!', isCorrect: true },
      { label: 'B', text: '慢/很贵了，一点便宜。', pinyin: 'Hěn guì le, yìdiǎn piányi.', isCorrect: false },
      { label: 'C', text: '太贵了，不便宜。', pinyin: 'Tài guì le, bù piányi.', isCorrect: false },
      { label: 'D', text: '这个太贵，可以便宜。', pinyin: 'Zhège tài guì, kěyǐ piányi.', isCorrect: false },
    ],
    correctOption: 'A',
    explanation: 'Cấu trúc mặc cả: "太...了" (quá...) + "便宜一点" (rẻ một chút) + trợ từ ngữ khí "吧" để đưa ra lời đề nghị.'
  }
];

const part2_de2: QuestionFreeText[] = [
  { id: 1, type: 'free-text', prompt: 'Bạn tên là gì?', suggestions: ['我叫安。 (Wǒ jiào Ān.)', '我叫明。 (Wǒ jiào Míng.)'] },
  { id: 2, type: 'free-text', prompt: 'Bạn là người Việt Nam hay người Trung Quốc?', suggestions: ['我是越南人。 (Wǒ shì Yuènánrén.)', '我是中国人。 (Wǒ shì Zhōngguórén.)'] },
  { id: 3, type: 'free-text', prompt: 'Năm nay bạn bao nhiêu tuổi?', suggestions: ['我今年二十岁。 (Wǒ jīnnián èrshí suì.)', '我今年三十岁。 (Wǒ jīnnián sānshí suì.)'] },
  { id: 4, type: 'free-text', prompt: 'Bây giờ bạn sống ở đâu?', suggestions: ['我现在住在河内。 (Wǒ xiànzài zhù zài Hénèi.)', '我现在住在胡志明市。 (Wǒ xiànzài zhù zài Húzhìmíng Shì.)'] },
  { id: 5, type: 'free-text', prompt: 'Mỗi ngày bạn ngủ dậy lúc mấy giờ?', suggestions: ['我每天早上六点起床。 (Wǒ měitiān zǎoshang liù diǎn qǐchuáng.)', '我每天七点起床。 (Wǒ měitiān qī diǎn qǐchuáng.)'] },
  { id: 6, type: 'free-text', prompt: 'Hôm nay bạn bận không?', suggestions: ['我今天很忙。 (Wǒ jīntiān hěn máng.)', '我今天不忙。 (Wǒ jīntiān bù máng.)'] },
  { id: 7, type: 'free-text', prompt: 'Bạn có thích nghe nhạc không?', suggestions: ['我很喜欢听音乐。 (Wǒ hěn xǐhuan tīng yīnyuè.)', '我不喜欢听音乐。 (Wǒ bù xǐhuan tīng yīnyuè.)'] },
  { id: 8, type: 'free-text', prompt: 'Cuối tuần bạn thường đi đâu?', suggestions: ['周末我常常去超市。 (Zhōumò wǒ chángcháng qù chāoshì.)', '周末我常常回家。 (Zhōumò wǒ chángcháng huí jiā.)'] },
  { id: 9, type: 'free-text', prompt: 'Chữ Hán này nói thế nào?', suggestions: ['不知道。 (Bù zhīdào.)', '请慢一点说。 (Qǐng màn yìdiǎn shuō.)'] },
  { id: 10, type: 'free-text', prompt: 'Bạn có muốn đi Trung Quốc không?', suggestions: ['你想去中国。 (Wǒ xiǎng qù Zhōngguó.)', '我不想去中国。 (Wǒ bù xiǎng qù Zhōngguó.)'] }
];

const part3_de2 = [
  { id: 1, type: 'free-text', prompt: '我叫安，我是越南人。 (Wǒ jiào Ān, wǒ shì Yuènánrén.)' },
  { id: 2, type: 'free-text', prompt: '请问您贵姓？ (Qǐngwèn nín guìxìng?)' },
  { id: 3, type: 'free-text', prompt: '我现在在公司工作。 (Wǒ xiànzài zài gōngsī gōngzuò.)' },
  { id: 4, type: 'free-text', prompt: '今天我很忙，没有时间休息。 (Jīntiān wǒ hěn máng, méiyǒu shíjiān xiūxi.)' },
  { id: 5, type: 'free-text', prompt: '我每天早上七点起床。 (Wǒ měitiān zǎoshang qī diǎn qǐchuáng.)' },
  { id: 6, type: 'free-text', prompt: '下班以后，你常常去哪儿？ (Xiàbān yǐhòu, nǐ chángcháng qù nǎr?)' },
  { id: 7, type: 'free-text', prompt: '这个东西太贵了，便宜一点吧。 (Zhège dōngxi tài guì le, piányi yìdiǎn ba.)' },
  { id: 8, type: 'free-text', prompt: '我有两个弟弟和一个妹妹。 (Wǒ yǒu liǎng ge dìdi hé yí ge mèimei.)' },
  { id: 9, type: 'free-text', prompt: '周末我有时候在家睡觉，有时候去超市买东西。 (Zhōumò wǒ yǒushíhou zài jiā shuìjiào, yǒushíhou qù chāoshì mǎi dōngxi.)' },
  { id: 10, type: 'free-text', prompt: '他是我们的汉语老师。 (Tā shì wǒmen de Hànyǔ lǎoshī.)' },
  { id: 11, type: 'free-text', prompt: '你会说英语吗？ (Nǐ huì shuō Yīngyǔ ma?)' },
  { id: 12, type: 'free-text', prompt: '对不起，我现在没有时间。 (Duìbuqǐ, wǒ xiànzài méiyǒu shíjiān.)' },
  { id: 13, type: 'free-text', prompt: '今天星期几？今天星期五。 (Jīntiān xīngqījǐ? Jīntiān xīngqīwǔ.)' },
  { id: 14, type: 'free-text', prompt: '我们去那家咖啡馆喝咖啡吧。 (Wǒmen qù nà jiā kāfēiguǎn hē kāfēi ba.)' },
  { id: 15, type: 'free-text', prompt: '再见，明天见！ (Zàijiàn, míngtiān jiàn!)' }
];

const part4_de2 = [
  { id: 1, type: 'free-text', prompt: 'Xin chào, quen biết bạn tôi rất vui.', suggestions: ['你好，认识你很高兴。 (Nǐ hǎo, rènshi nǐ hěn gāoxìng.)', '你好，很高兴认识你。 (Nǐ hǎo, hěn gāoxìng rènshi nǐ.)'] },
  { id: 2, type: 'free-text', prompt: 'Bố tôi là bác sĩ, mẹ tôi là giáo viên.', suggestions: ['我爸爸是医生，我妈妈是老师。 (Wǒ bàba : shì yīshēng, wǒ māma : shì lǎoshī.)'] },
  { id: 3, type: 'free-text', prompt: 'Bây giờ là mấy giờ? Bây giờ là 9 giờ tối.', suggestions: ['现在几点？现在晚上九点。 (Xiànzài jǐ diǎn? Xiànzài wǎnshang jiǔ diǎn.)', '现在几点了？现在是晚上九点。 (Xiànzài jǐ diǎn le? Xiànzài shì wǎnshang jiǔ diǎn.)'] },
  { id: 4, type: 'free-text', prompt: 'Hôm nay tôi không đi làm, tôi ở nhà nghỉ ngơi.', suggestions: ['今天我不上班，我在家休息。 (Jīntiān wǒ bù shàngbān, wǒ zài jiā xiūxi.)', '今天我没有上班，我在家休息。 (Jīntiān wǒ méiyǒu shàngbān, wǒ zài jiā xiūxi.)'] },
  { id: 5, type: 'free-text', prompt: 'Tôi biết nói một chút tiếng Trung.', suggestions: ['我会说一点汉语。 (Wǒ huì shuō yìdiǎn Hànyǔ.)', '我会说一点中文。 (Wǒ huì shuō yìdiǎn Zhōngwén.)'] },
  { id: 6, type: 'free-text', prompt: 'Cái này bao nhiêu tiền? Hai mươi đồng (tệ).', suggestions: ['这个多少钱？二十块。 (Zhège duōshao qián? Èrshí kuài.)', '这个多少钱？二十元。 (Zhège duōshao qián? Èrshí yuán.)'] },
  { id: 7, type: 'free-text', prompt: 'Buổi tối anh ấy thường xem phim ở nhà.', suggestions: ['晚上tā/他常常在家看电影。 (Wǎnshang tā chángcháng zài jiā kàn diànyǐng.)', '他晚上常常在家看电影。 (Tā wǎnshang chángcháng zài jiā kàn diànyǐng.)'] },
  { id: 8, type: 'free-text', prompt: 'Cuối tuần bạn thích làm gì?', suggestions: ['周末你喜欢做什么？ (Zhōumò nǐ xǐhuan zuò shénme?)', '周末你喜欢干什么？ (Zhōumò nǐ xǐhuan gàn shénme?)'] },
  { id: 9, type: 'free-text', prompt: 'Tôi muốn đi siêu thị mua một ít đồ.', suggestions: ['我想去超市买点东西。 (Wǒ xiǎng qù chāoshì mǎi diàn dōngxi.)', '我想去超市买东西。 (Wǒ xiǎng qù chāoshì mǎi dōngxi.)'] },
  { id: 10, type: 'free-text', prompt: 'Em trai của bạn làm việc ở đâu?', suggestions: ['你弟弟在哪儿工作？ (Nǐ dìdi zài nǎr gōngzuò?)', '你弟弟在什么地方工作？ (Nǐ dìdi zài shénme dìfang gōngzuò?)'] },
  { id: 11, type: 'free-text', prompt: 'Xin hỏi, bạn có phải là giáo viên không?', suggestions: ['请问，你是老师吗？ (Qǐngwèn, nǐ shì lǎoshī ma?)', '请问，您是老师吗？ (Qǐngwèn, nín shì lǎoshī ma?)'] },
  { id: 12, type: 'free-text', prompt: 'Hôm qua tôi đi mua sắm cùng bạn bè.', suggestions: ['昨天我和朋友去买东西。 (Zuótiān wǒ hé péngyou qù mǎi dōngxi.)', '昨天我跟朋友一起去买东西。 (Zuótiān wǒ gēn péngyou yìqǐ qù mǎi dōngxi.)'] },
  { id: 13, type: 'free-text', prompt: 'Cái túi này đắt quá, có thể rẻ hơn một chút không?', suggestions: ['这个包太贵了，可以便宜一点吗？ (Zhège bāo tài guì le, kěyǐ piányi yìdiǎn ma?)', '这个包太贵了，便宜一点吧。 (Zhège bāo tài guì le, piányi yìdiǎn ba.)'] },
  { id: 14, type: 'free-text', prompt: 'Mỗi ngày tôi bận từ 8 giờ sáng đến 5 giờ chiều.', suggestions: ['我每天从早上八点忙 do/到下午五点。 (Wǒ měitiān cóng zǎoshang bā diǎn máng dào xiàwǔ wǔ diǎn.)'] },
  { id: 15, type: 'free-text', prompt: 'Không sao đâu, không cần cảm ơn.', suggestions: ['没关系，不用谢。 (Méi guānxi, bú yòng xiè.)', '没关系，不客气。 (Méi guānxi, bú kèqi.)'] }
];

// ==================== ĐỀ 3 (BÀI 7 - 12) ====================
const part1_de3: QuestionMultipleChoice[] = [
  {
    id: 1,
    type: 'multiple-choice',
    prompt: 'Khi gọi điện thoại mà máy bận, tiếng Trung dùng từ nào?',
    options: [
      { label: 'A', text: '占线', pinyin: 'zhànxiàn', isCorrect: true },
      { label: 'B', text: '挂电话', pinyin: 'guà diànhuà', isCorrect: false },
      { label: 'C', text: '打错了', pinyin: 'dǎ cuò le', isCorrect: false },
      { label: 'D', text: '没信号', pinyin: 'méi xìnhào', isCorrect: false },
    ],
    correctOption: 'A',
    explanation: 'Từ "占线" (zhànxiàn) nghĩa là đường dây bận (máy bận).'
  },
  {
    id: 2,
    type: 'multiple-choice',
    prompt: 'Muốn nói "Đi thẳng về phía trước", bạn chọn câu nào?',
    options: [
      { label: 'A', text: '往前面直走。', pinyin: 'Wǎng qiánmiàn zhí zǒu.', isCorrect: true },
      { label: 'B', text: '往前面左拐。', pinyin: 'Wǎng qiánmiàn zuǒ guǎi.', isCorrect: false },
      { label: 'C', text: '往右拐就到。', pinyin: 'Wǎng yòu guǎi jiù dào.', isCorrect: false },
      { label: 'D', text: '离这里很近。', pinyin: 'Lí zhèlǐ hěn jìn.', isCorrect: false },
    ],
    correctOption: 'A',
    explanation: '"往前面直走" (Wǎng qiánmiàn zhí zǒu) là đi thẳng về phía trước.'
  },
  {
    id: 3,
    type: 'multiple-choice',
    prompt: 'Chọn câu có nghĩa: "Hai màu này rất dễ phối đồ."',
    options: [
      { label: 'A', text: '这两种颜色很好搭配。', pinyin: 'Zhè liǎng zhǒng yánsè hěn hǎo dāpèi.', isCorrect: true },
      { label: 'B', text: '这个颜色看起来很大。', pinyin: 'Zhège yánsè kàn qǐlái gèng dà.', isCorrect: false },
      { label: 'C', text: '我觉得 cái/这个更合适。', pinyin: 'Wǒ juéde zhège gèng héshì.', isCorrect: false },
      { label: 'D', text: '白色让房间很干净。', pinyin: 'Báisè ràng fángjiān hěn gānjìng.', isCorrect: false },
    ],
    correctOption: 'A',
    explanation: '"搭配" (dāpèi) nghĩa là phối hợp, kết hợp, phối đồ.'
  },
  {
    id: 4,
    type: 'multiple-choice',
    prompt: 'Muốn hỏi "Thanh toán thế nào?", bạn chọn câu nào?',
    options: [
      { label: 'A', text: '怎么支付？', pinyin: 'Zěnme zhīfù?', isCorrect: true },
      { label: 'B', text: '微信支付。', pinyin: 'Wēixìn zhīfù.', isCorrect: false },
      { label: 'C', text: '谁付钱？', pinyin: 'Shéi fù qián.', isCorrect: false },
      { label: 'D', text: '找您五块。', pinyin: 'Zhǎo nín wǔ kuài.', isCorrect: false },
    ],
    correctOption: 'A',
    explanation: '"怎么支付" (Zěnme zhīfù) nghĩa là thanh toán bằng cách nào/thế nào.'
  },
  {
    id: 5,
    type: 'multiple-choice',
    prompt: 'Khi muốn nói "Tôi tuổi (cầm tinh) con heo", bạn nói thế nào?',
    options: [
      { label: 'A', text: '我属猪。', pinyin: 'Wǒ shǔ zhū.', isCorrect: true },
      { label: 'B', text: '我喜欢猪肉。', pinyin: 'Wǒ xǐhuan zhūròu.', isCorrect: false },
      { label: 'C', text: '那是一只猪。', pinyin: 'Nà shì yì zhī zhū.', isCorrect: false },
      { label: 'D', text: '我有一只猪。', pinyin: 'Wǒ yǒu yì zhī zhū.', isCorrect: false },
    ],
    correctOption: 'A',
    explanation: 'Động từ "属" (shǔ) dùng để diễn đạt tuổi cầm tinh con giáp.'
  },
  {
    id: 6,
    type: 'multiple-choice',
    prompt: 'Khi vào quán ăn, muốn gọi phục vụ để gọi món, bạn nói:',
    options: [
      { label: 'A', text: '服务员，点菜！', pinyin: 'Fúwùyuán, diǎn cài!', isCorrect: true },
      { label: 'B', text: '服务员，买单！', pinyin: 'Fúwùyuán, mǎidān!', isCorrect: false },
      { label: 'C', text: '服务员，给钱！', pinyin: 'Fúwùyuán, gěi qián!', isCorrect: false },
      { label: 'D', text: '听说这家店很好吃。', pinyin: 'Tīngshuō zhè jiā diàn hěn hǎochī.', isCorrect: false },
    ],
    correctOption: 'A',
    explanation: '"点菜" (diǎn cài) nghĩa là gọi món.'
  },
  {
    id: 7,
    type: 'multiple-choice',
    prompt: 'Chọn câu có nghĩa: "Xin lỗi, tôi gọi nhầm số rồi."',
    options: [
      { label: 'A', text: '对不起，我打错了。', pinyin: 'Duìbuqǐ, wǒ dǎ cuò le.', isCorrect: true },
      { label: 'B', text: '对不起，我听不清。', pinyin: 'Duìbuqǐ, wǒ tīng bu qīng.', isCorrect: false },
      { label: 'C', text: '他的电话打不通。', pinyin: 'Tā de diànhuà yìzhí dǎ bù tōng.', isCorrect: false },
      { label: 'D', text: '请您给他留言。', pinyin: 'Qǐng nín gěi tā liúyán.', isCorrect: false },
    ],
    correctOption: 'A',
    explanation: '"打错" (dǎ cuò) là gọi nhầm số điện thoại.'
  },
  {
    id: 8,
    type: 'multiple-choice',
    prompt: 'Muốn nói "Nhà tôi cách trường học rất gần", câu nào đúng?',
    options: [
      { label: 'A', text: '我家离学校很近。', pinyin: 'Wǒ jiā lí xuéxiào hěn jìn.', isCorrect: true },
      { label: 'B', text: '我家去学校走路。', pinyin: 'Wǒ jiā qù xuéxiào zǒulù.', isCorrect: false },
      { label: 'C', text: '学校在超市旁边。', pinyin: 'Xuéxiào zài chāoshì pángbiān.', isCorrect: false },
      { label: 'D', text: '我家离学校很远。', pinyin: 'Wǒ jiā lí xuéxiào hěn yuǎn.', isCorrect: false },
    ],
    correctOption: 'A',
    explanation: 'Cấu trúc cách bao xa: A 离 B + 近/远.'
  },
  {
    id: 9,
    type: 'multiple-choice',
    prompt: 'Chọn câu dịch đúng: "Chú chim nhỏ này đặc biệt đáng yêu."',
    options: [
      { label: 'A', text: '这只小鸟特别可爱。', pinyin: 'Zhè zhī xiǎo niǎo tèbié kě ài.', isCorrect: true },
      { label: 'B', text: '这只猫特别可爱。', pinyin: 'Zhè zhī māo tèbié kě ài.', isCorrect: false },
      { label: 'C', text: '我喜欢小动物。', pinyin: 'Wǒ xǐhuan xiǎo dòngwù.', isCorrect: false },
      { label: 'D', text: '定/这只兔子很温柔。', pinyin: 'Zhè zhī tùzi hěn wēnróu.', isCorrect: false },
    ],
    correctOption: 'A',
    explanation: '"小鸟" (xiǎo niǎo) là chú chim nhỏ, lượng từ cho chim chóc là "只" (zhī).'
  },
  {
    id: 10,
    type: 'multiple-choice',
    prompt: 'Muốn nhận xét: "Món ăn này mặn quá.", ta nói thế nào?',
    options: [
      { label: 'A', text: '这道菜太咸了。', pinyin: 'Zhè dào cài tài xián le.', isCorrect: true },
      { label: 'B', text: '这道菜有点淡。', pinyin: 'Zhè dào cài yǒudiǎn dàn.', isCorrect: false },
      { label: 'C', text: '我吃不了辣。', pinyin: 'Wǒ chī bù liǎo là.', isCorrect: false },
      { label: 'D', text: '这道菜真香啊！', pinyin: 'Zhè dào cài zhēn xiāng a!', isCorrect: false },
    ],
    correctOption: 'A',
    explanation: '"咸" (xián) là mặn, "太...了" (tài...le) nghĩa là quá.'
  }
];

const part2_de3: QuestionFreeText[] = [
  { id: 1, type: 'free-text', prompt: 'Số điện thoại của bạn là bao nhiêu?', suggestions: ['我的电话号码 (Wǒ de diànhuà hàomǎ shì)'] },
  { id: 2, type: 'free-text', prompt: 'Xin hỏi, đi ga tàu điện ngầm đi thế nào?', suggestions: ['往前面直走。 (Wǎng qiánmiàn zhí zǒu.)', '往右拐就到了。 (Wǎng yòu guǎi jiù dào le.)'] },
  { id: 3, type: 'free-text', prompt: 'Nhà bạn cách công ty xa không?', suggestions: ['我家离公司很近。 (Wǒ jiā lí gōngsī hěn jìn.)', '我家离公司很远。 (Wǒ jiā lí gōngsī hěn yuǎn.)'] },
  { id: 4, type: 'free-text', prompt: 'Bạn thích màu sắc gì?', suggestions: ['我喜欢蓝色和白色。 (Wǒ xǐhuan lánsè hé báisè.)', '我最喜欢红色。 (Wǒ zuì xǐhuan hóngsè.)'] },
  { id: 5, type: 'free-text', prompt: 'Bạn thấy màu sắc này thế nào?', suggestions: ['我觉得这个颜色很好看。 (Wǒ juéde zhège yánsè hěn hǎokàn.)', '我觉得这个颜色太深了。 (Wǒ juéde zhège yánsè tài shēn le.)'] },
  { id: 6, type: 'free-text', prompt: 'Bạn có nuôi thú cưng không? Bạn thích mèo hay chó?', suggestions: ['我养了一只狗。 (Wǒ yǎng le yì zhī gǒu.)', '我不养宠物，我喜欢猫。 (Wǒ bù yǎng chǒngwù, wǒ xǐhuan māo.)'] },
  { id: 7, type: 'free-text', prompt: 'Bạn tuổi con gì?', suggestions: ['我属猪。 (Wǒ shǔ zhū.)', '我属狗。 (Wǒ shǔ gǒu.)'] },
  { id: 8, type: 'free-text', prompt: 'Bạn thích ăn thịt gì?', suggestions: ['我喜欢吃鸡肉和牛肉。 (Wǒ xǐhuan chī jīròu hé niúròu.)', '我不喜欢吃猪肉。 (Wǒ bù xǐhuan chī zhūròu.)'] },
  { id: 9, type: 'free-text', prompt: 'Bạn có thích ăn cay không?', suggestions: ['我很喜欢吃辣的。 (Wǒ hěn xǐhuan chī là de.)', '我吃不了辣。 (Wǒ chī bù liǎo là.)'] },
  { id: 10, type: 'free-text', prompt: 'Các bạn thanh toán bằng cách nào?', suggestions: ['我们用微信支付。 (Wǒmen yòng Wēixìn zhīfù.)', '我付现金。 (Wǒ fù xiànjīn.)'] }
];

const part3_de3 = [
  { id: 1, type: 'free-text', prompt: '喂，请问张先生在吗？ (Wéi, qǐngwèn Zhāng xiānsheng zài ma?)' },
  { id: 2, type: 'free-text', prompt: '我现在很忙，等会儿再给你打电话。 (Wǒ xiànzài hěn máng, děng huìr zài gěi nǐ dǎ diànhuà.)' },
  { id: 3, type: 'free-text', prompt: '对不起，我打错了。 (Duìbuqǐ, wǒ dǎ cuò le.)' },
  { id: 4, type: 'free-text', prompt: '请问，去地铁站怎么走？ (Qǐngwèn, qù dìtiězhàn zěnme zǒu?)' },
  { id: 5, type: 'free-text', prompt: '地铁站在公司对面，走路五分钟就到了。 (Dìtiězhàn zài gōngsī duìmiàn, zǒulù wǔ fēnzhōng jiù dào le.)' },
  { id: 6, type: 'free-text', prompt: '我家离学校很近，不过离机场很远。 (Wǒ jiā lí xuéxiào hěn jìn, búguò lí jīchǎng hěn yuǎn.)' },
  { id: 7, type: 'free-text', prompt: '你觉得这件衣服的颜色怎么样？ (Nǐ juéde zhè jiàn yīfu de yánsè zěnmeyàng?)' },
  { id: 8, type: 'free-text', prompt: '深色的衣服看起来很瘦，也容易搭配。 (Shēnsè de yīfu kàn qǐlái hěn shòu, yě róngyì dāpèi.)' },
  { id: 9, type: 'free-text', prompt: '白色让房间看起来更大、更干净。 (Báisè ràng fángjiān kàn qǐlái gèng dà, gèng gānjìng.)' },
  { id: 10, type: 'free-text', prompt: '这只小猫特别乖，又聪明又可爱。 (Zhè zhī xiǎo māo tèbié guāi, yòu cōngming yòu kě\'ài.)' },
  { id: 11, type: 'free-text', prompt: '我喜欢动物，尤其是猫和狗。 (Wǒ xǐhuan dòngwù, yóuqí shì māo hé gǒu.)' },
  { id: 12, type: 'free-text', prompt: '这个包一共多少钱？可以刷卡吗？ (Zhège bāo yígòng duōshao qián? Kěyǐ shuā kǎ ma?)' },
  { id: 13, type: 'free-text', prompt: '服务员，点菜！我要一碗牛肉面。 (Fúwùyuán, diǎn cài! Wǒ yào yì wǎn niúròumiàn.)' },
  { id: 14, type: 'free-text', prompt: '听说这家餐厅很有名，味道很不错。 (Tīngshuō zhè jiā cāntīng hěn yǒumíng, wèidào hěn búcuò.)' },
  { id: 15, type: 'free-text', prompt: '我吃不了辣，这道菜太油腻了。 (Wǒ chī bù liǎo là, zhè dào cài tài yóunì le.)' }
];

const part4_de3 = [
  { id: 1, type: 'free-text', prompt: 'A lô, tín hiệu không tốt, tôi nghe không rõ.', suggestions: ['喂，信号不好，我听不清。 (Wéi, xìnhào bù hǎo, wǒ tīng bu qīng.)'] },
  { id: 2, type: 'free-text', prompt: 'Bạn có thể kết bạn Zalo hoặc Facebook với tôi không?', suggestions: ['你可以加我的 Zalo 或者 Facebook 吗？ (Nǐ kěyǐ jiā wǒ de Zalo huòzhě liǎnshū ma?)'] },
  { id: 3, type: 'free-text', prompt: 'Xin hỏi, bưu điện cách đây bao xa?', suggestions: ['请问，邮局离这里有多远？ (Qǐngwèn, yóujú lí zhèlǐ yǒu duō yuǎn?)'] },
  { id: 4, type: 'free-text', prompt: 'Đi thẳng về phía trước, đến ngã tư rẽ phải.', suggestions: ['往前面直走，到了十字路口往右拐。 (Wǎng qiánmiàn zhí zǒu, dào le shízìlùkǒu wǎng yòu guǎi.)', '一直往前走，到了十字路口往右拐。 (Yìzhí wǎng qián zǒu, dào le shízìlùkǒu wǎng yòu guǎi.)'] },
  { id: 5, type: 'free-text', prompt: 'Tôi thích quần áo màu sáng, đặc biệt là màu trắng.', suggestions: ['我喜欢亮色的衣服，尤其是白色。 (Wǒ xǐhuan liàngsè de yīfu, yóuqí shì báisè.)'] },
  { id: 6, type: 'free-text', prompt: 'Màu đen làm cho người ta cảm thấy ấm áp hơn.', suggestions: ['黑色让人感觉更暖和。 (Hēisè ràng rén gǎnjué gèng nuǎnhuo.)'] },
  { id: 7, type: 'free-text', prompt: 'Nhà tôi nuôi hai con mèo và một con chó nhỏ.', suggestions: ['我家养了两只猫 và/和一只小狗。 (Wǒ jiā yǎng le liǎng zhī māo hé yì zhī xiǎo gǒu.)'] },
  { id: 8, type: 'free-text', prompt: 'Bởi vì tôi sợ rắn nên tôi không dám đi sở thú.', suggestions: ['因为我怕蛇，所以我不敢去动物园。 (Yīnwèi wǒ pà shé, suǒyǐ wǒ bù gǎn qù dòngwùyuán.)'] },
  { id: 9, type: 'free-text', prompt: 'Giá cả ở đây rất cao, nhưng món ăn rất tươi ngon.', suggestions: ['这里的价格很高，但是菜很新鲜。 (Zhèlǐ de jiàgé hěn gāo, dànshì cài hěn xīnxiān.)'] },
  { id: 10, type: 'free-text', prompt: 'Xin hỏi các bạn nhận tiền mặt hay chuyển khoản?', suggestions: ['请问你们收现金还是转账？ (Qǐngwèn nǐmen shōu xiànjīn háishi zhuǎnzhàng?)'] },
  { id: 11, type: 'free-text', prompt: 'Cái này tổng cộng bao nhiêu tiền? Tôi dùng Alipay thanh toán.', suggestions: ['这个一共多少钱？我用支付宝支付。 (Zhège yígòng duōshao qián? Wǒ yòng Zhīfùbǎo zhīfù.)'] },
  { id: 12, type: 'free-text', prompt: 'Cho tôi một bát cơm trắng và một đĩa rau xào.', suggestions: ['给我一碗米饭和一盘炒菜。 (Gěi wǒ yì wǎn mǐfàn hé yì pán chǎocài.)', '我要一碗米饭和一盘炒青菜。 (Wǒ yào yì wǎn mǐfàn hé yì pán chǎo qīngcài.)'] },
  { id: 13, type: 'free-text', prompt: 'Nhân viên phục vụ, sườn xào chua ngọt này đắt quá.', suggestions: ['服务员，这个糖醋排骨太贵了。 (Fúwùyuán， zhège tángcù páigǔ tài guì le.)'] },
  { id: 14, type: 'free-text', prompt: 'Lần sau chúng ta cùng đi ăn mực nướng nhé.', suggestions: ['下次我们一起去吃烤鱿鱼吧。 (Xià cì wǒmen yìqǐ qù chī kǎo yóuyú ba.)'] },
  { id: 15, type: 'free-text', prompt: 'Bình thường tôi ăn thanh đạm, không ăn đồ nhiều dầu mỡ.', suggestions: ['平时我吃得很清淡，不吃油腻的。 (Píngshí wǒ chī de hěn qīngdàn, bù chī yóunì de.)'] }
];

export default function Test() {
  const [activeTest, setActiveTest] = useState<'de1' | 'de2' | 'de3' | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [testDuration, setTestDuration] = useState(60); // Default 60 minutes
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes in seconds
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [checkTones, setCheckTones] = useState(false);
  const [aiResults, setAiResults] = useState<Record<string, { score: number; feedback: string }>>({});
  const [isGrading, setIsGrading] = useState(false);

  const isAnswerCorrect = (userAnswer: string, suggestions: string[] | undefined, strictTones: boolean) => {
    if (!userAnswer || !suggestions || suggestions.length === 0) return false;

    const cleanStr = (str: string) => {
      return str.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]/g, '');
    };

    const removeTones = (str: string) => {
      return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '');
    };

    const userCleaned = strictTones ? cleanStr(userAnswer) : removeTones(userAnswer);

    if (userCleaned.length === 0) return false;

    for (const suggestion of suggestions) {
      const chinesePart = suggestion.split(' (')[0];
      const pinyinPart = suggestion.includes(' (') ? suggestion.split(' (')[1].replace(')', '') : '';

      const cleanChinese = strictTones ? cleanStr(chinesePart) : removeTones(chinesePart);
      const cleanPinyin = strictTones ? cleanStr(pinyinPart) : removeTones(pinyinPart);

      if (userCleaned === cleanChinese || userCleaned === cleanPinyin) {
        return true;
      }
    }

    return false;
  };

  const part1 = activeTest === 'de2' ? part1_de2 : (activeTest === 'de3' ? part1_de3 : part1_de1);
  const part2 = activeTest === 'de2' ? part2_de2 : (activeTest === 'de3' ? part2_de3 : part2_de1);
  const part3 = activeTest === 'de2' ? part3_de2 : (activeTest === 'de3' ? part3_de3 : part3_de1);
  const part4 = activeTest === 'de2' ? part4_de2 : (activeTest === 'de3' ? part4_de3 : part4_de1);

  const p1Score = activeTest === 'de1' ? 3 : 2;
  const p2Score = activeTest === 'de1' ? 3 : 2;
  const p3Score = 2;
  const p4Score = 2;

  useEffect(() => {
    if (!activeTest || isSubmitted) return;

    if (timeLeft <= 0) {
      const computedScore = calculateScore();
      setScore(computedScore > 100 ? 100 : computedScore);
      setIsSubmitted(true);
      setShowTimeoutModal(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, activeTest, isSubmitted]);

  const handleOptionSelect = (questionId: string, optionLabel: string) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionLabel }));
  };

  const handleTextChange = (questionId: string, text: string) => {
    if (isSubmitted) return;
    const converted = convertNumberedPinyin(text);
    setAnswers(prev => ({ ...prev, [questionId]: converted }));
  };

  const calculateScore = () => {
    let totalScore = 0;
    part1.forEach(q => {
      if (answers[`p1_${q.id}`] === q.correctOption) {
        totalScore += p1Score;
      }
    });
    part2.forEach(q => {
      const ans = answers[`p2_${q.id}`];
      if (ans && ans.trim().length > 0) {
        if (isAnswerCorrect(ans, q.suggestions, checkTones)) {
          totalScore += p2Score;
        }
      }
    });
    part3.forEach(q => {
      if (answers[`p3_${q.id}`] && answers[`p3_${q.id}`].trim().length > 0) {
        totalScore += p3Score;
      }
    });
    part4.forEach(q => {
      const ans = answers[`p4_${q.id}`];
      if (ans && ans.trim().length > 0) {
        if (isAnswerCorrect(ans, q.suggestions, checkTones)) {
          totalScore += p4Score;
        }
      }
    });
    return totalScore;
  };

  const handleSubmit = () => {
    setShowSubmitModal(true);
  };

  const handleAISubmit = async () => {
    setIsGrading(true);
    setShowSubmitModal(false);

    let totalScore = 0;
    part1.forEach(q => {
      if (answers[`p1_${q.id}`] === q.correctOption) {
        totalScore += p1Score;
      }
    });

    const answersToGrade = [
      ...part2.map(q => ({
        id: `p2_${q.id}`,
        prompt: q.prompt,
        suggestions: q.suggestions,
        userAnswer: answers[`p2_${q.id}`] || '',
        maxScore: p2Score
      })).filter(a => a.userAnswer.trim().length > 0),
      ...part3.map(q => ({
        id: `p3_${q.id}`,
        prompt: q.prompt,
        userAnswer: answers[`p3_${q.id}`] || '',
        maxScore: p3Score,
        suggestions: undefined as string[] | undefined
      })).filter(a => a.userAnswer.trim().length > 0),
      ...part4.map(q => ({
        id: `p4_${q.id}`,
        prompt: q.prompt,
        suggestions: q.suggestions,
        userAnswer: answers[`p4_${q.id}`] || '',
        maxScore: p4Score
      })).filter(a => a.userAnswer.trim().length > 0)
    ];

    let aiResultsMap: Record<string, { score: number; feedback: string }> = {};

    if (answersToGrade.length > 0) {
      const results = await gradeWithAI(answersToGrade, checkTones);
      if (results) {
        results.forEach(res => {
          aiResultsMap[res.id] = { score: res.score, feedback: res.feedback };
          totalScore += res.score;
        });
      } else {
        answersToGrade.forEach(item => {
          const isCorrect = isAnswerCorrect(item.userAnswer, item.suggestions, checkTones);
          const score = isCorrect ? item.maxScore : 0;
          aiResultsMap[item.id] = {
            score,
            feedback: isCorrect ? "Đúng (chấm tự động offline)" : "Chưa chính xác (chấm tự động offline)"
          };
          totalScore += score;
        });
      }
    }

    setAiResults(aiResultsMap);
    setScore(totalScore > 100 ? 100 : totalScore);
    setIsSubmitted(true);
    setIsGrading(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setAnswers({});
    setIsSubmitted(false);
    setScore(0);
    setAiResults({});
    setTimeLeft(testDuration * 60);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Test data based on images


  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Aside Left: Sidebar */}
      {!activeTest && (
        <div className="w-full lg:w-80 shrink-0 bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col gap-4 lg:sticky lg:top-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <GraduationCap className="text-indigo-600" size={20} />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Danh Sách Đề Thi</h3>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                setActiveTest('de1');
                setTimeLeft(testDuration * 60);
              }}
              className={`w-full p-4 rounded-xl border text-left transition flex flex-col gap-1 ${activeTest === 'de1'
                ? "bg-indigo-50 border-indigo-500 text-indigo-900 shadow-sm shadow-indigo-100/50"
                : "bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-700"
                }`}
            >
              <span className="font-bold text-sm">Đề 1</span>
              <span className="text-xs text-slate-500">Kiến thức từ bài 1 đến bài 9</span>
            </button>

            <button
              onClick={() => {
                setActiveTest('de2');
                setTimeLeft(testDuration * 60);
              }}
              className={`w-full p-4 rounded-xl border text-left transition flex flex-col gap-1 ${activeTest === 'de2'
                ? "bg-indigo-50 border-indigo-500 text-indigo-900 shadow-sm shadow-indigo-100/50"
                : "bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-700"
                }`}
            >
              <span className="font-bold text-sm">Đề 2</span>
              <span className="text-xs text-slate-500">Kiến thức từ bài 0 đến bài 6 (50 câu)</span>
            </button>

            <button
              onClick={() => {
                setActiveTest('de3');
                setTimeLeft(testDuration * 60);
              }}
              className={`w-full p-4 rounded-xl border text-left transition flex flex-col gap-1 ${activeTest === 'de3'
                ? "bg-indigo-50 border-indigo-500 text-indigo-900 shadow-sm shadow-indigo-100/50"
                : "bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-700"
                }`}
            >
              <span className="font-bold text-sm">Đề 3</span>
              <span className="text-xs text-slate-500">Kiến thức từ bài 7 đến bài 12 (50 câu)</span>
            </button>
          </div>

          {/* Configuration panel in sidebar */}
          <div className="mt-2 pt-4 border-t border-slate-100 flex flex-col gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cấu hình làm bài</span>

            <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                <Clock size={14} className="text-slate-500" /> Số phút:
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={testDuration}
                  disabled={activeTest !== null && !isSubmitted}
                  onChange={(e) => setTestDuration(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-12 px-1 py-0.5 bg-white border border-slate-300 rounded text-center font-bold text-slate-800 text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-60"
                />
                <span className="text-[10px] font-bold text-slate-500 uppercase">phút</span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                <Languages size={14} className="text-slate-500" /> Chấm thanh điệu:
              </span>
              <button
                onClick={() => setCheckTones(!checkTones)}
                disabled={activeTest !== null && !isSubmitted}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ${checkTones ? "bg-indigo-600" : "bg-slate-300"
                  } ${activeTest !== null && !isSubmitted ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform duration-200 ${checkTones ? "translate-x-4" : "translate-x-0"
                    }`}
                />
              </button>
            </div>

            {activeTest !== null && !isSubmitted && (
              <p className="text-[10px] text-slate-400 italic">Đang trong thời gian làm bài, không thể chỉnh sửa.</p>
            )}
          </div>
        </div>
      )}

      {/* Aside Right: Workspace */}
      <div className="flex-1 w-full">
        {!activeTest ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 flex flex-col items-center justify-center gap-4 text-center min-h-[400px]">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
              <CheckCircle size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Đề Kiểm Tra</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-md">Vui lòng chọn đề thi ở danh sách bên trái để bắt đầu bài làm. Bạn có thể tự cấu hình thời gian làm bài trước khi thi.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between border-b border-slate-100 pb-4 pt-2 -mx-6 px-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTest(null)}
                  className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition"
                >
                  <ArrowLeft size={16} />
                </button>
                <h2 className="text-xl font-bold text-slate-800">
                  {activeTest === 'de1' 
                    ? 'TEST GIAO TIẾP 1' 
                    : activeTest === 'de2' 
                      ? 'TEST KIẾN THỨC BÀI 0 - 6' 
                      : 'TEST KIẾN THỨC BÀI 7 - 12'}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                {!isSubmitted && (
                  <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-bold transition-all duration-300 ${timeLeft < 300
                    ? "bg-rose-50 border border-rose-200 text-rose-600 animate-pulse"
                    : "bg-indigo-50 border border-indigo-200 text-indigo-600"
                    }`}>
                    <Clock size={18} />
                    Thời gian: {formatTime(timeLeft)}
                  </div>
                )}
                {isSubmitted && (
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-600 font-bold">
                    <Award size={18} />
                    Điểm ước tính: {score}/100
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-8">
              {/* Part 1 */}
              <div className="flex flex-col gap-5">
                <h3 className="text-lg font-bold text-indigo-600 uppercase tracking-wide">BÀI 1. CHỌN ĐÁP ÁN ĐÚNG ({part1.length * p1Score} điểm)</h3>

                <div className="flex flex-col gap-6">
                  {part1.map((q, idx) => {
                    const qId = `p1_${q.id}`;
                    const userAnswer = answers[qId];

                    return (
                      <div key={q.id} className="flex flex-col gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="font-semibold text-slate-800 text-sm">
                          {idx + 1}. {q.prompt}
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                          {q.options.map((opt) => {
                            const isSelected = userAnswer === opt.label;

                            let optionClasses = "p-3 rounded-lg border text-sm flex flex-col sm:flex-row sm:items-center gap-2 cursor-pointer transition ";

                            if (!isSubmitted) {
                              optionClasses += isSelected
                                ? "bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500"
                                : "bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50";
                            } else {
                              if (opt.isCorrect) {
                                optionClasses += "bg-emerald-50 border-emerald-500 text-emerald-800";
                              } else if (isSelected && !opt.isCorrect) {
                                optionClasses += "bg-rose-50 border-rose-500 text-rose-800";
                              } else {
                                optionClasses += "bg-white border-slate-200 opacity-60";
                              }
                            }

                            return (
                              <div
                                key={opt.label}
                                className={optionClasses}
                                onClick={() => handleOptionSelect(qId, opt.label)}
                              >
                                <div className="flex items-center gap-2 font-bold w-8 shrink-0">
                                  <span className={`w-6 h-6 rounded flex items-center justify-center text-xs ${isSelected && !isSubmitted ? "bg-indigo-600 text-white" :
                                    isSubmitted && opt.isCorrect ? "bg-emerald-500 text-white" :
                                      isSubmitted && isSelected && !opt.isCorrect ? "bg-rose-500 text-white" :
                                        "bg-slate-100 text-slate-500"
                                    }`}>
                                    {opt.label}
                                  </span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 flex-1">
                                  <span className="font-sans text-base">{opt.text}</span>
                                  <span className="text-slate-500 font-mono text-xs">{opt.pinyin}</span>
                                </div>
                                {isSubmitted && opt.isCorrect && (
                                  <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {isSubmitted && !userAnswer && (
                          <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-1.5 font-medium">
                            <AlertCircle size={14} className="shrink-0" />
                            <span>Thí sinh chưa chọn đáp án</span>
                          </div>
                        )}

                        {isSubmitted && q.explanation && (
                          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 flex flex-col gap-1">
                            <strong className="text-blue-900 flex items-center gap-1.5"><AlertCircle size={16} /> Giải thích ngữ pháp:</strong>
                            <span>{q.explanation}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Part 2 */}
              <div className="flex flex-col gap-5 border-t border-slate-200 pt-8">
                <h3 className="text-lg font-bold text-indigo-600 uppercase tracking-wide">BÀI 2: TRẢ LỜI BẰNG TIẾNG TRUNG ({part2.length * p2Score} điểm)</h3>

                <div className="flex flex-col gap-4">
                  {part2.map((q, idx) => {
                    const qId = `p2_${q.id}`;
                    const userAnswer = answers[qId] || '';

                    return (
                      <div key={q.id} className="flex flex-col gap-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="font-semibold text-slate-800 text-sm">
                          {idx + 1}. {q.prompt}
                        </p>
                        <input
                          type="text"
                          value={userAnswer}
                          onChange={(e) => handleTextChange(qId, e.target.value)}
                          readOnly={isSubmitted}
                          placeholder="Nhập câu trả lời bằng tiếng Trung / Pinyin..."
                          className={`w-full p-3 rounded-lg border text-sm font-sans focus:outline-none transition ${isSubmitted
                            ? (aiResults[qId]?.score > 0 ? "bg-emerald-50/50 border-emerald-200 text-slate-800" : "bg-rose-50/50 border-rose-200 text-slate-800")
                            : "bg-white border-slate-200 focus:border-indigo-500"
                            }`}
                        />
                        {isSubmitted && userAnswer.trim().length === 0 && (
                          <div className="mt-1.5 p-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-1.5 font-medium">
                            <AlertCircle size={14} className="shrink-0" />
                            <span>Thí sinh chưa chọn đáp án</span>
                          </div>
                        )}
                        {isSubmitted && userAnswer.trim().length > 0 && aiResults[qId] && (
                          <div className={`mt-2 p-3 rounded-lg text-sm flex flex-col gap-1 ${aiResults[qId].score > 0
                            ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                            : "bg-rose-50 border border-rose-200 text-rose-800"
                            }`}>
                            <div className="flex items-center justify-between font-bold">
                              <span className="flex items-center gap-1.5 font-sans">
                                <CheckCircle size={16} className={aiResults[qId].score > 0 ? "text-emerald-500" : "text-rose-500"} />
                                AI chấm: {aiResults[qId].score} / {p2Score}
                              </span>
                            </div>
                            {aiResults[qId].feedback && (
                              <p className="text-xs italic text-slate-600 mt-1 font-sans">
                                <strong>Nhận xét từ AI:</strong> {aiResults[qId].feedback}
                              </p>
                            )}
                          </div>
                        )}
                        {isSubmitted && (
                          <div className="flex flex-col gap-2 mt-1">
                            {q.suggestions && q.suggestions.length > 0 && (
                              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex flex-col gap-1.5">
                                <strong className="text-amber-900 text-xs uppercase tracking-wider flex items-center gap-1">Gợi ý cách trả lời:</strong>
                                <ul className="list-disc pl-5 flex flex-col gap-1">
                                  {q.suggestions.map((sugg, i) => (
                                    <li key={i}>{sugg}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Part 3 */}
              <div className="flex flex-col gap-5 border-t border-slate-200 pt-8">
                <h3 className="text-lg font-bold text-indigo-600 uppercase tracking-wide">BÀI 3 – DỊCH TRUNG – VIỆT ({part3.length * p3Score} điểm)</h3>

                <div className="flex flex-col gap-4">
                  {part3.map((q, idx) => {
                    const qId = `p3_${q.id}`;
                    const userAnswer = answers[qId] || '';

                    return (
                      <div key={q.id} className="flex flex-col gap-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="font-semibold text-slate-800 text-sm font-sans">
                          {idx + 1}. {q.prompt.split(' (')[0]}
                        </p>
                        <p className="text-xs text-slate-500 font-mono italic -mt-1 mb-1">
                          ({q.prompt.split(' (')[1].replace(')', '')})
                        </p>
                        <textarea
                          value={userAnswer}
                          onChange={(e) => handleTextChange(qId, e.target.value)}
                          readOnly={isSubmitted}
                          rows={2}
                          placeholder="Dịch nghĩa tiếng Việt..."
                          className={`w-full p-3 rounded-lg border text-sm focus:outline-none transition resize-none ${isSubmitted
                            ? (aiResults[qId]?.score > 0 ? "bg-emerald-50/50 border-emerald-200 text-slate-800" : "bg-rose-50/50 border-rose-200 text-slate-800")
                            : "bg-white border-slate-200 focus:border-indigo-500"
                            }`}
                        />
                        {isSubmitted && userAnswer.trim().length === 0 && (
                          <div className="mt-1.5 p-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-1.5 font-medium">
                            <AlertCircle size={14} className="shrink-0" />
                            <span>Thí sinh chưa chọn đáp án</span>
                          </div>
                        )}
                        {isSubmitted && userAnswer.trim().length > 0 && aiResults[qId] && (
                          <div className={`mt-2 p-3 rounded-lg text-sm flex flex-col gap-1 ${aiResults[qId].score > 0
                            ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                            : "bg-rose-50 border border-rose-200 text-rose-800"
                            }`}>
                            <div className="flex items-center justify-between font-bold">
                              <span className="flex items-center gap-1.5 font-sans">
                                <CheckCircle size={16} className={aiResults[qId].score > 0 ? "text-emerald-500" : "text-rose-500"} />
                                AI chấm: {aiResults[qId].score} / {p3Score}
                              </span>
                            </div>
                            {aiResults[qId].feedback && (
                              <p className="text-xs italic text-slate-600 mt-1 font-sans">
                                <strong>Nhận xét từ AI:</strong> {aiResults[qId].feedback}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Part 4 */}
              <div className="flex flex-col gap-5 border-t border-slate-200 pt-8">
                <h3 className="text-lg font-bold text-indigo-600 uppercase tracking-wide">BÀI 4 – DỊCH VIỆT → TRUNG ({part4.length * p4Score} điểm)</h3>

                <div className="flex flex-col gap-4">
                  {part4.map((q, idx) => {
                    const qId = `p4_${q.id}`;
                    const userAnswer = answers[qId] || '';

                    return (
                      <div key={q.id} className="flex flex-col gap-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="font-semibold text-slate-800 text-sm">
                          {idx + 1}. {q.prompt}
                        </p>
                        <textarea
                          value={userAnswer}
                          onChange={(e) => handleTextChange(qId, e.target.value)}
                          readOnly={isSubmitted}
                          rows={2}
                          placeholder="Dịch sang tiếng Trung / Pinyin..."
                          className={`w-full p-3 rounded-lg border text-sm font-sans focus:outline-none transition resize-none ${isSubmitted
                            ? (aiResults[qId]?.score > 0 ? "bg-emerald-50/50 border-emerald-200 text-slate-800" : "bg-rose-50/50 border-rose-200 text-slate-800")
                            : "bg-white border-slate-200 focus:border-indigo-500"
                            }`}
                        />
                        {isSubmitted && userAnswer.trim().length === 0 && (
                          <div className="mt-1.5 p-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-1.5 font-medium">
                            <AlertCircle size={14} className="shrink-0" />
                            <span>Thí sinh chưa chọn đáp án</span>
                          </div>
                        )}
                        {isSubmitted && userAnswer.trim().length > 0 && aiResults[qId] && (
                          <div className={`mt-2 p-3 rounded-lg text-sm flex flex-col gap-1 ${aiResults[qId].score > 0
                            ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                            : "bg-rose-50 border border-rose-200 text-rose-800"
                            }`}>
                            <div className="flex items-center justify-between font-bold">
                              <span className="flex items-center gap-1.5 font-sans">
                                <CheckCircle size={16} className={aiResults[qId].score > 0 ? "text-emerald-500" : "text-rose-500"} />
                                AI chấm: {aiResults[qId].score} / {p4Score}
                              </span>
                            </div>
                            {aiResults[qId].feedback && (
                              <p className="text-xs italic text-slate-600 mt-1 font-sans">
                                <strong>Nhận xét từ AI:</strong> {aiResults[qId].feedback}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-6 mt-4">
              {isSubmitted ? (
                <button
                  onClick={handleReset}
                  className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Làm lại bài thi
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-md shadow-indigo-200 flex items-center gap-2"
                >
                  <CheckCircle size={18} />
                  Nộp Bài Chấm Điểm
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 p-6 rounded-2xl max-w-[440px] w-full border border-slate-200 shadow-2xl flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <AlertCircle size={24} />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-bold text-slate-800 leading-snug">Nộp bài kiểm tra?</h3>
                <p className="text-sm text-slate-500 mt-1.5 leading-relaxed font-sans">
                  Hành động này không thể hoàn tác. Bạn có chắc chắn muốn nộp bài làm hiện tại để chấm điểm hay không?
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAISubmit}
                className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition text-center font-sans shadow-md shadow-indigo-100"
              >
                Nộp Bài
              </button>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition text-center font-sans"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {showTimeoutModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 p-6 rounded-2xl max-w-[360px] w-full border border-slate-200 shadow-2xl flex flex-col gap-4 text-center items-center">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <Clock size={24} className="animate-bounce" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-bold text-slate-800 leading-snug">Hết Giờ Làm Bài!</h3>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed font-sans">
                Thời gian làm bài của bạn đã kết thúc. Bài làm của bạn đã được tự động nộp thành công.
              </p>
            </div>
            <button
              onClick={() => setShowTimeoutModal(false)}
              className="w-full mt-4 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition text-center font-sans shadow-md shadow-indigo-100"
            >
              Xem Kết Quả
            </button>
          </div>
        </div>
      )}

      {isGrading && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl max-w-xs w-full border border-slate-200 shadow-2xl flex flex-col items-center gap-4 text-center">
            <RefreshCw size={36} className="text-indigo-600 animate-spin" />
            <div>
              <h3 className="text-lg font-bold text-slate-800 font-sans">AI Đang Chấm Bài</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-sans">Vui lòng chờ trong giây lát, hệ thống AI đang chấm điểm tự luận của bạn...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}