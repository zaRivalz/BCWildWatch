'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { Icon, type IconName } from '@/components/icons';

export interface NavLink {
  href: string;
  label: string;
  icon: IconName;
}

function isActive(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

export function NavBar({
  links,
  isAuthed,
  signOut,
}: {
  links: NavLink[];
  isAuthed: boolean;
  signOut: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const tabs = links.slice(0, 5);

  return (
    <>
      <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
        <div className="nav__inner">
          <Link href="/" className="brand" aria-label="BC WildWatch home" onClick={() => setOpen(false)}>
            <span className="brand__mark">
              <Icon.leaf size={20} sw={2} />
            </span>
            <span className="brand__txt">
              <b>BC</b> WildWatch
            </span>
          </Link>

          <nav className="nav__links">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`nav__link ${isActive(pathname, l.href) ? 'is-active' : ''}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="nav__actions">
            <ThemeToggle />
            {isAuthed && (
              <form action={signOut} className="nav__cta">
                <button type="submit" className="btn btn--ghost btn--sm">
                  Sign out
                </button>
              </form>
            )}
            <Link href="/report" className="btn btn--sm nav__cta">
              <Icon.plus size={17} sw={2.2} /> Report a Sighting
            </Link>
            <button
              type="button"
              className="icon-btn nav__burger"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <Icon.x size={20} /> : <Icon.menu size={20} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="nav__mobile">
            {links.map((l) => {
              const Glyph = Icon[l.icon];
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`nav__mlink ${isActive(pathname, l.href) ? 'is-active' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  <Glyph size={19} />
                  <span>{l.label}</span>
                  <Icon.chevR size={16} />
                </Link>
              );
            })}
            <Link href="/report" className="btn btn--block" onClick={() => setOpen(false)}>
              <Icon.plus size={17} sw={2.2} /> Report a Sighting
            </Link>
            {isAuthed && (
              <form action={signOut}>
                <button type="submit" className="btn btn--ghost btn--block">
                  Sign out
                </button>
              </form>
            )}
          </div>
        )}
      </header>

      <nav className="tabbar">
        {tabs.map((l) => {
          const Glyph = Icon[l.icon];
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`tab ${isActive(pathname, l.href) ? 'is-active' : ''}`}
            >
              <Glyph size={21} />
              <span>{l.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
