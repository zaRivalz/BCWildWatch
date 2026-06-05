import Link from 'next/link';
import { Icon } from '@/components/icons';

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="wrap footer__inner">
        <div className="footer__brand">
          <Link href="/" className="brand" aria-label="BC WildWatch home">
            <span className="brand__mark">
              <Icon.leaf size={20} sw={2} />
            </span>
            <span className="brand__txt">
              <b>BC</b> WildWatch
            </span>
          </Link>
          <p>
            Campus wildlife-safety reporting for Belgium Campus. Spot it, report it, stay safe — and
            keep our campus wild.
          </p>
          <div className="footer__emergency">
            <span className="badge risk-high">
              <Icon.phone size={14} /> Emergency&nbsp;security
            </span>
            <a className="mono" href="tel:+27105935368">
              +27 10&nbsp;593&nbsp;5368
            </a>
          </div>
        </div>
        <div className="footer__cols">
          <div>
            <h5>Product</h5>
            <Link href="/report">Report a sighting</Link>
            <Link href="/safety">Safety guide</Link>
            <Link href="/map">Live map</Link>
            <Link href="/safety">AI assistant</Link>
          </div>
          <div>
            <h5>Campus</h5>
            <Link href="/admin">Security team</Link>
            <a href="tel:+27105935368">Emergency lines</a>
            <Link href="/safety">Eco committee</Link>
            <Link href="/my-reports">Report archive</Link>
          </div>
          <div>
            <h5>About</h5>
            <Link href="/">How it works</Link>
            <Link href="/safety">Privacy</Link>
            <Link href="/safety">Accessibility</Link>
            <Link href="/safety">Contact</Link>
          </div>
        </div>
      </div>
      <div className="wrap footer__bar">
        <span>© 2026 Belgium Campus · BC WildWatch</span>
        <span className="muted">A student-built campus safety initiative</span>
      </div>
    </footer>
  );
}
