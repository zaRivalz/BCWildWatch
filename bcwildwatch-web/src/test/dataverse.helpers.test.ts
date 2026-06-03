import { describe, it, expect } from 'vitest';
import { escapeODataString, emailFilter, mapAnimal, dataverseOrigin } from '@/lib/dataverse.helpers';

describe('dataverse helpers', () => {
  it('escapes single quotes for OData', () => {
    expect(escapeODataString("O'Brien")).toBe("O''Brien");
  });
  it('derives the origin from a full Web API URL', () => {
    expect(dataverseOrigin('https://bcwildwatch.api.crm14.dynamics.com/api/data/v9.2')).toBe('https://bcwildwatch.api.crm14.dynamics.com');
  });
  it('derives the origin from a bare base URL', () => {
    expect(dataverseOrigin('https://bcwildwatch.api.crm14.dynamics.com/')).toBe('https://bcwildwatch.api.crm14.dynamics.com');
  });
  it('builds an encoded email filter', () => {
    const f = emailFilter("a'b@x.com");
    expect(f).toContain("bcw_email eq 'a''b@x.com'");
  });
  it('maps a raw animal row to {id,name}', () => {
    expect(mapAnimal({ bcw_animalid: '1', bcw_name: 'Snake' })).toEqual({ id: '1', name: 'Snake' });
  });
});
