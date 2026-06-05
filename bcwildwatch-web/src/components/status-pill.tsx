// Status + risk presentation chips matching the BC WildWatch design system.
// `StatusPill` maps the Dataverse `bcw_status` option-set onto the design's
// three visual tones (new / progress / resolved) while showing the real label.
import { statusLabel } from '@/lib/reportStatus';
import type { RiskTone } from '@/components/animal-glyph';

export type StatusTone = 'new' | 'progress' | 'resolved';

export function statusTone(value: number | null | undefined): StatusTone {
  switch (statusLabel(value)) {
    case 'Submitted':
      return 'new';
    case 'In Progress':
      return 'progress';
    case 'Resolved':
      return 'resolved';
    default:
      return 'new';
  }
}

export function StatusPill({ status }: { status: number | null | undefined }) {
  return (
    <span className={`status status--${statusTone(status)}`}>
      <span className="dot" />
      {statusLabel(status)}
    </span>
  );
}

const RISK_LABEL: Record<RiskTone, string> = {
  low: 'Low risk',
  medium: 'Medium risk',
  high: 'High risk',
};

export function RiskBadge({ risk }: { risk: RiskTone }) {
  return (
    <span className={`badge risk-${risk}`}>
      <span className="dot" />
      {RISK_LABEL[risk]}
    </span>
  );
}
