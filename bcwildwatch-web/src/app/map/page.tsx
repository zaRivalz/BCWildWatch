import { PageHead } from '@/components/page-head';
import { Icon } from '@/components/icons';

export default function MapPage() {
  const url = process.env.POWERBI_MAP_URL;
  return (
    <div className="wrap">
      <PageHead
        eyebrow="Live map"
        icon="map"
        title="Live sightings map"
        sub="See where animals have been spotted across campus, updated as reports come in."
      />

      {url ? (
        <div className="card" style={{ overflow: 'hidden' }}>
          <iframe
            title="BC WildWatch Map"
            src={url}
            style={{ width: '100%', height: '70vh', border: 'none', display: 'block' }}
            allowFullScreen
          />
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden', position: 'relative' }}>
          <div
            className="ph"
            style={{ height: '60vh', alignItems: 'center', justifyContent: 'center' }}
          >
            <span className="ph__tag" style={{ margin: 0 }}>
              campus-map.live
            </span>
          </div>
          <div
            className="tempty"
            style={{
              position: 'absolute',
              inset: 0,
              justifyContent: 'center',
              background: 'color-mix(in srgb, var(--surface) 55%, transparent)',
            }}
          >
            <span className="atoken" style={{ width: 56, height: 56, borderRadius: 16 }}>
              <Icon.map size={28} />
            </span>
            <b>Map coming online</b>
            <span className="muted">The live campus map isn&apos;t configured yet.</span>
          </div>
        </div>
      )}
    </div>
  );
}
