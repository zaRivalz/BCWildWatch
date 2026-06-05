import { getRecentReports } from '@/lib/dataverse';
import { AnimalToken, kindForName } from '@/components/animal-glyph';
import { RiskBadge } from '@/components/status-pill';
import { relativeTime } from '@/lib/relativeTime';
import { Icon } from '@/components/icons';

export async function RecentSightings() {
  let reports: Awaited<ReturnType<typeof getRecentReports>> = [];
  try {
    reports = await getRecentReports(4);
  } catch {
    reports = [];
  }

  if (reports.length === 0) {
    return (
      <div className="card center" style={{ padding: '48px 24px' }}>
        <span
          className="atoken"
          style={{ width: 52, height: 52, borderRadius: 16, margin: '0 auto 14px' }}
        >
          <Icon.pawAlt size={26} />
        </span>
        <p className="muted">No recent sightings yet — and that&apos;s a good thing.</p>
      </div>
    );
  }

  return (
    <div className="sightings">
      {reports.map(
        (r: { id: string; address: string; createdOn: string; animal: string }) => {
          const kind = kindForName(r.animal);
          return (
            <article key={r.id} className="sighting card rise">
              <div className="sighting__media">
                <div className="ph">
                  <span className="ph__tag">{r.animal}</span>
                </div>
                <span className="sighting__badge">
                  <RiskBadge risk={kind.risk} />
                </span>
                <span className="sighting__tok">
                  <AnimalToken name={r.animal} size={44} />
                </span>
              </div>
              <div className="sighting__body">
                <h4>{r.animal}</h4>
                <div className="sighting__meta">
                  <span className="row">
                    <Icon.pin size={14} /> {r.address}
                  </span>
                  <span className="row">
                    <Icon.clock size={14} /> {relativeTime(r.createdOn)}
                  </span>
                </div>
              </div>
            </article>
          );
        },
      )}
    </div>
  );
}
