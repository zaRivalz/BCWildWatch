import Link from 'next/link';
import { auth, signOut } from '@/auth';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { isAdmin } from '@/lib/authPolicy';

export async function Nav() {
  const session = await auth();
  const admin = isAdmin(session?.user?.email);
  return (
    <header className="flex items-center justify-between border-b px-6 py-3">
      <Link href="/" className="font-bold text-green-700 dark:text-green-400">BC WildWatch</Link>
      <nav className="flex items-center gap-4 text-sm">
        <Link href="/report">Report</Link>
        <Link href="/map">Live Map</Link>
        {session?.user && <Link href="/my-reports">My Reports</Link>}
        {admin && <Link href="/admin">Admin</Link>}
        <ThemeToggle />
        {session?.user && (
          <form action={async () => { 'use server'; await signOut({ redirectTo: '/login' }); }}>
            <Button variant="outline" size="sm">Sign out</Button>
          </form>
        )}
      </nav>
    </header>
  );
}
