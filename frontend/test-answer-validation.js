/**
 * Test file для проверки функции validateAnswer
 * Запускается через: node test-answer-validation.js
 */

/**
 * Нормализует строку: удаляет все символы, кроме букв и цифр, и приводит к нижнему регистру.
 * Копия логики из frontend/lib/answer-validation.ts
 */
function cleanString(str) {
  if (!str) return ''
  // \p{L} - любая буква на любом языке
  // \p{N} - любое число
  // u - флаг для поддержки Unicode
  return str.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')
}

/**
 * Проверяет правильность ответа пользователя
 * Копия логики из frontend/lib/answer-validation.ts
 */
function validateAnswer(userAnswer, correctTranslation) {
  const cleanedUser = cleanString(userAnswer)
  if (!cleanedUser) return false

  // Разбиваем перевод на варианты (по запятой, слэшу, точке с запятой)
  const variants = correctTranslation
    .split(/[,;\/]/)
    .map(v => v.trim())
    .filter(v => v.length > 0)

  // Проверяем совпадение с любым вариантом
  return variants.some(variant => {
    const cleanedVariant = cleanString(variant)

    // Точное совпадение после очистки
    if (cleanedUser === cleanedVariant) return true

    // Вариант содержит ответ пользователя (для длинных слов)
    if (cleanedVariant.includes(cleanedUser) && cleanedUser.length >= 3) return true

    return false
  })
}

// Test cases
const tests = [
  { user: "sogliq", correct: "sog'liq", expected: true, desc: "Apostrophe without vs with" },
  { user: "sog'liq", correct: "sogliq", expected: true, desc: "Apostrophe with vs without" },
  { user: "ozbek", correct: "o'zbek", expected: true, desc: "Uzbek word with apostrophe" },
  { user: "o'zbek", correct: "ozbek", expected: true, desc: "Uzbek word without apostrophe" },
  { user: "health", correct: "health", expected: true, desc: "Exact match" },
  { user: "Health", correct: "health", expected: true, desc: "Case insensitive" },
  { user: "способность", correct: "способность, умение", expected: true, desc: "Multiple variants (Russian)" },
  { user: "умение", correct: "способность, умение", expected: true, desc: "Second variant" },
  { user: "кое-как", correct: "коекак", expected: true, desc: "Dash removal" },
  { user: "коекак", correct: "кое-как", expected: true, desc: "Dash removal (reversed)" },
  { user: "health", correct: "wealth", expected: false, desc: "Different words" },
  { user: "heal", correct: "health", expected: true, desc: "Partial match (>=3 chars)" },
  { user: "he", correct: "health", expected: false, desc: "Partial match (<3 chars)" },
]

console.log('Running validateAnswer tests...\n')

let passed = 0
let failed = 0

tests.forEach((test, index) => {
  const result = validateAnswer(test.user, test.correct)
  const status = result === test.expected ? '✓ PASS' : '✗ FAIL'

  if (result === test.expected) {
    passed++
  } else {
    failed++
  }

  console.log(`${status} #${index + 1}: ${test.desc}`)
  console.log(`     Input: "${test.user}" vs "${test.correct}"`)
  console.log(`     Cleaned: "${cleanString(test.user)}" vs "${cleanString(test.correct)}"`)
  console.log(`     Expected: ${test.expected}, Got: ${result}\n`)
})

console.log(`\n${'='.repeat(50)}`)
console.log(`Total: ${passed} passed, ${failed} failed out of ${tests.length}`)
console.log(`Success rate: ${((passed / tests.length) * 100).toFixed(1)}%`)
console.log(`${'='.repeat(50)}`)

if (failed === 0) {
  console.log('\n✓ All tests passed!')
  process.exit(0)
} else {
  console.log('\n✗ Some tests failed!')
  process.exit(1)
}
