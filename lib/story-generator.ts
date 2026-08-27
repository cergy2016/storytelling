import { CEFRLevel, Category, Question, Story, VocabularyWord } from "@/types";

export interface GenerateStoryParams {
  level: CEFRLevel;
  topic: Category;
  length: "short" | "medium" | "long";
  vocabularyFocus: string;
  grammarFocus: string;
  customPrompt?: string;
}

const NAMES = ["Maya", "Elan", "Priya", "Tomas", "Nora", "Kwame", "Yuki", "Sofia"];
const PLACES = ["a small town", "a busy city", "a quiet village", "a coastal harbor", "a mountain valley"];

const WORD_TARGETS: Record<CEFRLevel, { short: number; medium: number; long: number }> = {
  A1: { short: 280, medium: 380, long: 480 },
  A2: { short: 420, medium: 550, long: 680 },
  B1: { short: 600, medium: 780, long: 950 },
  B2: { short: 850, medium: 1100, long: 1350 },
  C1: { short: 1200, medium: 1500, long: 1750 },
  C2: { short: 1600, medium: 1900, long: 2300 },
};

const CATEGORY_VOCAB: Record<Category, VocabularyWord[]> = {
  "Everyday Life": [
    { word: "routine", partOfSpeech: "noun", pronunciation: "/ruːˈtiːn/", definition: "The usual things you do every day.", example: "Her morning routine includes coffee and a short walk." },
    { word: "errand", partOfSpeech: "noun", pronunciation: "/ˈer.ənd/", definition: "A short trip to do a task.", example: "He ran an errand to the pharmacy." },
  ],
  Travel: [
    { word: "itinerary", partOfSpeech: "noun", pronunciation: "/aɪˈtɪn.ər.ər.i/", definition: "A planned route or schedule for a trip.", example: "She printed the itinerary before the flight." },
    { word: "layover", partOfSpeech: "noun", pronunciation: "/ˈleɪ.oʊ.vər/", definition: "A short stop between flights.", example: "They had a five-hour layover in Istanbul." },
  ],
  "Work & Business": [
    { word: "deadline", partOfSpeech: "noun", pronunciation: "/ˈdɛd.laɪn/", definition: "The time by which something must be finished.", example: "The report deadline is Friday." },
    { word: "negotiate", partOfSpeech: "verb", pronunciation: "/nɪˈɡoʊ.ʃi.eɪt/", definition: "To discuss something to reach an agreement.", example: "They negotiated a better price." },
  ],
  Relationships: [
    { word: "reconcile", partOfSpeech: "verb", pronunciation: "/ˈrek.ən.saɪl/", definition: "To become friendly again after a disagreement.", example: "The brothers finally reconciled after years apart." },
    { word: "confide", partOfSpeech: "verb", pronunciation: "/kənˈfaɪd/", definition: "To tell someone a secret, trusting them.", example: "She confided in her best friend." },
  ],
  Mystery: [
    { word: "suspicious", partOfSpeech: "adjective", pronunciation: "/səˈspɪʃ.əs/", definition: "Making you feel something is wrong.", example: "The unlocked door looked suspicious." },
    { word: "clue", partOfSpeech: "noun", pronunciation: "/kluː/", definition: "A piece of evidence that helps solve a problem.", example: "The footprint was an important clue." },
  ],
  Adventure: [
    { word: "expedition", partOfSpeech: "noun", pronunciation: "/ˌek.spəˈdɪʃ.ən/", definition: "A journey for a particular purpose, often exploration.", example: "The team planned a two-week expedition." },
    { word: "endure", partOfSpeech: "verb", pronunciation: "/ɪnˈdʊr/", definition: "To keep going through something difficult.", example: "They endured freezing winds on the ridge." },
  ],
  Culture: [
    { word: "heritage", partOfSpeech: "noun", pronunciation: "/ˈher.ɪ.tɪdʒ/", definition: "Traditions and history passed down over time.", example: "The festival celebrates local heritage." },
    { word: "custom", partOfSpeech: "noun", pronunciation: "/ˈkʌs.təm/", definition: "A traditional way of doing something.", example: "It's a custom to remove your shoes indoors." },
  ],
  Food: [
    { word: "flavor", partOfSpeech: "noun", pronunciation: "/ˈfleɪ.vər/", definition: "The taste of food.", example: "The soup had a rich, smoky flavor." },
    { word: "ingredient", partOfSpeech: "noun", pronunciation: "/ɪnˈɡriː.di.ənt/", definition: "One of the foods used to make a dish.", example: "Garlic is the key ingredient." },
  ],
  Technology: [
    { word: "upgrade", partOfSpeech: "verb", pronunciation: "/ʌpˈɡreɪd/", definition: "To improve something to a newer version.", example: "She upgraded her old laptop." },
    { word: "glitch", partOfSpeech: "noun", pronunciation: "/ɡlɪtʃ/", definition: "A small, temporary problem with technology.", example: "A glitch froze the screen." },
  ],
  "Personal Growth": [
    { word: "resilience", partOfSpeech: "noun", pronunciation: "/rɪˈzɪl.i.əns/", definition: "The ability to recover from difficulties.", example: "Her resilience helped her through a hard year." },
    { word: "reflect", partOfSpeech: "verb", pronunciation: "/rɪˈflekt/", definition: "To think carefully about something.", example: "He reflected on his choices." },
  ],
  History: [
    { word: "legacy", partOfSpeech: "noun", pronunciation: "/ˈleɡ.ə.si/", definition: "Something handed down from the past.", example: "The building is part of the town's legacy." },
    { word: "archive", partOfSpeech: "noun", pronunciation: "/ˈɑːr.kaɪv/", definition: "A collection of historical documents.", example: "The letters are kept in a national archive." },
  ],
  Science: [
    { word: "hypothesis", partOfSpeech: "noun", pronunciation: "/haɪˈpɒθ.ə.sɪs/", definition: "An idea that can be tested by experiment.", example: "Her hypothesis was proven wrong." },
    { word: "observe", partOfSpeech: "verb", pronunciation: "/əbˈzɜːrv/", definition: "To watch something carefully.", example: "They observed the reaction closely." },
  ],
  "True Stories": [
    { word: "testimony", partOfSpeech: "noun", pronunciation: "/ˈtes.tə.moʊ.ni/", definition: "A formal statement of what happened.", example: "Her testimony changed the case." },
    { word: "unwavering", partOfSpeech: "adjective", pronunciation: "/ʌnˈweɪ.vər.ɪŋ/", definition: "Steady and not changing.", example: "His unwavering focus impressed everyone." },
  ],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function levelSentenceBank(level: CEFRLevel, name: string, place: string, topic: string) {
  const banks: Record<CEFRLevel, string[]> = {
    A1: [
      `${name} lives in ${place}. ${name} likes ${topic.toLowerCase()}.`,
      `One day, something new happens. ${name} feels surprised.`,
      `${name} talks to a friend about it. They smile.`,
      `${name} decides to try something different.`,
      `It is a good day for ${name}.`,
    ],
    A2: [
      `${name} has lived in ${place} for many years, and ${topic.toLowerCase()} has always been part of daily life there.`,
      `Last week, something unusual happened that changed ${name}'s plans for the weekend.`,
      `${name} wasn't sure what to do, so a close friend offered some advice.`,
      `After thinking about it carefully, ${name} decided to take a small risk.`,
      `By the end of the day, ${name} felt proud of the decision.`,
    ],
    B1: [
      `${name}, who has always been fascinated by ${topic.toLowerCase()}, never expected an ordinary afternoon in ${place} to turn into something memorable.`,
      `While walking home, ${name} noticed something that didn't quite add up, and curiosity got the better of caution.`,
      `"I'm not sure this is a good idea," a friend warned, but ${name} had already made up their mind.`,
      `Things didn't go exactly as planned, and for a moment ${name} regretted the decision entirely.`,
      `Still, by the time the sun set over ${place}, ${name} understood something new about themselves.`,
    ],
    B2: [
      `${name} had built a life around ${topic.toLowerCase()} in ${place}, one where routine offered a kind of quiet comfort — until an unexpected complication threatened to unravel it.`,
      `It started as a minor inconvenience, the sort of thing ${name} would normally have brushed off, but this time it refused to be ignored.`,
      `Colleagues and friends offered plenty of opinions, most of them contradictory, which only deepened ${name}'s hesitation.`,
      `Weighing the risk against the potential reward, ${name} eventually chose the path that felt less safe but more honest.`,
      `In hindsight, the decision would come to define how ${name} approached everything that followed.`,
    ],
    C1: [
      `${name} had cultivated, over years spent in ${place}, a quiet expertise in ${topic.toLowerCase()} — the kind of competence that rarely draws attention until it is suddenly, urgently needed.`,
      `What began as an inconsequential anomaly soon revealed itself to be something far more consequential, forcing ${name} to reconsider assumptions long taken for granted.`,
      `Those closest to ${name} offered counsel shaped as much by their own anxieties as by any real insight into the situation.`,
      `${name} recognized, with a mixture of reluctance and clarity, that the comfortable choice and the honest one were no longer the same thing.`,
      `The consequences of that recognition would ripple outward long after the moment itself had faded from memory.`,
    ],
    C2: [
      `${name}'s relationship to ${topic.toLowerCase()} in ${place} had, over the years, calcified into something closer to identity than interest — which made the small, almost imperceptible fracture that appeared one ordinary morning all the more destabilizing.`,
      `It would have been easy — perhaps too easy — to dismiss the irregularity as trivial, a footnote unworthy of the attention it was quietly demanding.`,
      `The counsel offered by those nearest to ${name} was, as is so often the case, less a reflection of the problem than of the counselors' own unexamined fears.`,
      `${name} arrived, not without a certain wry self-awareness, at the uncomfortable recognition that convenience and integrity had long ago stopped pointing in the same direction.`,
      `What followed was less a resolution than a reckoning — one whose implications would only fully reveal themselves in retrospect.`,
    ],
  };
  return banks[level];
}

export function generateTemplateStory(params: GenerateStoryParams): Story {
  const name = pick(NAMES);
  const place = pick(PLACES);
  const sentences = levelSentenceBank(params.level, name, place, params.topic);
  const targetWords = WORD_TARGETS[params.level][params.length];
  const paragraphs: string[] = [];
  let wordCount = 0;
  let i = 0;
  while (wordCount < targetWords && i < 200) {
    const s = sentences[i % sentences.length];
    paragraphs.push(s);
    wordCount += s.split(/\s+/).length;
    i++;
  }

  const vocabPool = CATEGORY_VOCAB[params.topic];
  const vocabCount = { A1: 8, A2: 9, B1: 10, B2: 12, C1: 13, C2: 14 }[params.level];
  const vocabulary: VocabularyWord[] = [];
  for (let v = 0; v < vocabCount; v++) {
    vocabulary.push(vocabPool[v % vocabPool.length]);
  }

  const questions: Question[] = [
    {
      id: "gen-q1",
      type: "detail",
      prompt: "What is the main character's name?",
      options: [name, pick(NAMES.filter((n) => n !== name)), pick(NAMES.filter((n) => n !== name)), pick(NAMES.filter((n) => n !== name))],
      correctAnswer: name,
      explanation: `The story is told from ${name}'s point of view throughout.`,
      relevantExcerpt: paragraphs[0],
    },
    {
      id: "gen-q2",
      type: "main-idea",
      prompt: "What is this story mainly about?",
      options: [
        `${name}'s experience related to ${params.topic.toLowerCase()}`,
        "A recipe for a traditional dish",
        "Instructions for assembling furniture",
        "A weather forecast",
      ],
      correctAnswer: `${name}'s experience related to ${params.topic.toLowerCase()}`,
      explanation: `The story follows ${name} through a situation connected to ${params.topic.toLowerCase()}.`,
    },
    {
      id: "gen-q3",
      type: "true-false",
      prompt: `True or False: ${name} lives in ${place}.`,
      options: ["True", "False"],
      correctAnswer: "True",
      explanation: `The story states that ${name} lives in ${place}.`,
      relevantExcerpt: paragraphs[0],
    },
    {
      id: "gen-q4",
      type: "vocab-in-context",
      prompt: `What does "${vocabulary[0].word}" mean as used in this story's theme?`,
      options: [
        vocabulary[0].definition,
        vocabulary[1]?.definition ?? "A type of weather condition.",
        "A kind of musical instrument.",
        "A unit of currency.",
      ],
      correctAnswer: vocabulary[0].definition,
      explanation: `"${vocabulary[0].word}" means: ${vocabulary[0].definition}`,
    },
    {
      id: "gen-q5",
      type: "inference",
      prompt: `By the end of the story, how does ${name} most likely feel?`,
      options: [
        "Changed by the experience, in a small but meaningful way",
        "Completely unaffected by everything that happened",
        "Angry at everyone involved",
        "Determined to move to a different country immediately",
      ],
      correctAnswer: "Changed by the experience, in a small but meaningful way",
      explanation: "The final lines of the story suggest a shift in perspective or understanding.",
      relevantExcerpt: paragraphs[paragraphs.length - 1],
    },
  ];

  const title = `${params.topic}: A Story for ${params.level} Learners`;

  return {
    id: `generated-${Date.now()}`,
    title,
    level: params.level,
    category: params.topic,
    description: `An original ${params.level} story about ${params.topic.toLowerCase()}, generated for your practice.${
      params.customPrompt ? ` Based on: "${params.customPrompt}"` : ""
    }`,
    readingTime: Math.max(2, Math.round(wordCount / 200)),
    wordCount,
    difficulty: ({ A1: 1, A2: 1, B1: 2, B2: 3, C1: 4, C2: 5 } as const)[params.level],
    paragraphs,
    vocabulary,
    questions,
    speakingPrompts: [
      `Retell this story in your own words.`,
      `Have you ever had an experience related to ${params.topic.toLowerCase()}? Describe it.`,
      `What would you have done differently than ${name}?`,
      `Do you agree with the choice ${name} made? Why or why not?`,
    ],
    grammarFocus: params.grammarFocus ? [params.grammarFocus] : ["Mixed tenses"],
    vocabularyFocus: params.vocabularyFocus ? [params.vocabularyFocus] : [params.topic],
    audioAvailable: true,
  };
}
