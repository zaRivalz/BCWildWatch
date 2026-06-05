import { Icon, type IconName } from '@/components/icons';

export function PageHead({
  eyebrow,
  icon,
  title,
  sub,
}: {
  eyebrow: string;
  icon: IconName;
  title: string;
  sub?: string;
}) {
  const Glyph = Icon[icon];
  return (
    <div className="page-head rise">
      <div className="eyebrow">
        <Glyph size={15} /> {eyebrow}
      </div>
      <h1>{title}</h1>
      {sub && <p>{sub}</p>}
    </div>
  );
}
