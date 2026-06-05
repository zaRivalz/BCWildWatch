'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/icons';

export function AdminDeleteButton({ reportId, animal }: { reportId: string; animal: string }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function onDelete() {
    setBusy(true);
    setError(false);
    const res = await fetch('/api/admin/reports', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId }),
    });
    if (!res.ok) {
      setBusy(false);
      setError(true);
      return;
    }
    setConfirming(false);
    startTransition(() => router.refresh());
  }

  if (!confirming) {
    return (
      <button type="button" className="btn btn--danger btn--sm" onClick={() => setConfirming(true)}>
        <Icon.alert size={15} /> Delete report
      </button>
    );
  }

  return (
    <div className="delete-confirm">
      <span className="delete-confirm__q">Delete this {animal} report permanently?</span>
      <div className="delete-confirm__row">
        <button type="button" className="btn btn--danger btn--sm" onClick={onDelete} disabled={busy || pending}>
          {busy || pending ? 'Deleting…' : 'Yes, delete'}
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => {
            setConfirming(false);
            setError(false);
          }}
          disabled={busy || pending}
        >
          <Icon.x size={15} /> Cancel
        </button>
      </div>
      {error && <span className="delete-confirm__err">Couldn’t delete. Please try again.</span>}
    </div>
  );
}
