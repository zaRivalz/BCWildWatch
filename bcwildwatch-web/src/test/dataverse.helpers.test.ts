import { describe, it, expect } from 'vitest';
import { escapeODataString, emailFilter, mapAnimal } from '@/lib/dataverse.helpers';

describe('dataverse helpers', () => {
  it('escapes single quotes for OData', () => {
    expect(escapeODataString("O'Brien")).toBe("O''Brien");
  });
  it('builds an encoded email filter', () => {
    const f = emailFilter("a'b@x.com");
    expect(f).toContain("bcw_email eq 'a''b@x.com'");
  });
  it('maps a raw animal row to {id,name}', () => {
    expect(mapAnimal({ bcw_animalid: '1', bcw_name: 'Snake' })).toEqual({ id: '1', name: 'Snake' });
  });
});
