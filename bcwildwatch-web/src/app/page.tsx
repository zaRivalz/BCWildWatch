import Link from 'next/link';
import { Hero } from '@/components/hero';
import { FeatureGrid } from '@/components/feature-grid';
import { RecentSightings } from '@/components/recent-sightings';
import { Icon } from '@/components/icons';

const STATS = [
  { num: '< 1', unit: 'min', label: 'To file a report' },
  { num: '6', unit: 'min', label: 'Avg. security response' },
  { num: '5', unit: '', label: 'Tracked species' },
  { num: '24/7', unit: '', label: 'Campus coverage' },
];

export default function Home() {
  return (
    <>
      <Hero />

      <section className="wrap" style={{ marginBottom: 90 }}>
        <div className="stats">
          {STATS.map((s) => (
            <div key={s.label} className="stat">
              <div className="stat__num">
                {s.num}
                {s.unit && <span className="u">{s.unit}</span>}
              </div>
              <div className="stat__lbl">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap" style={{ marginBottom: 90 }}>
        <div className="sec-head">
          <div>
            <div className="eyebrow">
              <Icon.pin size={15} /> From across campus
            </div>
            <h2>Recent sightings</h2>
            <p>The latest reports logged by students and staff.</p>
          </div>
          <Link href="/map" className="link-more">
            View live map <Icon.arrow size={16} />
          </Link>
        </div>
        <RecentSightings />
      </section>

      <section className="wrap" style={{ marginBottom: 90 }}>
        <div className="sec-head">
          <div>
            <div className="eyebrow">
              <Icon.sparkle size={15} /> Everything in one place
            </div>
            <h2>Built for a safer campus</h2>
            <p>From the first sighting to a safe resolution.</p>
          </div>
        </div>
        <FeatureGrid />
      </section>

      <section className="wrap" style={{ marginBottom: 90 }}>
        <div className="cta-band">
          <div className="aurora" aria-hidden>
            <b className="a1" />
            <b className="a2" />
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2>See something? Report it.</h2>
            <p>
              Every report helps keep students, staff, and campus wildlife safe. It only
              takes a minute.
            </p>
            <Link href="/report" className="btn btn--lg">
              <Icon.plus size={19} sw={2.2} /> Report a Sighting
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
