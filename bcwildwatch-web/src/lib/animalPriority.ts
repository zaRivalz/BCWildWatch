// Mirrors the `bcw_priority` Choice (option set) on the bcw_animal table in
// Dataverse. Each animal carries a priority/risk level (Low/Medium/High) that
// the report screen displays and Power BI charts on. The website reads these
// values; it never writes them (they're maintained as reference data).
import type { RiskTone } from '@/components/animal-glyph';

export const ANIMAL_PRIORITY = {
  Low: 755900000,
  Medium: 755900001,
  High: 755900002,
} as const;

export type AnimalPriorityValue = (typeof ANIMAL_PRIORITY)[keyof typeof ANIMAL_PRIORITY];

const PRIORITY_TONE: Record<AnimalPriorityValue, RiskTone> = {
  [ANIMAL_PRIORITY.Low]: 'low',
  [ANIMAL_PRIORITY.Medium]: 'medium',
  [ANIMAL_PRIORITY.High]: 'high',
};

export function isValidPriorityValue(v: unknown): v is AnimalPriorityValue {
  return typeof v === 'number' && v in PRIORITY_TONE;
}

/** Maps a `bcw_priority` choice value to a UI risk tone, or null if unset/unknown. */
export function priorityTone(v: number | null | undefined): RiskTone | null {
  return isValidPriorityValue(v) ? PRIORITY_TONE[v] : null;
}
