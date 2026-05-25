const cleanString = (str) => {
  if (!str) return ''

  const apostrophes = [
    '\u0027', // ASCII apostrophe '
    '\u2019', // right single quotation mark '
    '\u2018', // left single quotation mark '
    '\u02BC', // modifier letter apostrophe ʼ
    '\u02BB', // modifier letter turned comma ʻ
    '\uFF07', // fullwidth apostrophe
    '`',      // backtick
    '\u00B4', // acute accent
  ]

  let normalized = str.toLowerCase()
  for (const apos of apostrophes) {
    normalized = normalized.split(apos).join('')
  }

  try {
    return normalized.replace(/[^\p{L}]/gu, '')
  } catch {
    return normalized.replace(/[^a-zа-яА-ЯёЁ0-9]/gi, '').toLowerCase()
  }
}

const a = cleanString("sog'liq")
const b = cleanString("sogliq")

console.log('Input 1: sog\'liq => normalized:', a)
console.log('Input 2: sogliq => normalized:', b)
console.log('Are they equal?', a === b)
console.log('Result:', a === b ? '✓ PASS' : '✗ FAIL')

