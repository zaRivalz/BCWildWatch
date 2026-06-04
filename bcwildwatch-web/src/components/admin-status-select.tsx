'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { REPORT_STATUS_OPTIONS } from '@/lib/reportStatus';

export function AdminStatusSelect({ reportId, status }: { reportId: string; status: number }) {
  const [value, setValue] = useState<number>(status);
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = Number(e.target.value);
    const prev = value;
    setValue(next);
    setError(false);
    const res = await fetch('/api/admin/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId, status: next }),
    });
    if (!res.ok) {
      setValue(prev);
      setError(true);
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <select
      value={value}
      onChange={onChange}
      disabled={pending}
      aria-invalid={error}
      className="rounded-md border bg-background px-2 py-1 text-sm aria-[invalid=true]:border-red-500"
    >
      {REPORT_STATUS_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
