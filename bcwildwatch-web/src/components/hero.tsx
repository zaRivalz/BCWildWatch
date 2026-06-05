import Link from 'next/link';
import { Icon } from '@/components/icons';

export function Hero() {
  return (
    <section className="hero">
      <div className="aurora" aria-hidden>
        <b className="a1" />
        <b className="a2" />
        <b className="a3" />
      </div>

      <div className="wrap">
        <div className="hero__grid">
          <div className="rise">
            <span className="hero__chip">
              <span className="pulse" />
              Campus wildlife safety, live
            </span>

            <h1>
              Keep campus <span className="accent">safe</span> &amp;{' '}
              <span className="wild">wild</span>
            </h1>

            <p className="hero__sub">
              Spotted a snake, a swarm of bees, or a stray dog on campus? Report it in
              seconds so security can respond — and everyone stays safe.
            </p>

            <div className="hero__cta">
              <Link href="/report" className="btn btn--lg">
                <Icon.plus size={19} sw={2.2} /> Report a Sighting
              </Link>
              <Link href="/safety" className="btn btn--ghost btn--lg">
                <Icon.shield size={18} /> Safety guide
              </Link>
            </div>

            <div className="hero__trust">
              <div className="hero__avatars" aria-hidden>
                <span />
                <span />
                <span />
                <span />
              </div>
              Trusted by students &amp; security across Belgium Campus
            </div>
          </div>

          <div className="hero__visual rise">
            <div className="hero__map card">
              <div className="ph">
                <span className="ph__tag">campus-map.live</span>
              </div>
              <div className="hero__overlay card">
                <span className="badge risk-high">
                  <span className="dot" /> Snake
                </span>
                <div className="meta">
                  <b>Building 4 — courtyard</b>
                  <span>Reported 4 min ago</span>
                </div>
              </div>
            </div>
            <div className="hero__float card">
              <span className="ico">
                <Icon.flash size={18} />
              </span>
              <div>
                <b>Security notified</b>
                <span>Average response 6 min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
