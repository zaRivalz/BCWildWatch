'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Icon } from '@/components/icons';
import { AnimalToken, kindForName, type RiskTone } from '@/components/animal-glyph';
import { nearestCampus } from '@/lib/campus';

interface Animal {
  id: string;
  name: string;
  priority?: RiskTone | null;
}

const RISK_SEG: { tone: RiskTone; label: string }[] = [
  { tone: 'low', label: 'Low' },
  { tone: 'medium', label: 'Medium' },
  { tone: 'high', label: 'High' },
];

export function ReportForm() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [animalId, setAnimalId] = useState<string>('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [geoDenied, setGeoDenied] = useState(false);
  const [campus, setCampus] = useState<string>('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ reportId: string; animal: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/animals')
      .then((r) => r.json())
      .then((d) => setAnimals(d.animals ?? []))
      .catch(() => {});
  }, []);

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  const selected = animals.find((a) => a.id === animalId);
  const selectedName = selected?.name ?? '';
  // Prefer the level set in Dataverse (bcw_priority); fall back to the built-in
  // mapping until every animal has a priority assigned.
  const selectedRisk: RiskTone =
    selected?.priority ?? (selectedName ? kindForName(selectedName).risk : 'low');

  function captureLocation(opts?: { silent?: boolean }) {
    if (!('geolocation' in navigator)) {
      setGeoDenied(true);
      if (!opts?.silent) toast.error('Location is not available on this device.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setCoords({ lat: p.coords.latitude, lng: p.coords.longitude });
        const detected = nearestCampus(p.coords.latitude, p.coords.longitude);
        setCampus(detected.name);
        setGeoDenied(false);
        setLocating(false);
        toast.success(`Location captured — ${detected.name} campus.`);
      },
      () => {
        setLocating(false);
        setGeoDenied(true);
        if (!opts?.silent) toast.error('Could not get your location.');
      },
    );
  }

  // GPS is mandatory — request it as soon as the form loads so the campus can be
  // auto-detected from the user's coordinates (they cannot pick it manually).
  // Deferred a tick so the initial setState happens outside the effect body.
  useEffect(() => {
    const t = setTimeout(() => captureLocation({ silent: true }), 0);
    return () => clearTimeout(t);
  }, []);

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (f && f.size > 10 * 1024 * 1024) {
      toast.error('File too large (max 10MB).');
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setPhoto(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  function clearPhoto() {
    if (preview) URL.revokeObjectURL(preview);
    setPhoto(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!coords) {
      toast.error('Your GPS location is required to submit a report.');
      captureLocation();
      return;
    }
    if (!campus) {
      toast.error('We could not detect your campus. Please try locating again.');
      captureLocation();
      return;
    }
    if (!address.trim() || !description.trim()) {
      toast.error('Please add a location and description.');
      return;
    }
    setSubmitting(true);
    const form = new FormData();
    if (animalId) form.set('animalId', animalId);
    form.set('campus', campus);
    form.set('addressDescription', address);
    form.set('description', description);
    form.set('latitude', String(coords.lat));
    form.set('longitude', String(coords.lng));
    if (photo) form.set('photo', photo);

    const res = await fetch('/api/reports', { method: 'POST', body: form });
    setSubmitting(false);
    if (res.ok) {
      const d = await res.json().catch(() => ({}));
      toast.success('Report submitted. Thank you!');
      setSuccess({ reportId: d.reportId ?? '—', animal: selectedName || 'Unspecified' });
    } else {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error ?? 'Submission failed.');
    }
  }

  if (success) {
    return (
      <div className="card success">
        <div className="success__ring">
          <Icon.check size={40} sw={2.4} />
        </div>
        <h2>Report received</h2>
        <p>
          Thanks for keeping campus safe. Security has been notified and will review your
          report shortly.
        </p>
        <div className="success__ticket">
          <div>
            <span>Reference</span>
            <b className="mono">{success.reportId.slice(0, 8).toUpperCase()}</b>
          </div>
          <div>
            <span>Animal</span>
            <b>{success.animal}</b>
          </div>
        </div>
        <div className="success__actions">
          <Link href="/my-reports" className="btn">
            <Icon.eye size={17} /> View my reports
          </Link>
          <Link href="/map" className="btn btn--ghost">
            <Icon.map size={17} /> Live map
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="card form" onSubmit={onSubmit}>
      {/* Animal */}
      <div className="fblock">
        <div className="flabel">
          <span className="flabel__n">1</span>
          <span className="flabel__t">What did you see?</span>
          <span className="flabel__hint">Required</span>
        </div>
        <div className="animal-grid">
          {animals.map((a) => {
            const kind = kindForName(a.name);
            const sel = animalId === a.id;
            return (
              <button
                key={a.id}
                type="button"
                className={`animal-pick${sel ? ' is-sel' : ''}`}
                style={{ ['--ah' as string]: kind.hue }}
                onClick={() => setAnimalId(a.id)}
                aria-pressed={sel}
              >
                {sel && (
                  <span className="animal-pick__check">
                    <Icon.check size={12} sw={2.6} />
                  </span>
                )}
                <AnimalToken kind={kind} size={50} />
                <span className="animal-pick__lbl">{a.name}</span>
              </button>
            );
          })}
        </div>

        <div className="risk-select">
          <span className="risk-select__lbl">Typical risk level</span>
          <div className="seg" role="group" aria-label="Risk level">
            {RISK_SEG.map((r) => (
              <span
                key={r.tone}
                className={`seg__btn seg--${r.tone}${
                  selectedName && selectedRisk === r.tone ? ' is-on' : ''
                }`}
              >
                {r.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Location — GPS only, campus auto-detected (no manual choice) */}
      <div className="fblock">
        <div className="flabel">
          <span className="flabel__n">2</span>
          <span className="flabel__t">Your location</span>
          <span className="flabel__hint">Required</span>
        </div>

        {coords ? (
          <div className="geo-detected">
            <span className="geo-detected__ico">
              <Icon.pin size={18} />
            </span>
            <div className="geo-detected__body">
              <b>{campus} campus</b>
              <span className="muted">
                Auto-detected from your location · {coords.lat.toFixed(4)},{' '}
                {coords.lng.toFixed(4)}
              </span>
            </div>
            <span className="chip is-on">
              <Icon.check size={13} sw={2.4} /> Located
            </span>
          </div>
        ) : (
          <div className="geo-prompt">
            <p className="muted">
              {geoDenied
                ? 'We need your location to detect your campus. Please allow location access in your browser, then tap below.'
                : 'Detecting your campus from your location…'}
            </p>
            <button
              type="button"
              className="chip chip--gps"
              onClick={() => captureLocation()}
              disabled={locating}
            >
              <Icon.pin size={14} />
              {locating ? 'Locating…' : 'Use my location'}
            </button>
          </div>
        )}
      </div>

      {/* Address */}
      <div className="fblock">
        <div className="flabel">
          <span className="flabel__n">3</span>
          <span className="flabel__t">Where exactly?</span>
          <span className="flabel__hint">Required</span>
        </div>
        <div className="finput-wrap">
          <span className="finput-ico">
            <Icon.pin size={18} />
          </span>
          <input
            className="finput has-ico"
            placeholder="e.g. Behind Building 4, near the parking"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Description */}
      <div className="fblock">
        <div className="flabel">
          <span className="flabel__n">4</span>
          <span className="flabel__t">Describe it</span>
          <span className="flabel__hint">Required</span>
        </div>
        <textarea
          className="finput ftext"
          placeholder="What did you see? Size, colour, behaviour, how many…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      {/* Photo */}
      <div className="fblock">
        <div className="flabel">
          <span className="flabel__n">5</span>
          <span className="flabel__t">Add a photo</span>
          <span className="flabel__hint">Optional</span>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={onPickFile}
        />
        {preview ? (
          <div className="dropzone has-photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="dropzone__preview" src={preview} alt="Selected preview" />
            <button type="button" className="dropzone__remove" onClick={clearPhoto}>
              <Icon.x size={15} /> Remove photo
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="dropzone"
            onClick={() => fileRef.current?.click()}
          >
            <span className="dropzone__ico">
              <Icon.upload size={24} />
            </span>
            <b>Tap to add a photo</b>
            <span className="muted">JPG or PNG, up to 10MB</span>
          </button>
        )}
      </div>

      {/* Submit */}
      <div className="form__submit">
        <button
          type="submit"
          className={`btn btn--lg btn--block${submitting ? ' is-wait' : ''}`}
          disabled={submitting || !coords}
        >
          {submitting ? (
            <>
              <Icon.clock size={18} /> Submitting…
            </>
          ) : (
            <>
              <Icon.send size={18} /> Submit report
            </>
          )}
        </button>
        <p className="form__note">
          <Icon.shield size={14} /> Sent securely to campus security
        </p>
      </div>
    </form>
  );
}
