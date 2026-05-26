import { VocabularyWord } from '../types';

/**
 * Trích xuất tên bài (lesson) từ category string.
 * Ví dụ: "Bài 1: Giới thiệu bản thân" → "Bài 1: Giới thiệu bản thân"
 * Nếu category rỗng → trả về "Chưa phân loại"
 */
export function getLessonName(category: string): string {
  return category.trim() || 'Chưa phân loại';
}

/**
 * Lấy danh sách các bài (lesson/category) duy nhất từ danh sách từ vựng,
 * sắp xếp theo thứ tự tự nhiên (Bài 1, Bài 2, ...).
 */
export function getUniqueLessons(words: VocabularyWord[]): string[] {
  const lessonsSet = new Set<string>();
  words.forEach(w => {
    const lesson = getLessonName(w.category);
    lessonsSet.add(lesson);
  });

  return Array.from(lessonsSet).sort((a, b) => {
    // Trích số bài để sắp xếp tự nhiên: "Bài 1: ..." → 1
    const numA = parseInt(a.match(/\d+/)?.[0] || '999');
    const numB = parseInt(b.match(/\d+/)?.[0] || '999');
    if (numA !== numB) return numA - numB;
    return a.localeCompare(b, 'vi');
  });
}

/**
 * Đếm số từ theo từng bài.
 */
export function countWordsByLesson(words: VocabularyWord[]): Map<string, number> {
  const counts = new Map<string, number>();
  words.forEach(w => {
    const lesson = getLessonName(w.category);
    counts.set(lesson, (counts.get(lesson) || 0) + 1);
  });
  return counts;
}
