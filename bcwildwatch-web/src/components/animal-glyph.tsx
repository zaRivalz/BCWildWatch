// Animal glyphs + colored "token" chip, ported from the BC WildWatch Claude
// Design handoff. Real reports carry free-text animal names from Dataverse, so
// `kindForName` maps any name onto one of five canonical kinds for the glyph,
// brand hue and a default risk tone.
import type { ReactNode } from 'react';

type GlyphProps = { size?: number };

export const AnimalGlyph = {
  snake: ({ size = 26 }: GlyphProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 18c3 0 3-3 0-3s-3-3 0-3 4-2 4-4a3 3 0 0 1 6 0c0 4-7 3-7 7" />
      <path d="M18 6.5c.9.4 1.6 1.2 1.8 2.2" />
      <circle cx="18.4" cy="4.6" r=".5" fill="currentColor" />
    </svg>
  ),
  bee: ({ size = 26 }: GlyphProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="14" rx="4.2" ry="5.5" />
      <path d="M8.4 12h7.2M8.2 15h7.6" />
      <path d="M8 9.5C5 7 3.5 8 4.5 10.5M16 9.5C19 7 20.5 8 19.5 10.5" />
      <path d="M10.5 6.5 12 8l1.5-1.5" />
    </svg>
  ),
  dog: ({ size = 26 }: GlyphProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 8 4 4l3.5 2.2A6 6 0 0 1 12 5a6 6 0 0 1 4.5 1.2L20 4l-1 4" />
      <path d="M5 8v6a5 5 0 0 0 5 5h4a5 5 0 0 0 5-5V8" />
      <path d="M10 13h.01M14 13h.01M11 16h2" />
    </svg>
  ),
  monkey: ({ size = 26 }: GlyphProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="7" />
      <path d="M5.5 9.5C3 9 3 6 5.5 6.5M18.5 9.5C21 9 21 6 18.5 6.5" />
      <ellipse cx="12" cy="14" rx="3.5" ry="3" />
      <path d="M10 12.5h.01M14 12.5h.01M11 15h2" />
    </svg>
  ),
  other: ({ size = 26 }: GlyphProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="9" r="1.6" />
      <circle cx="12" cy="7" r="1.6" />
      <circle cx="17" cy="9" r="1.6" />
      <path d="M12 12c-3 0-5 2-5 4.2 0 1.6 1.4 2.3 2.6 1.6.9-.5 1.9-.5 2.8 0 1.2.7 2.6 0 2.6-1.6C15 14 13 12 12 12Z" />
    </svg>
  ),
} as const;

export type AnimalGlyphId = keyof typeof AnimalGlyph;
export type RiskTone = 'low' | 'medium' | 'high';

export interface AnimalKind {
  id: AnimalGlyphId;
  label: string;
  risk: RiskTone;
  hue: string;
}

export const ANIMAL_KINDS: Record<AnimalGlyphId, AnimalKind> = {
  snake: { id: 'snake', label: 'Snake', risk: 'high', hue: '#16A34A' },
  bee: { id: 'bee', label: 'Bee swarm', risk: 'medium', hue: '#D97706' },
  dog: { id: 'dog', label: 'Stray dog', risk: 'medium', hue: '#0E7490' },
  monkey: { id: 'monkey', label: 'Monkey', risk: 'low', hue: '#7C3AED' },
  other: { id: 'other', label: 'Other', risk: 'low', hue: '#6B8678' },
};

/** Resolve any free-text animal name to a canonical kind for display. */
export function kindForName(name: string | null | undefined): AnimalKind {
  const s = (name ?? '').toLowerCase();
  if (/snake|cobra|mamba|adder|serpent|python|viper/.test(s)) return ANIMAL_KINDS.snake;
  if (/bee|wasp|swarm|hive|hornet/.test(s)) return ANIMAL_KINDS.bee;
  if (/dog|stray|canine|puppy/.test(s)) return ANIMAL_KINDS.dog;
  if (/monkey|baboon|ape|primate|vervet/.test(s)) return ANIMAL_KINDS.monkey;
  return ANIMAL_KINDS.other;
}

/** Colored chip with the matching glyph, used across cards/rows/hero. */
export function AnimalToken({
  name,
  kind,
  size = 44,
  radius,
}: {
  name?: string;
  kind?: AnimalKind;
  size?: number;
  radius?: number;
}): ReactNode {
  const k = kind ?? kindForName(name);
  const Glyph = AnimalGlyph[k.id] ?? AnimalGlyph.other;
  return (
    <span
      className="atoken"
      style={{
        width: size,
        height: size,
        borderRadius: radius ?? Math.round(size * 0.32),
        color: k.hue,
        background: `color-mix(in srgb, ${k.hue} 14%, transparent)`,
        boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${k.hue} 22%, transparent)`,
      }}
    >
      <Glyph size={Math.round(size * 0.58)} />
    </span>
  );
}
