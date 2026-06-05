import { describe, it, expect } from 'vitest';
import { escapeODataString, emailFilter, mapAnimal, dataverseOrigin, mapReportRow, isGuid } from '@/lib/dataverse.helpers';

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

describe('mapReportRow', () => {
  it('maps a full row including expanded animal + reporter', () => {
    expect(mapReportRow({
      bcw_reportid: 'r1',
      bcw_location: 'Pretoria',
      bcw_addressdescription: 'Block A',
      bcw_description: 'big snake',
      createdon: '2026-06-04T10:00:00Z',
      bcw_status: 755900002,
      bcw_Animal: { bcw_name: 'Snake' },
      bcw_Reporter: { bcw_email: 'a@belgiumcampus.ac.za' },
    })).toEqual({
      id: 'r1', location: 'Pretoria', address: 'Block A', description: 'big snake',
      createdOn: '2026-06-04T10:00:00Z', status: 755900002,
      animal: 'Snake', reporter: 'a@belgiumcampus.ac.za',
    });
  });
  it('falls back when optional fields/expansions are missing', () => {
    expect(mapReportRow({ bcw_reportid: 'r2', createdon: '2026-06-04T10:00:00Z' })).toEqual({
      id: 'r2', location: '', address: '', description: '', createdOn: '2026-06-04T10:00:00Z',
      status: 755900000, animal: 'Unknown', reporter: '',
    });
  });
});

describe('isGuid', () => {
  it('accepts a canonical GUID (any case, optional braces)', () => {
    expect(isGuid('2905af9c-d99d-458b-97d4-abb40bc573d4')).toBe(true);
    expect(isGuid('2905AF9C-D99D-458B-97D4-ABB40BC573D4')).toBe(true);
    expect(isGuid('{2905af9c-d99d-458b-97d4-abb40bc573d4}')).toBe(true);
  });
  it('rejects non-GUIDs and injection attempts', () => {
    expect(isGuid("abc' or 1 eq 1")).toBe(false);
    expect(isGuid('')).toBe(false);
    expect(isGuid('123')).toBe(false);
    expect(isGuid(null)).toBe(false);
    expect(isGuid(42)).toBe(false);
  });
});
