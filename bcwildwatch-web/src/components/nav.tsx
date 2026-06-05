import { auth, signOut } from '@/auth';
import { getEffectiveRole } from '@/lib/dataverse';
import { canViewAdmin } from '@/lib/roles';
import { NavBar, type NavLink } from '@/components/nav-bar';

export async function Nav() {
  const session = await auth();
  const authed = Boolean(session?.user);
  const role = await getEffectiveRole(session?.user?.email);
  const showAdmin = canViewAdmin(role);

  const links: NavLink[] = [
    { href: '/', label: 'Home', icon: 'home' },
    { href: '/report', label: 'Report', icon: 'pin' },
    { href: '/map', label: 'Live Map', icon: 'map' },
    { href: '/safety', label: 'Safety', icon: 'shield' },
  ];
  if (authed) links.push({ href: '/my-reports', label: 'My Reports', icon: 'eye' });
  if (showAdmin) links.push({ href: '/admin', label: 'Admin', icon: 'grid' });

  async function handleSignOut() {
    'use server';
    await signOut({ redirectTo: '/login' });
  }

  return <NavBar links={links} isAuthed={authed} signOut={handleSignOut} />;
}
