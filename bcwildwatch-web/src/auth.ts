import NextAuth from 'next-auth';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';
import { isAllowedEmail } from '@/lib/authPolicy';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
      issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER!,
      authorization: { params: { domain_hint: 'belgiumcampus.ac.za' } },
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      const email = (profile?.email ?? (profile as { preferred_username?: string })?.preferred_username) as string | undefined;
      return isAllowedEmail(email);
    },
    async jwt({ token, profile }) {
      if (profile) {
        token.email = (profile.email ?? (profile as { preferred_username?: string }).preferred_username) as string;
        token.name = profile.name as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  pages: { signIn: '/login' },
});
