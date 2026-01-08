import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

export const metadata: Metadata = {
  title: 'Solflow | Token Locks & Vesting for Solana',
  description: 'Lock. Vest. Prove. Solana-only token locks and vesting made for memecoins, with public proof pages and optional Yield Boost.',
  keywords: ['Solana', 'token lock', 'vesting', 'memecoin', 'yield boost', 'proof page'],
  openGraph: {
    title: 'Solflow | Token Locks & Vesting for Solana',
    description: 'Lock. Vest. Prove. Solana-only token locks and vesting made for memecoins.',
    url: 'https://solflow.fun',
    siteName: 'Solflow',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solflow | Token Locks & Vesting for Solana',
    description: 'Lock. Vest. Prove. Solana-only token locks and vesting made for memecoins.',
    creator: '@solflowdotfun',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-1 pt-16">
              {children}
            </div>
            <Footer />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
