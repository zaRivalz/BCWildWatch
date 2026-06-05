import { signIn, auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Icon } from '@/components/icons';

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect('/');

  return (
    <div
      className="wrap"
      style={{
        position: 'relative',
        minHeight: '70vh',
        display: 'grid',
        placeItems: 'center',
        padding: '40px 0',
      }}
    >
      <div className="aurora" aria-hidden>
        <b className="a1" />
        <b className="a2" />
        <b className="a3" />
      </div>

      <div
        className="card rise"
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 420,
          padding: 36,
          textAlign: 'center',
        }}
      >
        <span
          className="brand__mark"
          style={{ width: 56, height: 56, borderRadius: 18, margin: '0 auto 18px' }}
        >
          <Icon.leaf size={28} sw={2} />
        </span>
        <h1 style={{ fontSize: 28 }}>
          <b>BC</b> WildWatch
        </h1>
        <p className="muted" style={{ margin: '12px auto 28px', maxWidth: '34ch' }}>
          Sign in with your Belgium Campus account to report and track campus wildlife
          sightings.
        </p>

        <form
          action={async () => {
            'use server';
            await signIn('microsoft-entra-id', { redirectTo: '/' });
          }}
        >
          <button type="submit" className="btn btn--lg btn--block">
            <Icon.shield size={18} /> Sign in with Microsoft
          </button>
        </form>

        <p className="form__note" style={{ marginTop: 18 }}>
          <Icon.shield size={14} /> Secured by Microsoft Entra ID
        </p>
      </div>
    </div>
  );
}
