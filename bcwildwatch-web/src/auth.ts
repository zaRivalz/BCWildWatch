import NextAuth from 'next-auth';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';
import { isAllowedEmail, extractEmail } from '@/lib/authPolicy';

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
      return isAllowedEmail(extractEmail(profile));
    },
    async jwt({ token, profile }) {
      if (profile) {
        token.email = extractEmail(profile) ?? token.email;
        token.name = typeof profile.name === 'string' ? profile.name : token.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.email) session.user.email = token.email as string;
        if (token.name) session.user.name = token.name as string;
      }
      return session;
    },
  },
  pages: { signIn: '/login' },
});
