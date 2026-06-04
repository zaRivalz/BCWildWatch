export const REPORT_STATUSES = ['New', 'Investigating', 'Resolved'] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];
export const DEFAULT_STATUS: ReportStatus = 'New';

export function isValidStatus(s: unknown): s is ReportStatus {
  return typeof s === 'string' && (REPORT_STATUSES as readonly string[]).includes(s);
}

export function normalizeStatus(s: string | null | undefined): ReportStatus {
  return isValidStatus(s) ? s : DEFAULT_STATUS;
}

export function statusBadgeClass(s: ReportStatus): string {
  switch (s) {
    case 'New': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
    case 'Investigating': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
    case 'Resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
  }
}
