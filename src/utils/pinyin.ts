/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

function convertSyllable(syllable: string, toneStr: string): string {
  const tone = parseInt(toneStr) - 1; // 0 to 3 for tones 1-4
  if (tone < 0 || tone > 3) return syllable;

  // Let's check priority order of vowels: a, o, e, ui, iu, other
  const hasA = syllable.match(/[aA]/);
  const hasO = syllable.match(/[oO]/);
  const hasE = syllable.match(/[eE]/);

  if (hasA) {
    return syllable.replace(/[aA]/, (m) => m === 'a' ? ['ā', 'á', 'ǎ', 'à'][tone] : ['Ā', 'Á', 'Ǎ', 'À'][tone]);
  }
  if (hasO) {
    return syllable.replace(/[oO]/, (m) => m === 'o' ? ['ō', 'ó', 'ǒ', 'ò'][tone] : ['Ō', 'Ó', 'Ǒ', 'Ò'][tone]);
  }
  if (hasE) {
    return syllable.replace(/[eE]/, (m) => m === 'e' ? ['ē', 'é', 'ě', 'è'][tone] : ['Ē', 'É', 'Ě', 'È'][tone]);
  }

  // Check for 'ui' or 'iu' (the tone goes on the last vowel)
  const isUI = syllable.match(/[uU][iI]/);
  const isIU = syllable.match(/[iI][uU]/);
  if (isUI) {
    return syllable.replace(/[iI]/, (m) => m === 'i' ? ['ī', 'í', 'ǐ', 'ì'][tone] : ['Ī', 'Í', 'Ǐ', 'Ì'][tone]);
  }
  if (isIU) {
    return syllable.replace(/[uU]/, (m) => m === 'u' ? ['ū', 'ú', 'ǔ', 'ù'][tone] : ['Ū', 'Ú', 'Ǔ', 'Ù'][tone]);
  }

  // Otherwise check the vowel characters
  const otherVowels = ['i', 'u', 'v', 'ü', 'I', 'U', 'V', 'Ü'];
  const map: Record<string, string[]> = {
    'i': ['ī', 'í', 'ǐ', 'ì'],
    'u': ['ū', 'ú', 'ǔ', 'ù'],
    'v': ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
    'ü': ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
    'I': ['Ī', 'Í', 'Ǐ', 'Ì'],
    'U': ['Ū', 'Ú', 'Ǔ', 'Ù'],
    'V': ['Ǖ', 'Ǘ', 'Ǚ', 'ǜ'],
    'Ü': ['Ǖ', 'Ǘ', 'Ǚ', 'ǜ']
  };

  // Replace the last vowel from end of the syllable
  for (let i = syllable.length - 1; i >= 0; i--) {
    const char = syllable[i];
    if (otherVowels.includes(char)) {
      const marks = map[char];
      return syllable.substring(0, i) + marks[tone] + syllable.substring(i + 1);
    }
  }

  return syllable;
}

/**
 * Converts inline pinyin number tones (e.g. "zhe4", "hao3") to unicode equivalents ("zhè", "hǎo").
 */
export function convertNumberedPinyin(text: string): string {
  if (!text) return '';
  // Convert standard typed v -> ü, v1 -> ǖ
  let temp = text.replace(/v/g, 'ü').replace(/V/g, 'Ü');
  return temp.replace(/([a-zA-ZüÜ]+)([1-4])/g, (_, syl, tone) => {
    return convertSyllable(syl, tone);
  });
}

/**
 * Lenient comparison for Vietnamese definitions to prevent false negatives.
 */
export function checkDefinitionCorrect(userInput: string, targetDefinition: string): boolean {
  const userClean = userInput.trim().toLowerCase();
  if (!userClean) return false;

  const targetClean = targetDefinition.trim().toLowerCase();
  
  // Standard exact match after lowercasing
  if (userClean === targetClean) return true;

  // Clear text inside parenthesis like "(thì, đúng, vâng)" or "[...]"
  const withParenthesesRemoved = targetClean
    .replace(/\(.*?\)/g, ' ')
    .replace(/\[.*?\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Create list of acceptable responses by splitting target definition using common separators
  const synonyms = targetClean
    .split(/[;,/()]|hoặc/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const cleanSynonyms = withParenthesesRemoved
    .split(/[;,/]|hoặc/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  // Combine synonyms into a unique set
  const allPossibleAnswers = Array.from(new Set([...synonyms, ...cleanSynonyms, targetClean, withParenthesesRemoved]))
    .filter(s => s.length > 0);

  // Check if user answer matches any synonym
  const isMatch = allPossibleAnswers.some(ans => {
    if (userClean === ans) return true;
    
    // Check if user input is fully contained as a word in the acceptable answer or vice-versa
    if (ans.includes(userClean) && userClean.length >= 2) {
      // Check word boundaries so "là" doesn't match "làm sao" incorrectly
      const regex = new RegExp(`\\b${userClean}\\b`, 'i');
      if (regex.test(ans)) return true;
    }
    if (userClean.includes(ans) && ans.length >= 2) {
      const regex = new RegExp(`\\b${ans}\\b`, 'i');
      if (regex.test(userClean)) return true;
    }
    return false;
  });

  return isMatch;
}
