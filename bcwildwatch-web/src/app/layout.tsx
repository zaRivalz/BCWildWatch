import type { Metadata } from 'next';
import { Lexend, Source_Sans_3 } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Nav } from '@/components/nav';
import { SiteFooter } from '@/components/site-footer';
import { Toaster } from '@/components/ui/sonner';

const lexend = Lexend({
  variable: '--font-lexend',
  subsets: ['latin'],
  display: 'swap',
});

const sourceSans = Source_Sans_3({
  variable: '--font-source-sans',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BC WildWatch — Campus Animal Safety',
  description: 'Spot it. Report it. Keep campus safe. Report dangerous or nuisance wildlife at Belgium Campus.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${lexend.variable} ${sourceSans.variable} h-full antialiased`}
    >
      <body>
        <ThemeProvider>
          <div className="app">
            <Nav />
            <main className="app__main">{children}</main>
            <SiteFooter />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
