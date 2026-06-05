// Mirrors the `bcw_role` Choice (option set) on the bcw_user table in Dataverse.
// Permissions are derived from the role, not from the user's email.
export const USER_ROLES = {
  Student: 755900000,
  Lecturer: 755900001,
  Security: 755900002,
  Admin: 755900003,
} as const;

export type RoleValue = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const DEFAULT_ROLE_VALUE: RoleValue = USER_ROLES.Student;

const ROLE_LABELS: Record<RoleValue, string> = {
  [USER_ROLES.Student]: 'Student',
  [USER_ROLES.Lecturer]: 'Lecturer',
  [USER_ROLES.Security]: 'Security',
  [USER_ROLES.Admin]: 'Admin',
};

export function isValidRoleValue(v: unknown): v is RoleValue {
  return typeof v === 'number' && v in ROLE_LABELS;
}

export function roleLabel(v: number | null | undefined): string {
  return isValidRoleValue(v) ? ROLE_LABELS[v] : 'Student';
}

// Permission gates. Lecturer can view the admin panel (read-only); Security can
// also change report status; Admin can additionally delete reports.
const CAN_VIEW_ADMIN = new Set<number>([USER_ROLES.Lecturer, USER_ROLES.Security, USER_ROLES.Admin]);
const CAN_EDIT_REPORTS = new Set<number>([USER_ROLES.Security, USER_ROLES.Admin]);
const CAN_DELETE_REPORTS = new Set<number>([USER_ROLES.Admin]);

export function canViewAdmin(role: number | null | undefined): boolean {
  return role != null && CAN_VIEW_ADMIN.has(role);
}
export function canEditReports(role: number | null | undefined): boolean {
  return role != null && CAN_EDIT_REPORTS.has(role);
}
export function canDeleteReports(role: number | null | undefined): boolean {
  return role != null && CAN_DELETE_REPORTS.has(role);
}
