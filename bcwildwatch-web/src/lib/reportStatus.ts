// Mirrors the `bcw_status` Choice (option set) column on the bcw_report table in
// Dataverse. Values are the live option-set integers; labels are their display text.
export const REPORT_STATUS_OPTIONS = [
  { value: 755900000, label: 'Submitted' },
  { value: 755900002, label: 'In Progress' },
  { value: 755900003, label: 'Resolved' },
] as const;

export type ReportStatusValue = (typeof REPORT_STATUS_OPTIONS)[number]['value'];
export type ReportStatusLabel = (typeof REPORT_STATUS_OPTIONS)[number]['label'];

export const DEFAULT_STATUS_VALUE: ReportStatusValue = 755900000; // Submitted

export function isValidStatusValue(v: unknown): v is ReportStatusValue {
  return typeof v === 'number' && REPORT_STATUS_OPTIONS.some((o) => o.value === v);
}

export function statusLabel(v: number | null | undefined): ReportStatusLabel {
  return REPORT_STATUS_OPTIONS.find((o) => o.value === v)?.label ?? 'Submitted';
}

export function statusBadgeClass(v: number | null | undefined): string {
  switch (statusLabel(v)) {
    case 'Submitted':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
    case 'In Progress':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300';
    case 'Resolved':
      return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
  }
}
