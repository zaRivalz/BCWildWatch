import { describe, it, expect } from 'vitest';
import { SAFETY_TIPS, EMERGENCY_CONTACTS, DANGER_LEVELS, dangerBadgeClass } from '@/lib/safetyTips';

describe('safetyTips', () => {
  it('provides at least one tip and emergency contact', () => {
    expect(SAFETY_TIPS.length).toBeGreaterThan(0);
    expect(EMERGENCY_CONTACTS.length).toBeGreaterThan(0);
  });
  it('every tip is complete and uses a valid danger level', () => {
    for (const tip of SAFETY_TIPS) {
      expect(tip.animal.length).toBeGreaterThan(0);
      expect(tip.emoji.length).toBeGreaterThan(0);
      expect(DANGER_LEVELS).toContain(tip.danger);
      expect(tip.whatToDo.length).toBeGreaterThan(0);
      expect(tip.avoid.length).toBeGreaterThan(0);
    }
  });
  it('has unique animal names', () => {
    const names = SAFETY_TIPS.map((t) => t.animal);
    expect(new Set(names).size).toBe(names.length);
  });
  it('returns a non-empty badge class for each danger level', () => {
    for (const level of DANGER_LEVELS) {
      expect(dangerBadgeClass(level).length).toBeGreaterThan(0);
    }
  });
});
