/**
 * Нормализует строку: оставляет только буквенные символы и цифры, и приводит к нижнему регистру.
 * Апострофы, дефисы, пробелы и другие знаки препинания будут удалены.
 */
export function cleanString(str: string): string {
  if (!str) return ''
  // \p{L} - любая буква на любом языке
  // \p{N} - любое число
  // u - флаг для поддержки Unicode
  return str.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')
}

/**
 * Проверяет правильность ответа пользователя
 * Поддерживает множественные варианты перевода через запятую
 *
 * @param userAnswer - ответ пользователя
 * @param correctTranslation - правильный перевод (может содержать варианты через запятую)
 * @returns true если ответ правильный
 */
export function validateAnswer(userAnswer: string, correctTranslation: string): boolean {
  const cleanedUser = cleanString(userAnswer)
  if (!cleanedUser) return false

  // Разбиваем перевод на варианты (по запятой, слэшу, точке с запятой)
  const variants = correctTranslation
    .split(/[,;\/]/)
    .map(v => v.trim())
    .filter(v => v.length > 0)

  // Проверяем совпадение с любым вариантом
  for (const variant of variants) {
    const cleanedVariant = cleanString(variant)

    // Точное совпадение после очистки
    if (cleanedUser === cleanedVariant) {
      return true
    }

    // Вариант содержит ответ пользователя (для длинных слов)
    if (cleanedVariant.includes(cleanedUser) && cleanedUser.length >= 3) {
      return true
    }
  }

  return false
}
