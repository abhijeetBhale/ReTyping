import type { GameMode } from "./config";

/* ------------------------------------------------------------------ */
/* English levels: 1 (easiest) → 5 (hardest).                          */
/* Higher levels use longer, less frequent, trickier-to-spell words.   */
/* All base pools are lowercase a-z only; punctuation / numbers are    */
/* applied as a transform on top so levels work in every game mode.    */
/* ------------------------------------------------------------------ */

export const ENGLISH_LEVELS = [1, 2, 3, 4, 5] as const;
export type EnglishLevel = (typeof ENGLISH_LEVELS)[number];

export const DEFAULT_LEVEL: EnglishLevel = 1;

export const LEVEL_META: Record<EnglishLevel, { label: string; blurb: string }> = {
  1: { label: "English 1", blurb: "Easy · short everyday words" },
  2: { label: "English 2", blurb: "Easy+ · common words" },
  3: { label: "English 3", blurb: "Medium · longer words" },
  4: { label: "English 4", blurb: "Hard · uncommon words" },
  5: { label: "English 5", blurb: "Expert · long tricky words" },
};

export function parseLevel(value: unknown): EnglishLevel {
  const n = Number(value);
  if (Number.isInteger(n) && n >= 1 && n <= 5) return n as EnglishLevel;
  return DEFAULT_LEVEL;
}

/* Level 1 — shortest, most frequent words (2-4 letters). */
const ENGLISH_1 =
  "a an as at be by do go he if in is it me my no of on or so to up us we you the and for are but not all can will out one who how her him day way get see use come know time work make take talk tea tell that them then they think top try under walk water well wind word year yes sun run eat egg end red sea sky cat dog pig cow bus car bed box cup door desk hat pen book ball fish bird cake milk bread rice room home park road town tree leaf flower grass rain snow cold hot big small fast slow high low new old good bad happy sad long short";

/* Level 2 — common everyday words (4-6 letters). */
const ENGLISH_2 =
  "about there when where your come use what like many such them another always baby back bank beach bird blue book boy brown cake call chair children city class clean cold cookie dark dirty door down fast find floor flower fly food foot friend full game garden girl give green ground happy head help home house jump keep kind kitchen laugh letter light little live long look man mean mom morning move name near never night open other over place play quiet same school small three white woman mother father brother sister family table window plant money store shop street river lake field horse sheep apple grape lemon mango berry butter cheese honey juice coffee pasta salad soup sweet salt fresh warm cool bright evening today here which while black pink gray";

function splitPool(pool: string): string[] {
  return pool.split(" ").filter(Boolean);
}

function dedupe(pool: string): string[] {
  return [...new Set(splitPool(pool))];
}

/* Level 3 — medium words (5-8 letters), everyday and a little abstract. */
const ENGLISH_3 =
  "morning night place quiet school woman world write black bring carry catch clean clear climb close cloud color count cover dance dream drink drive enjoy enter field first force found frame fresh front frost giant globe grade grain grand grant grape grass great greet grief group guard guess guest guide habit heart heavy hello honey honor horse human hurry ideal image inner input issue ivory jewel joint judge juice knife knock known label large layer learn least leave legal lemon level limit local logic loose lover lower lucky lunch magic major maker march match maybe mayor meant medal media merry metal method middle might minor minus model money month moral motor mount mouse mouth movie music nasty noble noise north novel nurse ocean offer often older olive onion opera order ought outer owner paint panel paper party peace penny phase phone photo piano piece pilot pitch plain plane plant plate point pound power press price pride prime print prize proof proud prove queen quick quite radio raise range rapid ratio reach ready refer renew reply rider right roast robot round route royal rural salad scale scene score sense serve seven shade shake shall shape share sharp sheep sheet shelf shell shift shine shirt shock shore short shout shown sight silly since sixth skill skirt sleep slice slide slope smart smell smile smoke snake solar solid solve sorry sound south space spare speak speed spell spend spice split spoke sport staff stage stair stand start state steam steel steep stick still stock stone stood store storm story strip style sugar sunny taken taste teach teeth thank theme thick thing third threw throw thumb tiger tight tired title token tooth topic total touch tough tower trace track trade trail train treat trend trend trial tribe trick truck truly trust truth twice under union unite until upper upset urban usual valid value video visit vital voice voter waste watch weave wheel whole whose worry worth wound wrong yield young youth";

