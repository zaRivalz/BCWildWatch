// Static campus-wildlife safety guidance shown on the Safety Info page.
// Pure data + a presentation helper so it can be unit-tested in isolation.

export const DANGER_LEVELS = ['High', 'Moderate', 'Low'] as const;
export type DangerLevel = (typeof DANGER_LEVELS)[number];

export interface SafetyTip {
  animal: string;
  emoji: string;
  danger: DangerLevel;
  whatToDo: string[];
  avoid: string[];
}

export const SAFETY_TIPS: SafetyTip[] = [
  {
    animal: 'Snakes',
    emoji: '🐍',
    danger: 'High',
    whatToDo: [
      'Freeze, then back away slowly — most snakes flee if given space.',
      'Keep everyone at least 5 metres clear and warn passers-by.',
      'Report the exact location so security can cordon the area.',
    ],
    avoid: [
      'Do not try to catch, kill, or photograph it up close.',
      'Do not poke under rocks, drains, or dense bushes.',
    ],
  },
  {
    animal: 'Bee / Wasp Swarm',
    emoji: '🐝',
    danger: 'High',
    whatToDo: [
      'Move calmly indoors or into a vehicle and close windows.',
      'If stung, scrape (don\'t pinch) the sting out and seek help.',
      'Alert anyone with a known allergy immediately.',
    ],
    avoid: [
      'Do not swat or run waving your arms — it provokes the swarm.',
      'Do not disturb or spray the hive yourself.',
    ],
  },
  {
    animal: 'Stray Dogs',
    emoji: '🐕',
    danger: 'Moderate',
    whatToDo: [
      'Stand still, avoid eye contact, and let the dog lose interest.',
      'Speak in a low, calm voice and back away slowly.',
      'Report the sighting so security can manage the animal.',
    ],
    avoid: [
      'Do not run, scream, or turn your back suddenly.',
      'Do not attempt to feed or pet an unknown dog.',
    ],
  },
  {
    animal: 'Monkeys / Baboons',
    emoji: '🐒',
    danger: 'Moderate',
    whatToDo: [
      'Hide food and drinks out of sight and keep your distance.',
      'Stay calm and allow the animal a clear escape route.',
    ],
    avoid: [
      'Do not feed them — it encourages aggression.',
      'Do not corner them or get between a mother and young.',
    ],
  },
  {
    animal: 'Spiders / Scorpions',
    emoji: '🕷️',
    danger: 'Low',
    whatToDo: [
      'Give it space; most are harmless and will move on.',
      'If indoors, report it so it can be safely removed.',
      'Note the colour/size in your report to aid identification.',
    ],
    avoid: [
      'Do not handle it with bare hands.',
      'Do not reach blindly into bags, shoes, or storerooms.',
    ],
  },
];

export const EMERGENCY_CONTACTS = [
  { label: 'Campus Security (24/7)', value: 'Call the security desk or use the campus emergency line.' },
  { label: 'Medical Emergency', value: '10177 (ambulance) / 112 (from a mobile)' },
];

export function dangerBadgeClass(level: DangerLevel): string {
  switch (level) {
    case 'High':
      return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
    case 'Moderate':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
    case 'Low':
      return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
  }
}
