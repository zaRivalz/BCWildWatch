// Belgium Campus locations. A report's campus is either chosen by the reporter
// or derived from their captured GPS position via `nearestCampus`.

export interface Campus {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export const CAMPUSES: Campus[] = [
  { id: 'stellenbosch', name: 'Stellenbosch', lat: -33.938406558164, lng: 18.84690458516358 },
  { id: 'kempton-park', name: 'Kempton Park', lat: -26.105869725444393, lng: 28.238126369826194 },
  { id: 'pretoria', name: 'Pretoria', lat: -25.683069744256084, lng: 28.131176554471313 },
];

export const CAMPUS_NAMES = CAMPUSES.map((c) => c.name);

export function isCampusName(value: unknown): value is string {
  return typeof value === 'string' && CAMPUS_NAMES.includes(value);
}

/** Great-circle distance in kilometres between two lat/lng points. */
function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Returns the closest campus to the given coordinates. */
export function nearestCampus(lat: number, lng: number): Campus {
  return CAMPUSES.reduce((best, c) =>
    haversineKm(lat, lng, c.lat, c.lng) < haversineKm(lat, lng, best.lat, best.lng) ? c : best,
  );
}