/* Level 4 — long, less common words (7-10 letters). */
const ENGLISH_4 =
  "adventure balance beauty brave calm change clarity compassion connection courage curious danger early faith gentle glory brave bold swift rapid hasten listen silent manner dinner center meter focus exact honor labor favor color fiber anchor ache brave story power music magic light dream heart earth forest desert island valley hill rock metal gold silver brave bold enemy empty enjoy enter entry equal error essay event exact exist extra faint fancy fault favor feast fence fever fifty fight final flame flash fleet flesh float flour fluid force forty forum frame fruit funny given glass globe glory gloves marble marvel master match mayor meant medal merry metal middle minor model moral motor mount movie music nasty noble novel nurse ocean offer olive onion opera order outer owner paint panel paper party peace phase phone photo pilot pitch plain plane plant plate point pound power press price pride prime print prize proof proud queen radio raise range rapid ratio reach ready refer renew reply rider river roast robot round route royal rural salad scale scene score sense serve seven shade shake shape share sharp sheep sheet shelf shell shift shine shirt shock shore short shout sight silly sixth skill skirt sleep slice slide slope smart smell smile smoke snake solar solid solve sorry sound south space spare speak speed spell spend spice split spoke sport staff stage stair stand start state steam steel steep stick still stock stone stood store storm story strip style sugar sunny taken taste teach teeth thank theme thick thing third threw throw thumb tiger tight tired title token tooth topic total touch tough tower trace track trade trail train treat trend trial tribe trick truck truly trust truth twice union unite until upper upset urban usual valid value video visit vital voice voter waste watch weave wheel whole worry worth wound yield youth wisdom power glory power";

const ENGLISH_5 =
  "excitement collaboration comfortable creative determination discovery dynamic environment essential experience freedom genuine harmony imagination influence journey leadership mindset motivation opportunity passion patience perspective powerful progress purposeful reflection resilience respect responsibility strength success talent teamwork thoughtfulness transformation understanding wisdom versatility vision vitality acceptance achievement bravery calmness clarity compassion connection courage curiosity empathy enthusiasm exploration gratitude generosity growth happiness honesty humility kindness mindfulness openness optimism perseverance positivity potential purpose reflection sincerity support trust truth knowledge rhythm subtle doubt debt psychology wrench wrist scheme chorus choir anchor character chemistry scholar castle listen wrestle hasten soften fasten ballet bouquet debris depot corps cheque gauge heir honest reinstall dissatisfied mischievous definitely separate desperate embarrass harvest marriage weird science efficiently conscience rhythm although shoulder border order people often listen silent manner through though thought tough thorough enough early earth above below after before while write heavy light night sight might right fight flight bright fright tough rough enough through though thought shoulder marvel marvellous behaviour colour favour honour labour neighbour rumour splendour vigour rhythm rhyme subtle castle wrestle";

export const levelPools: Record<EnglishLevel, string[]> = {
  1: dedupe(ENGLISH_1),
  2: dedupe(ENGLISH_2),
  3: dedupe(ENGLISH_3),
  4: dedupe(ENGLISH_4),
  5: dedupe(ENGLISH_5),
};

export function baseWordsForLevel(level: EnglishLevel): string[] {
  return levelPools[level] ?? levelPools[DEFAULT_LEVEL];
}

const TRAILING_PUNCT = [".", ",", "!", "?", ";", ":", "..."];
const OPENERS = ['"', "(", "\u201c"];

function maybeCapitalize(word: string, chance: number): string {
  if (Math.random() < chance && /^[a-z]/.test(word)) {
    return word[0].toUpperCase() + word.slice(1);
  }
  return word;
}

/** Decorate a base word sequence with punctuation + light capitalization. */
function applyPunctuation(words: string[]): string[] {
  let sentenceStart = true;
  return words.map((w) => {
    let word = w;
    if (sentenceStart || Math.random() < 0.08) {
      word = maybeCapitalize(word, 1);
      sentenceStart = false;
    }
    const roll = Math.random();
    if (roll < 0.1) {
      const p = TRAILING_PUNCT[Math.floor(Math.random() * TRAILING_PUNCT.length)];
      word = word + p;
      if (p === "." || p === "!" || p === "?" || p === "...") sentenceStart = true;
    } else if (roll < 0.13) {
      word = OPENERS[Math.floor(Math.random() * OPENERS.length)] + word;
    }
    return word;
  });
}

function randomNumberString(): string {
  const digits = 1 + Math.floor(Math.random() * 3);
  const max = 10 ** digits - 1;
  return String(Math.floor(Math.random() * (max + 1)));
}

/** Mix random numbers into the sequence (monkeytype-style numbers mode). */
function applyNumbers(words: string[]): string[] {
  return words.map((w) => (Math.random() < 0.15 ? randomNumberString() : w));
}

/**
 * Build one full test sequence: sample `count` base words for the level,
 * then decorate per game mode.
 */
export function wordsForTest(mode: GameMode, level: EnglishLevel, count: number): string[] {
  const base = baseWordsForLevel(level);
  const seq: string[] = Array.from({ length: count }, () => randomWord(base));
  if (mode === "punctuation") return applyPunctuation(seq);
  if (mode === "numbers") return applyNumbers(applyPunctuation(seq));
  return seq;
}

/** Uniform random pick. */
export function randomWord(pool: string[]): string {
  return pool[Math.floor(Math.random() * pool.length)];
}
