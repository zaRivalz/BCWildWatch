// Simple stroke icon set (lucide-style geometry) ported from the BC WildWatch
// Claude Design handoff. Each icon is a function component taking `size`/`sw`
// plus any extra SVG props (e.g. className), so usage is `<Icon.pin size={18} />`.
import type { ReactNode, SVGProps } from 'react';

export type IconProps = { size?: number; sw?: number } & Omit<
  SVGProps<SVGSVGElement>,
  'strokeWidth' | 'width' | 'height'
>;

function Svg({
  size = 22,
  sw = 1.8,
  children,
  ...rest
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const Icon = {
  leaf: (p: IconProps) => (
    <Svg {...p}>
      <path d="M11 20A7 7 0 0 1 4 13c0-5 5-9 16-9 0 11-4 16-9 16Z" />
      <path d="M4 20C5 14 9 10 16 7" />
    </Svg>
  ),
  home: (p: IconProps) => (
    <Svg {...p}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-6h4v6" />
    </Svg>
  ),
  pin: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 21s-6.5-5.4-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.6 12 21 12 21Z" />
      <circle cx="12" cy="10.5" r="2.4" />
    </Svg>
  ),
  shield: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </Svg>
  ),
  grid: (p: IconProps) => (
    <Svg {...p}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" />
    </Svg>
  ),
  camera: (p: IconProps) => (
    <Svg {...p}>
      <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13" r="3.3" />
    </Svg>
  ),
  send: (p: IconProps) => (
    <Svg {...p}>
      <path d="M5 12 20 5l-5 15-3.5-6.5L5 12Z" />
    </Svg>
  ),
  sun: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" />
    </Svg>
  ),
  moon: (p: IconProps) => (
    <Svg {...p}>
      <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" />
    </Svg>
  ),
  plus: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  ),
  search: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-3.5-3.5" />
    </Svg>
  ),
  bell: (p: IconProps) => (
    <Svg {...p}>
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </Svg>
  ),
  menu: (p: IconProps) => (
    <Svg {...p}>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </Svg>
  ),
  x: (p: IconProps) => (
    <Svg {...p}>
      <path d="M6 6 18 18M18 6 6 18" />
    </Svg>
  ),
  check: (p: IconProps) => (
    <Svg {...p}>
      <path d="m5 12 4.5 4.5L19 7" />
    </Svg>
  ),
  alert: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 3 2.5 20h19L12 3Z" />
      <path d="M12 10v4.5M12 17.5h.01" />
    </Svg>
  ),
  clock: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </Svg>
  ),
  chevR: (p: IconProps) => (
    <Svg {...p}>
      <path d="m9 6 6 6-6 6" />
    </Svg>
  ),
  chevD: (p: IconProps) => (
    <Svg {...p}>
      <path d="m6 9 6 6 6-6" />
    </Svg>
  ),
  arrow: (p: IconProps) => (
    <Svg {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Svg>
  ),
  sparkle: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6L4.8 10.7 10.3 9 12 3.5Z" />
      <path d="M19 4.5 19.6 6.4 21.5 7l-1.9.6L19 9.5l-.6-1.9L16.5 7l1.9-.6L19 4.5Z" />
    </Svg>
  ),
  upload: (p: IconProps) => (
    <Svg {...p}>
      <path d="M12 16V5M8 9l4-4 4 4" />
      <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </Svg>
  ),
  users: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.2a3.2 3.2 0 0 1 0 6M20.5 19a5.5 5.5 0 0 0-3-4.9" />
    </Svg>
  ),
  flash: (p: IconProps) => (
    <Svg {...p}>
      <path d="M13 3 5 13h6l-1 8 8-10h-6l1-8Z" />
    </Svg>
  ),
  map: (p: IconProps) => (
    <Svg {...p}>
      <path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4Z" />
      <path d="M9 4v14M15 6v14" />
    </Svg>
  ),
  phone: (p: IconProps) => (
    <Svg {...p}>
      <path d="M6 3h4l1.5 5-2.5 1.5a12 12 0 0 0 5.5 5.5L16 17.5 21 19v-4a16 16 0 0 1-15-12Z" />
    </Svg>
  ),
  filter: (p: IconProps) => (
    <Svg {...p}>
      <path d="M3 5h18l-7 8v6l-4-2v-4L3 5Z" />
    </Svg>
  ),
  dots: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="5" cy="12" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="19" cy="12" r="1.4" />
    </Svg>
  ),
  eye: (p: IconProps) => (
    <Svg {...p}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.6" />
    </Svg>
  ),
  pawAlt: (p: IconProps) => (
    <Svg {...p}>
      <circle cx="7" cy="9" r="1.6" />
      <circle cx="12" cy="7" r="1.6" />
      <circle cx="17" cy="9" r="1.6" />
      <path d="M12 12c-3 0-5 2-5 4.2 0 1.6 1.4 2.3 2.6 1.6.9-.5 1.9-.5 2.8 0 1.2.7 2.6 0 2.6-1.6C15 14 13 12 12 12Z" />
    </Svg>
  ),
} as const;

export type IconName = keyof typeof Icon;
