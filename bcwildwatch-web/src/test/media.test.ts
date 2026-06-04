import { describe, it, expect } from 'vitest';
import { encodeSharingUrl, contentTypeForFilename, attachMediaToReports, type MediaRow } from '@/lib/media';
import type { ReportRow } from '@/lib/dataverse.helpers';

describe('encodeSharingUrl', () => {
  it('prefixes with "u!" and is base64url (no +, /, or = padding)', () => {
    const enc = encodeSharingUrl('https://contoso.sharepoint.com/sites/x/Documents/Media/a b.jpg');
    expect(enc.startsWith('u!')).toBe(true);
    expect(enc).not.toMatch(/[+/=]/);
  });
  it('round-trips back to the original URL when decoded', () => {
    const url = 'https://contoso.sharepoint.com/sites/x/Documents/Media/1717-photo.png?web=1';
    const enc = encodeSharingUrl(url);
    const b64 = enc.slice(2).replace(/-/g, '+').replace(/_/g, '/');
    const decoded = Buffer.from(b64, 'base64').toString('utf-8');
    expect(decoded).toBe(url);
  });
});

describe('contentTypeForFilename', () => {
  it('maps common image extensions (case-insensitive)', () => {
    expect(contentTypeForFilename('a.jpg')).toBe('image/jpeg');
    expect(contentTypeForFilename('a.JPEG')).toBe('image/jpeg');
    expect(contentTypeForFilename('a.png')).toBe('image/png');
    expect(contentTypeForFilename('a.webp')).toBe('image/webp');
    expect(contentTypeForFilename('a.gif')).toBe('image/gif');
    expect(contentTypeForFilename('photo.2024.HEIC')).toBe('image/heic');
  });
  it('falls back to octet-stream for unknown/empty', () => {
    expect(contentTypeForFilename('a.txt')).toBe('application/octet-stream');
    expect(contentTypeForFilename('noext')).toBe('application/octet-stream');
    expect(contentTypeForFilename(undefined)).toBe('application/octet-stream');
    expect(contentTypeForFilename(null)).toBe('application/octet-stream');
  });
});

describe('attachMediaToReports', () => {
  const base: ReportRow = {
    id: 'r1', address: 'A', description: '', createdOn: '2026-06-04T10:00:00Z',
    status: 755900000, animal: 'Snake', reporter: 'a@b.com',
  };
  const reports: ReportRow[] = [base, { ...base, id: 'r2' }, { ...base, id: 'r3' }];

  it('attaches the first media id + filename to the matching report', () => {
    const media: MediaRow[] = [
      { mediaId: 'm1', reportId: 'r2', filename: 'snake.jpg' },
    ];
    const out = attachMediaToReports(reports, media);
    expect(out.find((r) => r.id === 'r2')?.mediaId).toBe('m1');
    expect(out.find((r) => r.id === 'r2')?.mediaFilename).toBe('snake.jpg');
  });
  it('leaves reports without media untouched (mediaId undefined)', () => {
    const out = attachMediaToReports(reports, []);
    expect(out.every((r) => r.mediaId === undefined)).toBe(true);
  });
  it('keeps the first media when a report has several', () => {
    const media: MediaRow[] = [
      { mediaId: 'm1', reportId: 'r1', filename: 'first.jpg' },
      { mediaId: 'm2', reportId: 'r1', filename: 'second.jpg' },
    ];
    const out = attachMediaToReports(reports, media);
    expect(out.find((r) => r.id === 'r1')?.mediaId).toBe('m1');
  });
  it('does not mutate the input reports', () => {
    const media: MediaRow[] = [{ mediaId: 'm1', reportId: 'r1', filename: 'x.jpg' }];
    attachMediaToReports(reports, media);
    expect(reports[0].mediaId).toBeUndefined();
  });
});
