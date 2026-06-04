import { describe, it, expect } from 'vitest';
import { getAssistantReply } from '@/lib/assistant';
import { SAFETY_TIPS } from '@/lib/safetyTips';

describe('getAssistantReply', () => {
  it('matches an animal mentioned in the message and returns its guidance', () => {
    const r = getAssistantReply('There is a snake near Block A');
    expect(r.kind).toBe('animal');
    expect(r.animal).toBe('Snakes');
    expect(r.whatToDo?.length).toBeGreaterThan(0);
    expect(r.avoid?.length).toBeGreaterThan(0);
  });

  it('recognises synonyms (baboon -> Monkeys / Baboons)', () => {
    expect(getAssistantReply('a baboon stole my lunch').animal).toBe('Monkeys / Baboons');
    expect(getAssistantReply('saw a wasp nest').animal).toBe('Bee / Wasp Swarm');
    expect(getAssistantReply('there is a scorpion in my shoe').animal).toBe('Spiders / Scorpions');
  });

  it('prioritises emergencies and still surfaces the animal guidance', () => {
    const r = getAssistantReply("a dog bit me and I'm bleeding");
    expect(r.kind).toBe('emergency');
    expect(r.contacts?.length).toBeGreaterThan(0);
    expect(r.animal).toBe('Stray Dogs');
  });

  it('treats a bare emergency (no animal) as an emergency', () => {
    const r = getAssistantReply('help someone is unconscious');
    expect(r.kind).toBe('emergency');
    expect(r.contacts?.length).toBeGreaterThan(0);
    expect(r.animal).toBeUndefined();
  });

  it('answers how to report a sighting', () => {
    const r = getAssistantReply('how do I report a sighting?');
    expect(r.kind).toBe('report');
    expect(r.text.toLowerCase()).toContain('report');
  });

  it('greets the user', () => {
    expect(getAssistantReply('hi there').kind).toBe('greeting');
  });

  it('falls back for unrelated questions and lists what it can help with', () => {
    const r = getAssistantReply('what is the weather tomorrow');
    expect(r.kind).toBe('fallback');
    for (const tip of SAFETY_TIPS) {
      expect(r.text).toContain(tip.animal);
    }
  });

  it('does not match substrings inside other words (e.g. "bee" in "been")', () => {
    const r = getAssistantReply('I have been studying in the library');
    expect(r.kind).not.toBe('animal');
  });

  it('handles empty input as a fallback/greeting, never throwing', () => {
    expect(() => getAssistantReply('')).not.toThrow();
  });
});
