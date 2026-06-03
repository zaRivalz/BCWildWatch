import { describe, it, expect } from 'vitest';
import { isDangerous } from '@/lib/dangerousAnimals';

describe('isDangerous', () => {
  it('flags snakes', () => { expect(isDangerous('Cape Cobra (Snake)')).toBe(true); });
  it('flags bees', () => { expect(isDangerous('Bee swarm')).toBe(true); });
  it('does not flag a cat', () => { expect(isDangerous('Cat')).toBe(false); });
});
