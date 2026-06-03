import { signIn, auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect('/');
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Card className="p-8 text-center space-y-4">
        <h1 className="text-2xl font-bold text-green-700 dark:text-green-400">BC WildWatch</h1>
        <p className="text-sm text-muted-foreground">Sign in with your Belgium Campus account.</p>
        <form action={async () => { 'use server'; await signIn('microsoft-entra-id', { redirectTo: '/' }); }}>
          <Button type="submit" className="w-full">Sign in with Microsoft</Button>
        </form>
      </Card>
    </div>
  );
}
