'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Animal { id: string; name: string; }

export function ReportForm() {
  const router = useRouter();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/animals').then((r) => r.json()).then((d) => setAnimals(d.animals ?? [])).catch(() => {});
  }, []);

  function captureLocation() {
    navigator.geolocation.getCurrentPosition(
      (p) => setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => toast.error('Could not get your location.'),
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    if (coords) { form.set('latitude', String(coords.lat)); form.set('longitude', String(coords.lng)); }
    const res = await fetch('/api/reports', { method: 'POST', body: form });
    setSubmitting(false);
    if (res.ok) { toast.success('Report submitted. Thank you!'); router.push('/'); }
    else { const d = await res.json().catch(() => ({})); toast.error(d.error ?? 'Submission failed.'); }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="animalId">Animal</Label>
        <select id="animalId" name="animalId" className="w-full rounded-md border bg-background p-2">
          <option value="">Select an animal…</option>
          {animals.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          <option value="OTHER">Other / not listed</option>
        </select>
      </div>
      <div>
        <Label htmlFor="addressDescription">Location / nearest building</Label>
        <Input id="addressDescription" name="addressDescription" required />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" required />
      </div>
      <div>
        <Label htmlFor="photo">Photo (optional, max 10MB)</Label>
        <Input id="photo" name="photo" type="file" accept="image/*" />
      </div>
      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" onClick={captureLocation}>
          {coords ? '📍 Location captured' : 'Use my location'}
        </Button>
      </div>
      <Button type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit report'}</Button>
    </form>
  );
}
