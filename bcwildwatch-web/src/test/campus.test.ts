import { describe, it, expect } from 'vitest';
import { CAMPUSES, CAMPUS_NAMES, isCampusName, nearestCampus } from '@/lib/campus';

describe('campus', () => {
  it('exposes the three Belgium Campus locations', () => {
    expect(CAMPUS_NAMES).toEqual(['Stellenbosch', 'Kempton Park', 'Pretoria']);
  });

  it('validates known campus names only', () => {
    expect(isCampusName('Pretoria')).toBe(true);
    expect(isCampusName('Atlantis')).toBe(false);
    expect(isCampusName(null)).toBe(false);
  });

  it('returns the campus matching its own coordinates', () => {
    for (const c of CAMPUSES) {
      expect(nearestCampus(c.lat, c.lng).name).toBe(c.name);
    }
  });

  it('snaps nearby coordinates to the closest campus', () => {
    // A point just north of the Pretoria campus.
    expect(nearestCampus(-25.68, 28.13).name).toBe('Pretoria');
    // A point near Kempton Park.
    expect(nearestCampus(-26.1, 28.24).name).toBe('Kempton Park');
  });
});
