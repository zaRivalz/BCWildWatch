// Pure, offline "WildWatch Assistant" intent matcher. Answers campus-wildlife
// safety questions from the curated SAFETY_TIPS data — no external service or
// LLM, so it is free, deterministic, and unit-testable.

import { SAFETY_TIPS, EMERGENCY_CONTACTS, type DangerLevel } from '@/lib/safetyTips';

export type ReplyKind = 'emergency' | 'animal' | 'report' | 'greeting' | 'fallback';

export interface AssistantReply {
  kind: ReplyKind;
  text: string;
  animal?: string;
  danger?: DangerLevel;
  whatToDo?: string[];
  avoid?: string[];
  contacts?: { label: string; value: string }[];
}

// Map free-text keywords to the canonical animal name used in SAFETY_TIPS.
const ANIMAL_KEYWORDS: { animal: string; keywords: string[] }[] = [
  { animal: 'Snakes', keywords: ['snake', 'snakes', 'cobra', 'mamba', 'adder', 'serpent'] },
  { animal: 'Bee / Wasp Swarm', keywords: ['bee', 'bees', 'wasp', 'wasps', 'swarm', 'hive', 'sting', 'stung', 'hornet'] },
  { animal: 'Stray Dogs', keywords: ['dog', 'dogs', 'stray', 'puppy', 'canine'] },
  { animal: 'Monkeys / Baboons', keywords: ['monkey', 'monkeys', 'baboon', 'baboons', 'ape', 'primate'] },
  { animal: 'Spiders / Scorpions', keywords: ['spider', 'spiders', 'scorpion', 'scorpions', 'arachnid'] },
];

const EMERGENCY_KEYWORDS = [
  'emergency', 'hurt', 'injured', 'injury', 'bitten', 'bit', 'bite', 'bleeding',
  'blood', 'unconscious', 'collapsed', 'breathe', 'breathing', 'allergic',
  'anaphylaxis', 'attacked', 'attack', 'dying', 'ambulance', 'urgent',
];
const REPORT_KEYWORDS = ['report', 'reporting', 'submit', 'log', 'sighting', 'sightings'];
const GREETING_KEYWORDS = ['hi', 'hello', 'hey', 'hiya', 'howzit', 'greetings', 'morning', 'afternoon', 'evening'];

/** Tokenises to lowercase whole words so "bee" never matches inside "been". */
function tokenize(text: string): Set<string> {
  return new Set((text.toLowerCase().match(/[a-z]+/g) ?? []));
}

function hasAny(tokens: Set<string>, keywords: string[]): boolean {
  return keywords.some((k) => tokens.has(k));
}

function findAnimal(tokens: Set<string>): (typeof SAFETY_TIPS)[number] | undefined {
  for (const { animal, keywords } of ANIMAL_KEYWORDS) {
    if (hasAny(tokens, keywords)) {
      return SAFETY_TIPS.find((t) => t.animal === animal);
    }
  }
  return undefined;
}

const EMERGENCY_TEXT =
  'If someone is hurt or in immediate danger, contact Campus Security right away and ' +
  'call 10177 (ambulance) or 112 from a mobile. Stay calm and keep a safe distance.';

const REPORT_TEXT =
  'To report a sighting: open the WildWatch app, go to Report, choose the animal, ' +
  'add the location and an optional photo, then submit. Security can then respond.';

const GREETING_TEXT =
  'Hi! I\'m the WildWatch Assistant. Ask me what to do if you spot wildlife on ' +
  'campus — like snakes, bees, stray dogs, monkeys, or spiders — or how to report a sighting.';

function fallbackText(): string {
  const animals = SAFETY_TIPS.map((t) => t.animal).join(', ');
  return (
    'I can help with campus wildlife safety and reporting. Try asking about: ' +
    `${animals}. You can also ask how to report a sighting, or say "emergency" if someone is hurt.`
  );
}

export function getAssistantReply(message: string): AssistantReply {
  const tokens = tokenize(message ?? '');
  const animal = findAnimal(tokens);

  // 1) Emergencies take priority, but still surface any matched animal guidance.
  if (hasAny(tokens, EMERGENCY_KEYWORDS)) {
    return {
      kind: 'emergency',
      text: EMERGENCY_TEXT,
      contacts: [...EMERGENCY_CONTACTS],
      ...(animal
        ? { animal: animal.animal, danger: animal.danger, whatToDo: animal.whatToDo, avoid: animal.avoid }
        : {}),
    };
  }

  // 2) Specific animal guidance.
  if (animal) {
    return {
      kind: 'animal',
      text: `Here's what to do about ${animal.animal.toLowerCase()} (${animal.danger} risk):`,
      animal: animal.animal,
      danger: animal.danger,
      whatToDo: animal.whatToDo,
      avoid: animal.avoid,
    };
  }

  // 3) How to report.
  if (hasAny(tokens, REPORT_KEYWORDS)) {
    return { kind: 'report', text: REPORT_TEXT };
  }

  // 4) Greeting.
  if (hasAny(tokens, GREETING_KEYWORDS)) {
    return { kind: 'greeting', text: GREETING_TEXT };
  }

  // 5) Fallback.
  return { kind: 'fallback', text: fallbackText() };
}
