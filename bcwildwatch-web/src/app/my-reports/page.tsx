import Link from 'next/link';
import { auth } from '@/auth';
import { getMyReports } from '@/lib/dataverse';
import { PageHead } from '@/components/page-head';
import { Icon } from '@/components/icons';
import { AnimalToken, kindForName } from '@/components/animal-glyph';
import { StatusPill } from '@/components/status-pill';
import { ReportPhoto } from '@/components/report-photo';
import { relativeTime } from '@/lib/relativeTime';
import type { ReportRow } from '@/lib/dataverse.helpers';

export default async function MyReportsPage() {
  const session = await auth();
  const email = session?.user?.email;
  let reports: ReportRow[] = [];
  if (email) {
    try {
      reports = await getMyReports(email);
    } catch {
      reports = [];
    }
  }

  return (
    <div className="wrap">
      <PageHead
        eyebrow="My reports"
        icon="eye"
        title="Your sightings"
        sub="Every sighting you've filed, and where it stands with campus security."
      />

      {reports.length === 0 ? (
        <div className="card center" style={{ padding: '56px 24px' }}>
          <span
            className="atoken"
            style={{ width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px' }}
          >
            <Icon.pawAlt size={28} />
          </span>
          <h3 style={{ marginBottom: 8 }}>No reports yet</h3>
          <p className="muted" style={{ marginBottom: 22 }}>
            When you report a sighting, it&apos;ll show up here so you can track it.
          </p>
          <Link href="/report" className="btn">
            <Icon.plus size={17} sw={2.2} /> Report a sighting
          </Link>
        </div>
      ) : (
        <div className="safety-cards">
          {reports.map((r) => (
            <article key={r.id} className="card safety-card rise">
              <div className="safety-card__head">
                <span className="safety-card__tok">
                  <AnimalToken kind={kindForName(r.animal)} size={56} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3>{r.animal}</h3>
                  <StatusPill status={r.status} />
                </div>
              </div>

              <p className="trow__loc" style={{ marginBottom: 12 }}>
                <Icon.pin size={15} /> {r.address}
              </p>

              {r.description && (
                <p className="muted" style={{ fontSize: 14.5, marginBottom: 14 }}>
                  {r.description}
                </p>
              )}

              {r.mediaId && (
                <div style={{ marginBottom: 14 }}>
                  <ReportPhoto mediaId={r.mediaId} alt={`${r.animal} photo`} size={88} />
                </div>
              )}

              <time className="muted" style={{ fontSize: 13 }}>
                {relativeTime(r.createdOn)}
              </time>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
