import Link from 'next/link';
import { Icon } from '@/components/icons';

export function FeatureGrid() {
  return (
    <div className="bento">
      <Link href="/report" className="bento__cell cell-report">
        <Icon.arrow className="bento__go" size={20} />
        <span className="ico">
          <Icon.plus size={26} sw={2.2} />
        </span>
        <h3>Report a sighting</h3>
        <p>Snap a photo, drop a pin, and send it to campus security in under a minute.</p>
        <span className="btn">
          <Icon.plus size={17} sw={2.2} /> Start a report
        </span>
      </Link>

      <Link href="/map" className="bento__cell cell-map">
        <Icon.arrow className="bento__go" size={20} />
        <span className="ico">
          <Icon.map size={24} />
        </span>
        <h3>Live campus map</h3>
        <p>See where sightings happen and steer clear of active hotspots.</p>
        <div className="mini-map ph" aria-hidden />
      </Link>

      <Link href="/safety" className="bento__cell cell-safety">
        <Icon.arrow className="bento__go" size={20} />
        <span className="ico">
          <Icon.shield size={24} />
        </span>
        <h3>Safety guide</h3>
        <p>Know what to do for snakes, bees, dogs &amp; more.</p>
      </Link>

      <Link href="/safety" className="bento__cell cell-ai">
        <Icon.arrow className="bento__go" size={20} />
        <span className="ico">
          <Icon.sparkle size={24} />
        </span>
        <h3>AI assistant</h3>
        <p>Ask what to do, right now.</p>
        <Icon.sparkle className="spark" size={120} />
      </Link>
    </div>
  );
}
