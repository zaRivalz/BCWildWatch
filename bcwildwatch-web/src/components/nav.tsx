import { auth, signOut } from '@/auth';
import { isAdmin } from '@/lib/authPolicy';
import { NavBar, type NavLink } from '@/components/nav-bar';

export async function Nav() {
  const session = await auth();
  const admin = isAdmin(session?.user?.email);
  const authed = Boolean(session?.user);

  const links: NavLink[] = [
    { href: '/', label: 'Home', icon: 'home' },
    { href: '/report', label: 'Report', icon: 'pin' },
    { href: '/map', label: 'Live Map', icon: 'map' },
    { href: '/safety', label: 'Safety', icon: 'shield' },
  ];
  if (authed) links.push({ href: '/my-reports', label: 'My Reports', icon: 'eye' });
  if (admin) links.push({ href: '/admin', label: 'Admin', icon: 'grid' });

  async function handleSignOut() {
    'use server';
    await signOut({ redirectTo: '/login' });
  }

  return <NavBar links={links} isAuthed={authed} signOut={handleSignOut} />;
}
