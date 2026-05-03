export interface Question {
  id: number
  text: string
  options: string[]
  correctIndex: number // для локального подсчета
}

export const PLACEMENT_TEST_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "I ___ from Uzbekistan. My name is Aziz.",
    options: ["am", "is", "are", "be"],
    correctIndex: 0
  },
  {
    id: 2,
    text: "___ you like learning English with AI?",
    options: ["Do", "Does", "Are", "Is"],
    correctIndex: 0
  },
  {
    id: 3,
    text: "Yesterday, I ___ to the park with my friends.",
    options: ["go", "gone", "went", "was go"],
    correctIndex: 2
  },
  {
    id: 4,
    text: "She is the ___ person I know.",
    options: ["smartest", "smarter", "more smart", "most smart"],
    correctIndex: 0
  },
  {
    id: 5,
    text: "I haven't finished my homework ___.",
    options: ["already", "yet", "still", "since"],
    correctIndex: 1
  },
  {
    id: 6,
    text: "If I ___ more time, I would learn two languages.",
    options: ["have", "had", "will have", "would have"],
    correctIndex: 1
  },
  {
    id: 7,
    text: "The book ___ by a famous author in 1920.",
    options: ["was written", "wrote", "was write", "has written"],
    correctIndex: 0
  },
  {
    id: 8,
    text: "I look forward to ___ you at the conference.",
    options: ["see", "saw", "seeing", "be seeing"],
    correctIndex: 2
  },
  {
    id: 9,
    text: "Choose the synonym for 'Essential':",
    options: ["Necessary", "Optional", "Extra", "Minor"],
    correctIndex: 0
  },
  {
    id: 10,
    text: "He succeeded ___ passing the exam despite the difficulty.",
    options: ["on", "at", "in", "with"],
    correctIndex: 2
  },
  {
    id: 11,
    text: "By the time we arrived, the movie ___.",
    options: ["already started", "had already started", "has already started", "was already starting"],
    correctIndex: 1
  },
  {
    id: 12,
    text: "Choose the correct spelling:",
    options: ["Accommodation", "Acomodation", "Accomodation", "Acommodation"],
    correctIndex: 0
  },
  {
    id: 13,
    text: "The weather was so bad that the flight was ___.",
    options: ["called off", "put off", "taken off", "turned off"],
    correctIndex: 0
  },
  {
    id: 14,
    text: "Hardly ___ entered the room when the phone rang.",
    options: ["I had", "had I", "I have", "did I"],
    correctIndex: 1
  },
  {
    id: 15,
    text: "What does 'Ubiquitous' mean?",
    options: ["Rare", "Found everywhere", "Expensive", "Quiet"],
    correctIndex: 1
  },
  {
    id: 16,
    text: "I wish I ___ play the piano as well as you.",
    options: ["can", "could", "would", "will"],
    correctIndex: 1
  },
  {
    id: 17,
    text: "Despite ___ ill, he went to work.",
    options: ["he was", "being", "his", "to be"],
    correctIndex: 1
  },
  {
    id: 18,
    text: "The manager insisted that the report ___ finished today.",
    options: ["is", "was", "be", "being"],
    correctIndex: 2
  },
  {
    id: 19,
    text: "Identify the error: 'He is more taller than his brother.'",
    options: ["He", "is", "more taller", "than"],
    correctIndex: 2
  },
  {
    id: 20,
    text: "What is the meaning of 'To hit the nail on the head'?",
    options: ["To make a mistake", "To be exactly right", "To hurt oneself", "To work hard"],
    correctIndex: 1
  }
]

export function determineLevelFromScore(answers: Record<string | number, number>, questions: Question[]) {
  let score = 0
  questions.forEach(q => {
    if (answers[q.id] === q.correctIndex) {
      score++
    }
  })

  const ratio = score / questions.length
  let level = 'A1'
  if (ratio >= 0.9) level = 'C1'
  else if (ratio >= 0.7) level = 'B2'
  else if (ratio >= 0.5) level = 'B1'
  else if (ratio >= 0.3) level = 'A2'

  return { score, level }
}
