import { describe, it, expect } from 'vitest';
import { ANIMAL_PRIORITY, isValidPriorityValue, priorityTone } from '@/lib/animalPriority';

describe('animal priority option set', () => {
  it('maps each level to its Dataverse choice value', () => {
    expect(ANIMAL_PRIORITY).toEqual({ Low: 755900000, Medium: 755900001, High: 755900002 });
  });
});

describe('isValidPriorityValue', () => {
  it('accepts known choice values only', () => {
    expect(isValidPriorityValue(ANIMAL_PRIORITY.Medium)).toBe(true);
    expect(isValidPriorityValue(755900099)).toBe(false);
    expect(isValidPriorityValue('755900000')).toBe(false);
    expect(isValidPriorityValue(null)).toBe(false);
    expect(isValidPriorityValue(undefined)).toBe(false);
  });
});

describe('priorityTone', () => {
  it('maps choice values to UI risk tones', () => {
    expect(priorityTone(ANIMAL_PRIORITY.Low)).toBe('low');
    expect(priorityTone(ANIMAL_PRIORITY.Medium)).toBe('medium');
    expect(priorityTone(ANIMAL_PRIORITY.High)).toBe('high');
  });
  it('returns null for unset/unknown values', () => {
    expect(priorityTone(null)).toBeNull();
    expect(priorityTone(undefined)).toBeNull();
    expect(priorityTone(123)).toBeNull();
  });
});
