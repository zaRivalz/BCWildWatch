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
  spider: ({ size = 26 }: GlyphProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="13" rx="3" ry="3.6" />
      <circle cx="12" cy="8" r="1.8" />
      <path d="M9 11 4 8M9 13H3.5M9 15l-4.5 3M15 11l5-3M15 13h5.5M15 15l4.5 3" />
    </svg>
  ),
  lizard: ({ size = 26 }: GlyphProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 16c2 0 2.5-2 4.5-2s2 2 4 2 2.5-3 4.5-3c2.5 0 3.5 2.5 2 4.5" />
      <circle cx="6.5" cy="8" r="2.3" />
      <path d="M5.7 7.5h.01" />
      <path d="M8.6 8c2.4.4 3.6 2 4 4" />
    </svg>
  ),
  ant: ({ size = 26 }: GlyphProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6.5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2.3" />
      <circle cx="18" cy="12" r="2.6" />
      <path d="M5 9.5 3.5 7.5M5 14.5l-1.5 2M11 9.7 10 7.5M11 14.3l-1 2M16.5 9.8 15.5 7.8M16.5 14.2l-1 2" />
      <path d="M5.4 10.3 4 9M5.4 13.7 4 15" />
    </svg>
  ),
  roach: ({ size = 26 }: GlyphProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="13" rx="4" ry="6" />
      <path d="M12 8.5V18" />
      <path d="M9.5 6 7.5 3.5M14.5 6l2-2.5" />
      <path d="M8 10 4.5 8.5M8 13H4M8 16l-3.5 1.5M16 10l3.5-1.5M16 13h4M16 16l3.5 1.5" />
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
  spider: { id: 'spider', label: 'Spider', risk: 'medium', hue: '#9333EA' },
  lizard: { id: 'lizard', label: 'Lizard', risk: 'low', hue: '#0D9488' },
  ant: { id: 'ant', label: 'Ant colony', risk: 'low', hue: '#B45309' },
  roach: { id: 'roach', label: 'Cockroach', risk: 'low', hue: '#A16207' },
  other: { id: 'other', label: 'Other', risk: 'low', hue: '#6B8678' },
};

/** Resolve any free-text animal name to a canonical kind for display. */
export function kindForName(name: string | null | undefined): AnimalKind {
  const s = (name ?? '').toLowerCase();
  if (/snake|cobra|mamba|adder|serpent|python|viper/.test(s)) return ANIMAL_KINDS.snake;
  if (/bee|wasp|swarm|hive|hornet/.test(s)) return ANIMAL_KINDS.bee;
  if (/dog|stray|canine|puppy/.test(s)) return ANIMAL_KINDS.dog;
  if (/monkey|baboon|ape|primate|vervet/.test(s)) return ANIMAL_KINDS.monkey;
  if (/spider|arachnid|tarantula|widow/.test(s)) return ANIMAL_KINDS.spider;
  if (/lizard|gecko|skink|chameleon|iguana|reptile/.test(s)) return ANIMAL_KINDS.lizard;
  if (/ant\b|ants|colony|termite/.test(s)) return ANIMAL_KINDS.ant;
  if (/roach|cockroach|beetle|bug|insect/.test(s)) return ANIMAL_KINDS.roach;
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
