import type { Metadata } from 'next';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Toaster } from '@/components/ui/toaster';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

// For display font, using Space Grotesk with heavier weights
const clashDisplay = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-clash-display',
  weight: ['500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'SolFlow | MemeLock - Token Locking & Vesting on Solana',
  description: 'Lock and vest tokens with yield boost. The premier token locking platform for Solana memecoins.',
  keywords: ['solana', 'token lock', 'vesting', 'memecoin', 'defi', 'yield'],
  openGraph: {
    title: 'SolFlow | MemeLock',
    description: 'Lock and vest tokens with yield boost on Solana',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body 
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${clashDisplay.variable} font-sans antialiased`}
      >
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
