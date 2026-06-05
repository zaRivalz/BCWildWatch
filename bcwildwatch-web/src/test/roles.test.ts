import { describe, it, expect } from 'vitest';
import {
  USER_ROLES,
  DEFAULT_ROLE_VALUE,
  isValidRoleValue,
  roleLabel,
  canViewAdmin,
  canEditReports,
  canDeleteReports,
} from '@/lib/roles';

describe('roles option set', () => {
  it('maps each role to its Dataverse choice value', () => {
    expect(USER_ROLES).toEqual({
      Student: 755900000,
      Lecturer: 755900001,
      Security: 755900002,
      Admin: 755900003,
    });
  });

  it('defaults to Student', () => {
    expect(DEFAULT_ROLE_VALUE).toBe(USER_ROLES.Student);
  });
});

describe('isValidRoleValue', () => {
  it('accepts known choice values only', () => {
    expect(isValidRoleValue(USER_ROLES.Admin)).toBe(true);
    expect(isValidRoleValue(755900099)).toBe(false);
    expect(isValidRoleValue('755900000')).toBe(false);
    expect(isValidRoleValue(null)).toBe(false);
    expect(isValidRoleValue(undefined)).toBe(false);
  });
});

describe('roleLabel', () => {
  it('labels known roles and falls back to Student', () => {
    expect(roleLabel(USER_ROLES.Lecturer)).toBe('Lecturer');
    expect(roleLabel(USER_ROLES.Security)).toBe('Security');
    expect(roleLabel(999)).toBe('Student');
    expect(roleLabel(null)).toBe('Student');
  });
});

describe('permission gates', () => {
  it('Student can do none of the admin actions', () => {
    expect(canViewAdmin(USER_ROLES.Student)).toBe(false);
    expect(canEditReports(USER_ROLES.Student)).toBe(false);
    expect(canDeleteReports(USER_ROLES.Student)).toBe(false);
  });

  it('Lecturer can view the admin panel only (read-only)', () => {
    expect(canViewAdmin(USER_ROLES.Lecturer)).toBe(true);
    expect(canEditReports(USER_ROLES.Lecturer)).toBe(false);
    expect(canDeleteReports(USER_ROLES.Lecturer)).toBe(false);
  });

  it('Security can view and edit but not delete', () => {
    expect(canViewAdmin(USER_ROLES.Security)).toBe(true);
    expect(canEditReports(USER_ROLES.Security)).toBe(true);
    expect(canDeleteReports(USER_ROLES.Security)).toBe(false);
  });

  it('Admin can do everything', () => {
    expect(canViewAdmin(USER_ROLES.Admin)).toBe(true);
    expect(canEditReports(USER_ROLES.Admin)).toBe(true);
    expect(canDeleteReports(USER_ROLES.Admin)).toBe(true);
  });

  it('treats null/undefined as no access', () => {
    expect(canViewAdmin(null)).toBe(false);
    expect(canEditReports(undefined)).toBe(false);
    expect(canDeleteReports(null)).toBe(false);
  });
});
