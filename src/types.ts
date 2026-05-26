export interface VocabularyWord {
  id: string;
  character: string;      // Chữ Hán (e.g., "这")
  pinyin: string;         // Phiên âm (e.g., "zhè")
  definition: string;     // Nghĩa tiếng Việt (e.g., "cái này")
  category: string;       // Nhãn phân loại (e.g., "Bài 4: Giới thiệu bản thân", "Tự học", v.v.)
  notes?: string;         // Ghi chú thêm (khắc họa chi tiết)
  exampleChinese?: string; // Ví dụ câu tiếng Trung
  exampleVietnamese?: string; // Dịch câu ví dụ tiếng Việt
  
  // Các chỉ số học tập (tiện cho Spaced Repetition / LocalStorage)
  correctCount: number;
  incorrectCount: number;
  status: 'new' | 'learning' | 'mastered';
  favorite?: boolean;
}

export interface QuizQuestion {
  id: string;
  type: 'character-to-definition' | 'character-to-pinyin' | 'pinyin-to-definition' | 'definition-to-character';
  word: VocabularyWord;
  options: string[]; // 4 lựa chọn
  correctAnswer: string;
}

export interface LearnStats {
  totalWords: number;
  newWords: number;
  learningWords: number;
  masteredWords: number;
  favoritesCount: number;
}
