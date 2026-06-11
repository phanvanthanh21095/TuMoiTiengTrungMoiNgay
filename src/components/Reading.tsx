import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Play, Pause, Square, ToggleLeft, ToggleRight, Sparkles, ChevronRight, BookOpen, Plus, Trash2, X, FileText } from 'lucide-react';

interface ReadingLine {
  chinese: string;
  pinyin: string;
  vietnamese: string;
  audioStartTime?: number;
}

interface PassageData {
  id: string;
  title: string;
  lines: ReadingLine[];
  isCustom?: boolean;
  audioUrl?: string;
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
      { chinese: "大家好，我介绍一下。", pinyin: "Dà jiā hǎo, wǒ jièshào yíxià.", vietnamese: "Chào mọi người, tôi xin tự giới thiệu một chút." },
      { chinese: "我叫成，今年三十一岁。", pinyin: "Wǒ jiào Chéng, jīnnián sānshíyī suì.", vietnamese: "Tôi tên Thành, năm nay 31 tuổi." },
      { chinese: "我是越南人，现在住在越南。", pinyin: "Wǒ shì Yuènán rén, xiànzài zhù zài Yuènán.", vietnamese: "Tôi là người Việt Nam, hiện đang sống ở Việt Nam." },
      { chinese: "以前我是工程师，现在在语言中心学习中文。", pinyin: "Yǐqián wǒ shì gōngchéngshī, xiànzài zài yǔyán zhōngxīn xuéxí Zhōngwén.", vietnamese: "Trước đây tôi là kỹ sư, hiện tại đang học tiếng Trung ở trung tâm ngôn ngữ." },
      { chinese: "我学习中文已经三个星期了，希望以后能用中文工作。", pinyin: "Wǒ xuéxí Zhōngwén yǐjīng sān gè xīngqī le, xīwàng yǐhòu néng yòng Zhōngwén gōngzuò.", vietnamese: "Tôi học tiếng Trung được 3 tuần rồi, hy vọng sau này có thể dùng tiếng Trung trong công việc." },
      { chinese: "我家有四口人，包括爸爸、妈妈、妹妹和我。", pinyin: "Wǒ jiā yǒu sì kǒu rén, bāokuò bàba, māma, mèimei hé wǒ.", vietnamese: "Gia đình tôi có 4 người, gồm bố, mẹ, em gái và tôi." },
      { chinese: "我的爱好是玩游戏。", pinyin: "Wǒ de àihào shì wán yóuxì.", vietnamese: "Sở thích của tôi là chơi game." },
      { chinese: "空闲的时候，我常常听音乐和看电影。", pinyin: "Kòngxián de shíhou, wǒ chángcháng tīng yīnyuè hé kàn diànyǐng.", vietnamese: "Lúc rảnh rỗi, tôi thường nghe nhạc và xem phim." },
      { chinese: "很高兴认识大家。谢谢！", pinyin: "Hěn gāoxìng rènshi dàjiā. Xièxie!", vietnamese: "Rất vui được làm quen với mọi người. Cảm ơn!" }
    ]
  },
  {
    id: "passage-6",
    title: "Đoạn văn 6: Một ngày của tôi (我的一天)",
    lines: [
      { chinese: "每天早上七点我起床。然后我洗漱、刷牙和洗脸。", pinyin: "Měitiān zǎoshang qī diǎn wǒ qǐchuáng. Ránhòu wǒ xǐshù, shuāyá hé xǐliǎn.", vietnamese: "Mỗi ngày 7 giờ sáng tôi thức dậy. Sau đó tôi vệ sinh, đánh răng và rửa mặt." },
      { chinese: "早上七点半我吃饭。八点我出门去语言中心学习中文。", pinyin: "Zǎoshang qī diǎn bàn wǒ chī fàn. Bā diǎn wǒ chūmén qù yǔyán zhōngxīn xuéxí Zhōngwén.", vietnamese: "7 giờ rưỡi sáng tôi ăn cơm. 8 giờ tôi ra ngoài đến trung tâm ngôn ngữ học tiếng Trung." },
      { chinese: "中午十二点我和同学一起吃午饭，然后休息一下。", pinyin: "Zhōngwǔ shí'èr diǎn wǒ hé tóngxué yìqǐ chī wǔfàn, ránhòu xiūxi yíxià.", vietnamese: "Buổi trưa 12 giờ tôi cùng với bạn học ăn trưa, sau đó nghỉ ngơi một chút." },
      { chinese: "下午一点继续学习中文。下午五点回家。", pinyin: "Xiàwǔ yì diǎn jìxù xuéxí Zhōngwén. Xiàwǔ wǔ diǎn huí jiā.", vietnamese: "1 giờ chiều tiếp tục học tiếng Trung. 5 giờ chiều về nhà." },
      { chinese: "晚上六点我和家人一起吃晚饭。吃饭的时候，我们聊天。", pinyin: "Wǎnshàng liù diǎn wǒ hé jiārén yìqǐ chī wǎnfàn. Chī fàn de shíhou, wǒmen liáotiān.", vietnamese: "6 giờ tối tôi cùng gia đình ăn tối. Lúc ăn cơm, chúng tôi trò chuyện." },
      { chinese: "晚饭以后，我常常听音乐或者看电影放松一下。", pinyin: "Wǎnfàn yǐhòu, wǒ chángcháng tīng yīnyuè huòzhě kàn diànyǐng fàngsōng yíxià.", vietnamese: "Sau bữa tối, tôi thường nghe nhạc hoặc xem phim thư giãn một chút." },
      { chinese: "晚上十点我洗澡，然后睡觉。", pinyin: "Wǎnshàng shí diǎn wǒ xǐzǎo, ránhòu shuìjiào.", vietnamese: "10 giờ tối tôi tắm, sau đó đi ngủ." },
      { chinese: "这就是我的一天。谢谢大家的聆听！", pinyin: "Zhè jiùshì wǒ de yì tiān. Xièxie dàjiā de língtīng!", vietnamese: "Đây chính là một ngày của tôi. Cảm ơn mọi người đã lắng nghe!" }
    ]
  },
  {
    id: "passage-7",
    title: "Đoạn văn 7: Một ngày ở nơi làm việc (我在公司的一天)",
    lines: [
      { chinese: "每天早上八点我到公司上班，然后打卡。", pinyin: "Měi tiān zǎo shang bā diǎn wǒ dào gōng sī shàng bān, rán hòu dǎ kǎ.", vietnamese: "Mỗi ngày 8 giờ sáng tôi đến công ty đi làm, sau đó chấm công." },
      { chinese: "我在办公室工作。", pinyin: "Wǒ zài bàn gōng shì gōng zuò.", vietnamese: "Tôi làm việc ở văn phòng." },
      { chinese: "上午我查看文件、发邮件和打电话。", pinyin: "Shàng wǔ wǒ chá kàn wén jiàn, fā yóu jiàn hé dǎ diàn huà.", vietnamese: "Buổi sáng tôi xem tài liệu, gửi email và gọi điện thoại." },
      { chinese: "有时候我和同事一起开会。", pinyin: "Yǒu shí hou wǒ hé tóng shì yì qǐ kāi huì.", vietnamese: "Đôi khi tôi cùng đồng nghiệp họp." },
      { chinese: "中午十二点我和同事一起吃午饭。", pinyin: "Zhōng wǔ shí èr diǎn wǒ hé tóng shì yì qǐ chī wǔ fàn.", vietnamese: "Buổi trưa 12 giờ tôi cùng đồng nghiệp ăn trưa." },
      { chinese: "下午我继续工作，完成经理安排的任务。", pinyin: "Xià wǔ wǒ jì xù gōng zuò, wán chéng jīng lǐ ān pái de rèn wu.", vietnamese: "Buổi chiều tôi tiếp tục làm việc, hoàn thành nhiệm vụ quản lý giao." },
      { chinese: "下班前，我发送工作报告和工作总结。", pinyin: "Xià bān qián, wǒ fā sòng gōng zuò bào gào hé gōng zuò zǒng jié.", vietnamese: "Trước khi tan làm, tôi gửi báo cáo công việc và tổng kết công việc." },
      { chinese: "下午五点半我下班回家。", pinyin: "Xià wǔ wǔ diǎn bàn wǒ xià bān huí jiā.", vietnamese: "5 giờ rưỡi chiều tôi tan làm về nhà." },
      { chinese: "这就是我在公司的一天，谢谢大家！", pinyin: "Zhè jiù shì wǒ zài gōng sī de yì tiān, xiè xie dà jiā!", vietnamese: "Đây chính là một ngày của tôi ở công ty, cảm ơn mọi người!" }
    ]
  },
  {
    id: "passage-8",
    title: "Đoạn văn 8: Sở thích của tôi (我的爱好)",
    lines: [
      { chinese: "大家好，今天我介绍一下我的爱好。", pinyin: "Dà jiā hǎo, jīn tiān wǒ jiè shào yí xià wǒ de ài hào.", vietnamese: "Chào mọi người, hôm nay tôi giới thiệu một chút về sở thích của tôi." },
      { chinese: "我有很多爱好。", pinyin: "Wǒ yǒu hěn duō ài hào.", vietnamese: "Tôi có rất nhiều sở thích." },
      { chinese: "我喜欢玩游戏、听音乐和看电影。", pinyin: "Wǒ xǐ huan wán yóu xì, tīng yīn yuè hé kàn diàn yǐng.", vietnamese: "Tôi thích chơi game, nghe nhạc và xem phim." },
      { chinese: "有空的时候，我常常玩游戏或者看电影放松一下。", pinyin: "Yǒu kòng de shí hou, wǒ cháng cháng wán yóu xì huò zhě kàn diàn yǐng fàng sōng yí xià.", vietnamese: "Lúc rảnh, tôi thường chơi game hoặc xem phim thư giãn một chút." },
      { chinese: "我对学习语言很感兴趣，现在我正在学习中文。", pinyin: "Wǒ duì xué xí yǔ yán hěn gǎn xìng qù, xiàn zài wǒ zhèng zài xué xí Zhōngwén.", vietnamese: "Tôi rất hứng thú với việc học ngôn ngữ, hiện tại tôi đang học tiếng Trung." },
      { chinese: "我不喜欢熬夜，因为对身体不好。", pinyin: "Wǒ bù xǐ huan áo yè, yīn wèi duì shēn tǐ bù hǎo.", vietnamese: "Tôi không thích thức khuya, vì không tốt cho sức khỏe." },
      { chinese: "我也不喜欢迟到。", pinyin: "Wǒ yě bù xǐ huan chí dào.", vietnamese: "Tôi cũng không thích đi trễ." },
      { chinese: "这就是我的爱好，谢谢大家！", pinyin: "Zhè jiù shì wǒ de ài hào, xiè xie dà jiā!", vietnamese: "Đây chính là sở thích của tôi, cảm ơn mọi người!" }
    ]
  },
  {
    id: "passage-9",
    title: "Radio 1: Động lực cuộc sống (生活的动力)",
    audioUrl: "/Radio1.MP3",
    lines: [
      { chinese: "每个人在生活中都会遇到困难和挑战，但真正决定我们能走多远的，是内心的动力。", pinyin: "Měi gè rén zài shēnghuó zhōng dōu huì yù dào kùnnán hé tiǎozhàn, dàn zhēnzhèng juédìng wǒmen néng zǒu duō yuǎn de, shì nèixīn de dònglì.", vietnamese: "Mỗi người trong cuộc sống đều sẽ gặp phải khó khăn và thử thách, nhưng điều thực sự quyết định chúng ta có thể đi được bao xa chính là động lực bên trong.", audioStartTime: 0 },
      { chinese: "动力来自于梦想，它让我们在迷茫时找到方向；", pinyin: "Dònglì láizì yú mèngxiǎng, tā ràng wǒmen zài mímáng shí zhǎodào fāngxiàng;", vietnamese: "Động lực đến từ ước mơ, nó giúp chúng ta tìm thấy phương hướng khi lạc lối;", audioStartTime: 8 },
      { chinese: "动力来自于坚持，它让我们在遇到挫折时不轻易放弃；", pinyin: "dònglì láizì yú jiānchí, tā ràng wǒmen zài yù dào cuòzhé shí bù qīngyì fàngqì;", vietnamese: "động lực đến từ sự kiên trì, nó giúp chúng ta không dễ dàng bỏ cuộc khi gặp thất bại;", audioStartTime: 13 },
      { chinese: "动力来自于爱，它让我们愿意为自己和身边的人努力奋斗。", pinyin: "dònglì láizì yú ài, tā ràng wǒmen yuànyì wèi zìjǐ hé shēnbiān de rén nǔlì fèndòu.", vietnamese: "động lực đến từ tình yêu, nó khiến chúng ta sẵn sàng nỗ lực phấn đấu vì bản thân và những người xung quanh.", audioStartTime: 18 },
      { chinese: "生活就像一场马拉松，只有保持动力，才能不断前进，最终到达成功的彼岸。", pinyin: "Shēnghuó jiù xiàng yì chǎng mǎlāsōng, zhǐyǒu bǎochí dònglì, cái néng bùduàn qiánjìn, zuìzhōng dàodá chénggōng de bǐ'àn.", vietnamese: "Cuộc sống giống như một cuộc chạy marathon, chỉ khi giữ vững động lực, chúng ta mới có thể không ngừng tiến lên và cuối cùng chạm đến bến bờ thành công.", audioStartTime: 24 },
      { chinese: "所以，无论遇到什么困难，我们都要保持信念，相信自己的努力终将带来美好的未来！", pinyin: "Suǒyǐ, wúlùn yù dào shénme kùnnán, wǒmen dōu yào bǎochí xìnniàn, xiāngxìn zìjǐ de nǔlì zhōngjiāng dàilái měihǎo de wèilái!", vietnamese: "Vì vậy, dù gặp khó khăn gì, chúng ta cũng phải giữ vững niềm tin, tin rằng nỗ lực của mình nhất định sẽ mang lại một tương lai tươi đẹp!", audioStartTime: 32 }
    ]
  },
  {
    id: "passage-10",
    title: "Radio 2: Sức mạnh của thói quen nhỏ (小习惯的力量)",
    lines: [
      { chinese: "日复一日，我们的生活由无数个小习惯组成。", pinyin: "Rì fù yī rì, wǒmen de shēnghuó yóu wúshù gè xiǎo xíguàn zǔchéng.", vietnamese: "Ngày qua ngày, cuộc sống của chúng ta được tạo nên từ vô số thói quen nhỏ." },
      { chinese: "清晨起床时，你是选择赖床五分钟，还是立即起身迎接新的一天？", pinyin: "Qīngchén qǐchuáng shí, nǐ shì xuǎnzé làichuáng wǔ fēnzhōng, háishì lìjí qǐshēn yíngjiē xīn de yī tiān?", vietnamese: "Khi thức dậy vào buổi sáng, bạn sẽ chọn nằm thêm năm phút, hay lập tức bật dậy đón chào ngày mới?" },
      { chinese: "晚上临睡前，你是选择再刷一次手机，还是静下心来读几页书？", pinyin: "Wǎnshàng lín shuì qián, nǐ shì xuǎnzé zài shuā yí cì shǒujī, háishì jìngxià xīn lái dú jǐ yè shū?", vietnamese: "Trước khi đi ngủ vào buổi tối, bạn sẽ tiếp tục lướt điện thoại, hay dành thời gian tĩnh lặng đọc vài trang sách?" },
      { chinese: "伟大的成就，往往不是靠突如其来的爆发，而是靠日积月累的坚持。", pinyin: "Wěidà de chéngjiù, wǎngwǎng bú shì kào tūrúqílái de bàofā, ér shì kào rìjīyuèlěi de jiānchí.", vietnamese: "Những thành tựu vĩ đại không đến từ sự bùng nổ nhất thời, mà từ sự kiên trì tích lũy theo thời gian." },
      { chinese: "每天多喝一杯水，你的身体会更加健康；", pinyin: "Měitiān duō hē yī bēi shuǐ, nǐ de shēntǐ huì gèngjiā jiànkāng;", vietnamese: "Mỗi ngày uống thêm một cốc nước, cơ thể bạn sẽ khỏe mạnh hơn;" },
      { chinese: "每天早睡半小时，你的精神状态会更好；", pinyin: "měitiān zǎo shuì bàn xiǎoshí, nǐ de jīngshén zhuàngtài huì gèng hǎo;", vietnamese: "mỗi ngày ngủ sớm hơn nửa tiếng, tinh thần bạn sẽ tốt hơn;" },
      { chinese: "每天学习一个新单词，几年后你会掌握一门新语言。", pinyin: "měitiān xuéxí yī gè xīn dāncí, jǐ nián hòu nǐ huì zhǎngwò yī mén xīn yǔyán.", vietnamese: "mỗi ngày học một từ vựng mới, vài năm sau bạn sẽ thành thạo một ngôn ngữ." },
      { chinese: "所以，不要小看那些微小的努力。", pinyin: "Suǒyǐ, búyào xiǎo kàn nàxiē wēixiǎo de nǔlì.", vietnamese: "Vậy nên, đừng xem nhẹ những nỗ lực nhỏ bé." },
      { chinese: "只要每天比昨天进步一点点，哪怕只是一点点，未来的你，一定会感谢今天努力的自己。", pinyin: "Zhǐyào měitiān bǐ zuótiān jìnbù yī diǎndiǎn, nǎpà zhǐshì yī diǎndiǎn, wèilái de nǐ, yīdìng huì gǎnxiè jīntiān nǔlì de zìjǐ.", vietnamese: "Chỉ cần mỗi ngày tiến bộ hơn hôm qua dù chỉ một chút thôi, tương lai, bạn nhất định sẽ biết ơn phiên bản hôm nay của chính mình." }
    ]
  },
  {
    id: "passage-11",
    title: "Radio 3: Hãy hành động ngay! (立即行动！)",
    lines: [
      { chinese: "成功从来不会眷顾那些只会空想和等待的人。", pinyin: "Chénggōng cónglái bú huì juàngù nàxiē zhǐ huì kōngxiǎng hé děngdài de rén.", vietnamese: "Thành công chưa bao giờ thuộc về những người chỉ biết mơ mộng và chờ đợi." },
      { chinese: "许多人总是在计划，在犹豫，害怕失败、害怕挑战，结果时间流逝，机会也随之消失。", pinyin: "Xǔduō rén zǒng shì zài jìhuà, zài yóuyù, hàipà shībài, hàipà tiǎozhàn, jiéguǒ shíjiān liúshì, jīhuì yě suízhī xiāoshī.", vietnamese: "Nhiều người luôn lên kế hoạch, luôn do dự, sợ thất bại, sợ thử thách, để rồi thời gian trôi qua, cơ hội cũng dần biến mất." },
      { chinese: "真正的成功者不是那些拥有完美计划的人，而是那些勇敢迈出第一步，不断调整方向，在行动中学习和成长的人。", pinyin: "Zhēnzhèng de chénggōng zhě bú shì nàxiē yōngyǒu wánměi jìhuà de rén, ér shì nàxiē yǒnggǎn màichū dì yī bù, bùduàn tiáozhěng fāngxiàng, zài xíngdòng zhōng xuéxí hé chéngzhǎng de rén.", vietnamese: "Những người thực sự thành công không phải là người có kế hoạch hoàn hảo, mà là người dám bước đi đầu tiên, không ngừng điều chỉnh phương hướng, học hỏi và trưởng thành qua từng hành động." },
      { chinese: "世界上最遥远的距离，不是从梦想到现实的差距，而是从“想做”到“去做”的犹豫。", pinyin: "Shìjiè shàng zuì yáoyuǎn de jùlí, bú shì cóng mèngxiǎng dào xiànshí de chājù, ér shì cóng “xiǎng zuò” dào “qù zuò” de yóuyù.", vietnamese: "Khoảng cách xa nhất trên thế giới không phải là từ giấc mơ đến hiện thực, mà là từ “muốn làm” đến “bắt tay vào làm”." },
      { chinese: "如果你一直等待所谓的“最佳时机”，那么你可能永远都不会开始。", pinyin: "Rúguǒ nǐ yīzhí děngdài suǒwèi de “zuì jiā shíjī”, nàme nǐ kěnéng yǒngyuǎn dōu bú huì kāishǐ.", vietnamese: "Nếu bạn cứ mãi chờ đợi một “thời điểm hoàn hảo”, có thể bạn sẽ không bao giờ bắt đầu." },
      { chinese: "与其等待完美的时刻，不如立即迈出第一步。", pinyin: "Yǔqí děngdài wánměi de shíkè, bùrú lìjí màichū dì yī bù.", vietnamese: "Thay vì đợi một thời khắc lý tưởng, hãy hành động ngay từ bây giờ." },
      { chinese: "哪怕只是微小的行动，也比停滞不前要好得多。", pinyin: "Nǎpà shì wēixiǎo de xíngdòng, yě bǐ tíngzhì bù qián yào hǎo de duō.", vietnamese: "Dù chỉ là một hành động nhỏ bé, cũng tốt hơn nhiều so với việc giậm chân tại chỗ." },
      { chinese: "记住，成功属于那些敢于抓住当下、不断前进的人！", pinyin: "Jìzhù, chénggōng shǔyú nàxiē gǎnyú zhuā zhù dāngxià, bùduàn qiánjìn de rén!", vietnamese: "Hãy nhớ rằng, thành công chỉ dành cho những ai biết nắm bắt hiện tại và kiên trì tiến về phía trước!" }
    ]
  },
  {
    id: "passage-12",
    title: "Radio 4: Sự nỗ lực trong cuộc sống (生活中的努力)",
    lines: [
      { chinese: "努力在生活中扮演着至关重要的角色。", pinyin: "Nǔlì zài shēnghuó zhōng bànyǎn zhe zhì guān zhòngyào de juésè.", vietnamese: "Nỗ lực đóng vai trò vô cùng quan trọng trong cuộc sống." },
      { chinese: "它不仅是实现目标的基础，也是克服困难的关键。", pinyin: "Tā bùjǐn shì shíxiàn mùbiāo de jīchǔ, yěshì kèfú kùnnán de guānjiàn.", vietnamese: "Nó không chỉ là nền tảng để đạt được mục tiêu, mà còn là chìa khóa để vượt qua khó khăn." },
      { chinese: "通过不断努力，我们可以不断提升自己，积累经验。", pinyin: "Tōngguò bùduàn nǔlì, wǒmen kěyǐ bú duàn tíshēng zìjǐ, jīlěi jīngyàn.", vietnamese: "Bằng cách không ngừng nỗ lực, chúng ta có thể cải thiện bản thân và tích lũy kinh nghiệm." },
      { chinese: "无论是在学习、工作还是人际关系中，努力都能帮助我们取得更好的成绩。", pinyin: "Wúlùn shì zài xuéxí, gōngzuò háishì rénjì guānxì zhōng, nǔlì dōu néng bāngzhù wǒmen qǔdé gèng hǎo de chéngjì.", vietnamese: "Dù là trong học tập, công việc hay các mối quan hệ, sự cố gắng sẽ giúp chúng ta đạt được kết quả tốt hơn." },
      { chinese: "成功往往不是偶然，而是长期坚持和努力的结果。", pinyin: "Chénggōng wǎngwǎng búshì ǒurán, ér shì chángqī jiānchí hé nǔlì de jiéguǒ.", vietnamese: "Thành công thường không phải là ngẫu nhiên mà là kết quả của sự kiên trì và nỗ lực lâu dài." },
      { chinese: "正因为如此，我们应该始终保持积极的态度，勇敢面对挑战，努力追求自己的梦想。", pinyin: "Zhèng yīnwèi rúcǐ, wǒmen yīnggāi shǐzhōng bǎochí jījí de tàidù, yǒnggǎn miàn duì tiǎozhàn, nǔlì zhuīqiú zìjǐ de mèngxiǎng.", vietnamese: "Chính vì vậy, chúng ta nên luôn giữ thái độ tích cực, dũng cảm đối mặt với thử thách và nỗ lực theo đuổi ước mơ của mình." },
      { chinese: "只有这样，我们才能真正实现人生的价值。", pinyin: "Zhǐyǒu zhèyàng, wǒmen cáinéng zhēnzhèng shíxiàn rénshēng de jiàzhí.", vietnamese: "Chỉ như vậy, chúng ta mới có thể thực sự hiện thực hóa giá trị của cuộc đời." }
    ]
  },
  {
    id: "passage-13",
    title: "Radio 5: Bí quyết giữ lửa đam mê học tập (保持学习热情的秘诀)",
    lines: [
      { chinese: "学习不仅仅是获取知识，更是一种让自己不断成长的旅程。", pinyin: "Xuéxí bùjǐnjǐn shì huòqǔ zhīshi, gèng shì yīzhǒng ràng zìjǐ bùduàn chéngzhǎng de lǚchéng.", vietnamese: "Học tập không chỉ là tiếp thu kiến thức, mà còn là một hành trình giúp ta không ngừng phát triển bản thân." },
      { chinese: "然而，激情并不会永远燃烧不熄，我们需要学会如何让它持续燃烧。", pinyin: "Rán'ér, jīqíng bìng bú huì yǒngyuǎn ránshāo bùxī, wǒmen xūyào xuéhuì rúhé ràng tā chíxù ránshāo.", vietnamese: "Tuy nhiên, đam mê không phải lúc nào cũng bùng cháy mãi, ta cần biết cách giữ cho ngọn lửa ấy luôn rực sáng." },
      { chinese: "找到真正的兴趣点，是保持学习动力的关键。", pinyin: "Zhǎodào zhēnzhèng de xìngqù diǎn, shì bǎochí xuéxí dònglì de guānjiàn.", vietnamese: "Tìm ra niềm yêu thích thực sự chính là chìa khóa để duy trì động lực học tập." },
      { chinese: "此外，制定合理的目标和计划，让每一天都有明确的方向，也能让我们在学习的过程中保持动力。", pinyin: "Cǐwài, zhìdìng hélǐ de mùbiāo hé jìhuà, ràng měi yītiān dōu yǒu míngquè de fāngxiàng, yě néng ràng wǒmen zài xuéxí de guòchéng zhōng bǎochí dònglì.", vietnamese: "Bên cạnh đó, đặt ra mục tiêu và kế hoạch hợp lý để mỗi ngày đều có phương hướng rõ ràng cũng giúp ta duy trì động lực." },
      { chinese: "不要害怕失败，也不要因为一时的懒惰而放弃。", pinyin: "Búyào hàipà shībài, yě búyào yīnwèi yīshí de lǎnduò ér fàngqì.", vietnamese: "Đừng sợ thất bại, cũng đừng bỏ cuộc chỉ vì đôi lúc cảm thấy lười biếng." },
      { chinese: "给自己适当的奖励，让学习变成一种享受，而不是压力。", pinyin: "Gěi zìjǐ shìdàng de jiǎnglì, ràng xuéxí biànchéng yīzhǒng xiǎngshòu, ér búshì yālì.", vietnamese: "Hãy tự thưởng cho bản thân những phần quà nhỏ để biến việc học thành niềm vui thay vì áp lực." },
      { chinese: "当我们把学习变成一种习惯，一种内在的追求，它就会成为照亮人生道路的光，指引我们走向更广阔的世界。", pinyin: "Dāng wǒmen bǎ xuéxí biànchéng yīzhǒng xíguàn, yīzhǒng nèizài de zhuīqiú, tā jiù huì chéngwéi zhàoliàng rénshēng dàolù de guāng, zhǐyǐn wǒmen zǒuxiàng gèng guǎngkuò de shìjiè.", vietnamese: "Khi học tập trở thành một thói quen, một sự theo đuổi từ bên trong, nó sẽ trở thành ánh sáng soi đường, dẫn dắt ta đến với một thế giới rộng lớn hơn." }
    ]
  },
  {
    id: "passage-14",
    title: "Radio 6: Hãy kiên nhẫn tiến về phía trước (耐心前行)",
    lines: [
      { chinese: "耐心是一种力量，能够支撑我们在黑暗中前行，不被短暂的挫折打倒。", pinyin: "Nàixīn shì yì zhǒng lìliàng, nénggòu zhīchēng wǒmen zài hēi'àn zhōng qiánxíng, bù bèi duǎnzàn de cuòzhé dǎdǎo.", vietnamese: "Kiên nhẫn là một sức mạnh giúp ta bước đi trong bóng tối mà không gục ngã trước những thất bại nhất thời." },
      { chinese: "每一位成功的人，都是在无数次失败和等待中一步步走向光明。", pinyin: "Měi yí wèi chénggōng de rén, dōu shì zài wúshù cì shībài hé děngdài zhōng yì bù bù zǒuxiàng guāngmíng.", vietnamese: "Mọi người thành công đều đã trải qua vô số lần vấp ngã và chờ đợi trước khi chạm đến ánh sáng." },
      { chinese: "我们无法提前知道答案，但我们可以选择相信自己，脚踏实地地向前迈进。", pinyin: "Wǒmen wúfǎ tíqián zhīdào dá'àn, dàn wǒmen kěyǐ xuǎnzé xiāngxìn zìjǐ, jiǎotàshídì de xiàng qián màijìn.", vietnamese: "Chúng ta không thể biết trước đáp án, nhưng có thể chọn tin tưởng vào chính mình và từng bước tiến về phía trước." },
      { chinese: "不要因为短暂的停滞而怀疑自己，也不要因一时的困境而放弃梦想。", pinyin: "Búyào yīnwèi duǎnzàn de tíngzhì ér huáiyí zìjǐ, yě búyào yīnwèi yīshí de kùnjìng ér fàngqì mèngxiǎng.", vietnamese: "Đừng nghi ngờ bản thân chỉ vì những chững lại ngắn ngủi, cũng đừng từ bỏ ước mơ chỉ vì những khó khăn nhất thời." },
      { chinese: "时间是最公平的，它会给予努力的人最好的回报。", pinyin: "Shíjiān shì zuì gōngpíng de, tā huì jǐyǔ nǔlì de rén zuì hǎo de huíbào.", vietnamese: "Thời gian là công bằng nhất, nó sẽ trao phần thưởng xứng đáng cho những ai nỗ lực không ngừng." },
      { chinese: "只要你愿意坚持，愿意进步，总有一天，你会看见答案就在前方闪耀。", pinyin: "Zhǐyào nǐ yuànyì jiānchí, yuànyì jìnbù, zǒng yǒu yìtiān, nǐ huì kànjiàn dá'àn jiù zài qiánfāng shǎnyào.", vietnamese: "Chỉ cần bạn sẵn sàng kiên trì, sẵn sàng tiến bước, một ngày nào đó, bạn sẽ thấy câu trả lời tỏa sáng ngay trước mắt mình." }
    ]
  },
  {
    id: "passage-15",
    title: "Radio 7: Nỗ lực (努力)",
    lines: [
      { chinese: "努力不是一时的冲动，而是每天坚持的小行动。", pinyin: "Nǔlì bú shì yí shí de chōngdòng, ér shì měitiān jiānchí de xiǎo xíngdòng.", vietnamese: "Nỗ lực không phải là sự bốc đồng nhất thời, mà là những hành động nhỏ được duy trì mỗi ngày." },
      { chinese: "在学习和生活中，我们都会遇到困难和挫折。", pinyin: "Zài xuéxí hé shēnghuó zhōng, wǒmen dōu huì yùdào kùnnán hé cuòzhé.", vietnamese: "Trong học tập và cuộc sống, ai cũng sẽ gặp khó khăn và trở ngại." },
      { chinese: "有时候进步很慢，但只要不停下来，就是在前进。", pinyin: "Yǒushíhou jìnbù hěn màn, dàn zhǐyào bù tíng xiàlái, jiù shì zài qiánjìn.", vietnamese: "Có lúc tiến bộ rất chậm, nhưng chỉ cần không dừng lại thì vẫn đang tiến lên." },
      { chinese: "努力学习新知识，会让我们变得更自信。", pinyin: "Nǔlì xuéxí xīn zhīshi, huì ràng wǒmen biàn de gèng zìxìn.", vietnamese: "Cố gắng học hỏi kiến thức mới sẽ giúp chúng ta tự tin hơn." },
      { chinese: "努力工作，可以一步一步接近自己的目标。", pinyin: "Nǔlì gōngzuò, kěyǐ yì bù yí bù jiējìn zìjǐ de mùbiāo.", vietnamese: "Nỗ lực làm việc giúp ta từng bước tiến gần mục tiêu của mình." },
      { chinese: "当你觉得累的时候，别忘了当初为什么开始。", pinyin: "Dāng nǐ juéde lèi de shíhou, bié wàngle dāngchū wèishénme kāishǐ.", vietnamese: "Khi cảm thấy mệt mỏi, đừng quên lý do ban đầu khiến bạn bắt đầu." },
      { chinese: "每一次认真付出，都会在未来得到回报。", pinyin: "Měi yí cì rènzhēn fùchū, dōu huì zài wèilái dédào huíbào.", vietnamese: "Mỗi lần cố gắng nghiêm túc đều sẽ được đền đáp trong tương lai." },
      { chinese: "成功并不偏爱聪明的人，而是偏爱坚持的人。", pinyin: "Chénggōng bìng bù piān'ài cōngmíng de rén, ér shì piān'ài jiānchí de rén.", vietnamese: "Thành công không thiên vị người thông minh, mà ưu ái người kiên trì." },
      { chinese: "哪怕今天只进步一点点，也值得肯定。", pinyin: "Nǎpà jīntiān zhǐ jìnbù yìdiǎndiǎn, yě zhídé kěndìng.", vietnamese: "Dù hôm nay chỉ tiến bộ một chút, cũng đáng được ghi nhận." },
      { chinese: "只要愿意努力，普通的日子也能发光。", pinyin: "Zhǐyào yuànyì nǔlì, pǔtōng de rìzi yě néng fāguāng.", vietnamese: "Chỉ cần sẵn sàng nỗ lực, những ngày bình thường cũng có thể tỏa sáng." }
    ]
  },
  {
    id: "passage-16",
    title: "Radio 8: Đưa ước mơ đến gần hơn (让梦想更近一步！)",
    lines: [
      { chinese: "每天保持动力是成功的重要关键。", pinyin: "Měitiān bǎochí dònglì shì chénggōng de zhòngyào guānjiàn.", vietnamese: "Duy trì động lực mỗi ngày là chìa khóa quan trọng để thành công." },
      { chinese: "首先，设定清晰的目标可以让我们有前进的方向，并激发内心的热情。", pinyin: "Shǒuxiān, shèdìng qīngxī de mùbiāo kěyǐ ràng wǒmen yǒu qiánjìn de fāngxiàng, bìng jīfā nèixīn de rèqíng.", vietnamese: "Trước tiên, đặt ra mục tiêu rõ ràng sẽ giúp chúng ta có phương hướng tiến lên và khơi dậy niềm đam mê trong lòng." },
      { chinese: "其次，培养积极的思维方式，学会从失败中吸取经验，而不是被挫折打倒。", pinyin: "Qícì, péiyǎng jījí de sīwéi fāngshì, xuéhuì cóng shībài zhōng xíqǔ jīngyàn, ér búshì bèi cuòzhé dǎdǎo.", vietnamese: "Thứ hai, hãy rèn luyện tư duy tích cực, học cách rút kinh nghiệm từ thất bại thay vì bị vấp ngã đánh bại." },
      { chinese: "每天给自己一些小小的奖励，比如完成任务后喝一杯喜欢的饮料，这样能增强成就感。", pinyin: "Měitiān gěi zìjǐ yīxiē xiǎoxiǎo de jiǎnglì, bǐrú wánchéng rènwù hòu hē yī bēi xǐhuan de yǐnliào, zhèyàng néng zēngqiáng chéngjiùgǎn.", vietnamese: "Mỗi ngày, hãy tự thưởng cho bản thân một chút, chẳng hạn như uống một cốc đồ uống yêu thích sau khi hoàn thành nhiệm vụ, điều này giúp tăng cảm giác thành tựu." },
      { chinese: "此外，坚持健康的生活习惯，如规律作息和适量运动，也能提高精力和专注力。", pinyin: "Cǐwài, jiānchí jiànkāng de shēnghuó xíguàn, rú guīlǜ zuòxī hé shìliàng yùndòng, yě néng tígāo jīnglì hé zhuānzhùlì.", vietnamese: "Ngoài ra, duy trì thói quen sống lành mạnh, như sinh hoạt điều độ và tập thể dục vừa phải, cũng có thể nâng cao năng lượng và sự tập trung." },
      { chinese: "最重要的是，与积极向上的人交流，他们的正能量会激励我们不断进步。", pinyin: "Zuì zhòngyào de shì, yǔ jījí xiàngshàng de rén jiāoliú, tāmen de zhèng néngliàng huì jīlì wǒmen bùduàn jìnbù.", vietnamese: "Quan trọng nhất là giao lưu với những người tích cực và lạc quan, năng lượng tích cực của họ sẽ truyền động lực để chúng ta không ngừng tiến bộ." },
      { chinese: "只要保持动力，哪怕是小步前进，也能逐渐实现自己的梦想！", pinyin: "Zhǐyào bǎochí dònglì, nǎpà shì xiǎo bù qiánjìn, yě néng zhújiàn shíxiàn zìjǐ de mèngxiǎng!", vietnamese: "Chỉ cần duy trì động lực, dù tiến từng bước nhỏ, chúng ta cũng có thể dần dần thực hiện ước mơ của mình!" }
    ]
  },
  {
    id: "passage-17",
    title: "Radio 9: Không có kỷ luật thì không có tài năng (没有纪律，就没有才能)",
    lines: [
      { chinese: "没有纪律，就没有真正的才能。", pinyin: "Méiyǒu jìlǜ, jiù méiyǒu zhēnzhèng de cáinéng.", vietnamese: "Không có kỷ luật thì không có tài năng thật sự." },
      { chinese: "每天哪怕只坚持一点点，也是在为未来的自己铺路。", pinyin: "Měitiān nǎpà zhǐ jiānchí yìdiǎndiǎn, yě shì zài wèi wèilái de zìjǐ pūlù.", vietnamese: "Mỗi ngày dù chỉ cố gắng một chút cũng là đang tự tạo con đường cho chính mình trong tương lai." },
      { chinese: "你想成为怎样的人，就从今天的每个小选择开始。", pinyin: "Nǐ xiǎng chéngwéi zěnyàng de rén, jiù cóng jīntiān de měi gè xiǎo xuǎnzé kāishǐ.", vietnamese: "Bạn muốn trở thành người như thế nào, hãy bắt đầu từ từng lựa chọn nhỏ của hôm nay." },
      { chinese: "自律并不是束缚，而是让你离梦想更近的一把温柔的力量。", pinyin: "Zìlǜ bìng bú shì shùfù, ér shì ràng nǐ lí mèngxiǎng gèng jìn de yì bǎ wēnróu de lìliàng.", vietnamese: "Tự kỷ luật không phải là sự gò bó, mà là nguồn sức mạnh dịu dàng đưa bạn tiến gần hơn đến ước mơ." },
      { chinese: "跌倒了也不要紧，只要继续往前走，脚步就不会白费。", pinyin: "Diēdǎo le yě bú yàojǐn, zhǐyào jìxù wǎng qián zǒu, jiǎobù jiù bú huì báifèi.", vietnamese: "Ngã xuống cũng không sao, chỉ cần bước tiếp thì những bước chân ấy sẽ không vô nghĩa." },
      { chinese: "别人看不到你的努力，但时间会记得。", pinyin: "Biéren kànbudào nǐ de nǔlì, dàn shíjiān huì jìdé.", vietnamese: "Người khác có thể không thấy nỗ lực của bạn, nhưng thời gian sẽ ghi nhớ." },
      { chinese: "你越是坚持，世界越会为你让路。", pinyin: "Nǐ yuè shì jiānchí, shìjiè yuè huì wèi nǐ rànglù.", vietnamese: "Bạn càng kiên trì, thế giới càng mở đường cho bạn." },
      { chinese: "才能不是突然出现的光，而是无数个不起眼的日子累积起来的亮。", pinyin: "Cáinéng bú shì tūrán chūxiàn de guāng, ér shì wúshù gè bù qǐyǎn de rìzi lěijī qǐlái de liàng.", vietnamese: "Tài năng không phải là ánh sáng bộc phát, mà là sự tích lũy từ rất nhiều ngày tháng bình thường nhưng đầy cố gắng." }
    ]
  },
  {
    id: "passage-basic-18",
    title: "Đoạn văn 9: Con vật yêu thích của tôi (我最喜欢的动物)",
    lines: [
      { chinese: "我非常喜欢动物。", pinyin: "Wǒ fēicháng xǐhuan dòngwù.", vietnamese: "Tôi rất thích động vật." },
      { chinese: "我家里养了很多宠物，比如狗、猫和鱼。", pinyin: "Wǒ jiālǐ yǎng le hěn duō chǒngwù, bǐrú gǒu, māo hé yú.", vietnamese: "Nhà tôi nuôi rất nhiều thú cưng, ví dụ như chó, mèo và cá." },
      { chinese: "我最喜欢的动物是狗。", pinyin: "Wǒ zuì xǐhuan de dòngwù shì gǒu.", vietnamese: "Tuy nhiên, con vật mà tôi thích nhất là chó." },
      { chinese: "我的狗是白色的，它看起来很干净。", pinyin: "Wǒ de gǒu shì báisè de, tā kànqǐlái hěn gānjìng.", vietnamese: "Chó của tôi màu trắng, nó trông có vẻ rất sạch sẽ." },
      { chinese: "它不脏，也不凶。", pinyin: "Tā bù zāng, yě bù xiōng.", vietnamese: "Nó không bẩn và cũng không dữ." },
      { chinese: "它特别乖，也很聪明。", pinyin: "Tā tèbié guāi, yě hěn cōngming.", vietnamese: "Nó đặc biệt ngoan và rất thông minh." },
      { chinese: "每天它都会在门口等我。", pinyin: "Měitiān tā dōu hùi zài ménkǒu děng wǒ.", vietnamese: "Ngày nào nó cũng ở cổng đợi tôi." },
      { chinese: "它很活跃，总是喜欢吃东西。", pinyin: "Tā hěn huóyuè, zǒngshì xǐhuan chī dōngxi.", vietnamese: "Nó rất năng động và lúc nào cũng thích đồ ăn." },
      { chinese: "我很喜欢照顾它。", pinyin: "Wǒ hěn xǐhuan zhàogù tā.", vietnamese: "Tôi rất thích chăm sóc nó" },
      { chinese: "动物和人类一样，它们都需要爱。", pinyin: "Dòngwù hé rénlèi yíyàng, tāmen dōu xūyào ài.", vietnamese: "Động vật và con người giống nhau, chúng đều cần tình yêu." },
      { chinese: "当然了，它是我的最好朋友。", pinyin: "Dāngrán le, tā shì wǒ zuì hǎo de péngyou.", vietnamese: "Tất nhiên rồi, nó là người bạn tốt nhất của tôi." }
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
  const [activeTab, setActiveTab] = useState<'basic' | 'radio'>('basic');

  const isPlayingRef = useRef<boolean>(false);
  const seqTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleAudioTimeUpdate = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    if (!currentPassage || !currentPassage.lines) return;
    const currentTime = e.currentTarget.currentTime;

    // Find the latest line that has a startTime <= currentTime
    let newActiveIndex = null;
    for (let i = 0; i < currentPassage.lines.length; i++) {
      const line = currentPassage.lines[i];
      if (line.audioStartTime !== undefined && currentTime >= line.audioStartTime) {
        newActiveIndex = i;
      } else if (line.audioStartTime !== undefined && currentTime < line.audioStartTime) {
        // Since lines are ordered, we can break once we find a line that starts in the future
        break;
      }
    }

    if (newActiveIndex !== activeLineIndex) {
      setActiveLineIndex(newActiveIndex);
    }
  };

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

  const handleLineClick = (line: ReadingLine, index: number) => {
    if (currentPassage.audioUrl && line.audioStartTime !== undefined && audioRef.current) {
      handleStop();
      audioRef.current.currentTime = line.audioStartTime;
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      setActiveLineIndex(index);
    } else {
      speakLine(line, index);
    }
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

  const handleTabSwitch = (tab: 'basic' | 'radio') => {
    setActiveTab(tab);
    handleStop();
    if (tab === 'basic') {
      const idx = passages.findIndex(p => {
        if (p.isCustom) return true;
        const match = p.id.match(/^passage-(\d+)$/);
        if (match) return parseInt(match[1], 10) <= 8;
        return true;
      });
      if (idx !== -1) setSelectedPassageIndex(idx);
    } else {
      const idx = passages.findIndex(p => {
        if (p.isCustom) return false;
        const match = p.id.match(/^passage-(\d+)$/);
        if (match) return parseInt(match[1], 10) >= 9;
        return false;
      });
      if (idx !== -1) setSelectedPassageIndex(idx);
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
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <BookOpen size={14} className="text-indigo-600" />
                  Chọn Bài Đọc
                </span>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-105 border border-indigo-200 rounded text-[10px] font-bold text-indigo-600 transition cursor-pointer flex items-center gap-0.5"
                >
                  <Plus size={10} />
                  Thêm mới
                </button>
              </div>

              {/* Tabs */}
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => handleTabSwitch('basic')}
                  className={`flex-1 py-1.5 rounded text-[11px] font-bold cursor-pointer transition ${activeTab === 'basic' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Cơ Bản
                </button>
                <button
                  onClick={() => handleTabSwitch('radio')}
                  className={`flex-1 py-1.5 rounded text-[11px] font-bold cursor-pointer transition flex items-center justify-center gap-1 ${activeTab === 'radio' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Sparkles size={12} className={activeTab === 'radio' ? 'text-amber-500' : ''} />
                  Radio
                </button>
              </div>
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
            <div className="flex-1 overflow-y-auto flex flex-col gap-2 custom-scrollbar pr-1">
              {passages.filter(passage => {
                if (passage.isCustom) return activeTab === 'basic';
                const match = passage.id.match(/^passage-(\d+)$/);
                if (match) {
                  const num = parseInt(match[1], 10);
                  if (activeTab === 'basic') return num <= 8;
                  if (activeTab === 'radio') return num >= 9;
                }
                return activeTab === 'basic';
              }).map((passage) => {
                const idx = passages.indexOf(passage);
                return (
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
                );
              })}
            </div>
          </div>

          {/* TTS Config */}
          {activeTab === 'basic' && (
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" />
                  Cấu hình giọng đọc
                </span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      setPitch(0.8);
                      setRate(0.75);
                      // Thử tìm giọng tự nhiên nếu có (trên Edge/Windows)
                      const naturalVoice = voices.find(v => v.name.includes('Natural') && (v.lang.includes('zh-CN') || v.lang.includes('zh')));
                      if (naturalVoice) setSelectedVoice(naturalVoice.name);
                    }}
                    className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md text-[10px] font-bold text-indigo-700 transition cursor-pointer flex items-center gap-1 shadow-sm"
                    title="Giọng kể chuyện radio trầm ấm, chậm rãi"
                  >
                    🎧 Giọng Radio
                  </button>
                  <button
                    onClick={() => {
                      setPitch(1.0);
                      setRate(0.85);
                    }}
                    className="px-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-[10px] font-bold text-slate-600 transition cursor-pointer shadow-sm"
                    title="Giọng đọc tiêu chuẩn"
                  >
                    Mặc định
                  </button>
                </div>
              </div>

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
          )}

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

            {!currentPassage.audioUrl && (
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
            )}
          </div>

          {currentPassage.audioUrl && (
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col gap-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1.5">
                🎧 Nghe Audio Mẫu
              </span>
              <audio
                ref={audioRef}
                controls
                src={currentPassage.audioUrl}
                className="w-full h-10 outline-none"
                onPlay={() => handleStop()}
                onTimeUpdate={handleAudioTimeUpdate}
                onEnded={() => setActiveLineIndex(null)}
              />
            </div>
          )}

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
                      onClick={() => handleLineClick(line, index)}
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
