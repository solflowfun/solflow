'use client';

import { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Github } from 'lucide-react';

export const Footer: FC = () => {
  return (
    <footer className="border-t border-cream-400/50 mt-auto bg-cream-300/30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-8">
            <Link href="/">
              <Image 
                src="/logo.png" 
                alt="SolFlow" 
                width={32} 
                height={32}
                className="rounded-md"
              />
            </Link>
            <div className="hidden sm:flex items-center gap-6 text-sm text-charcoal-400">
              <Link href="/create" className="link-ember">
                Create
              </Link>
              <Link href="/explore" className="link-ember">
                Explore
              </Link>
              <Link href="/stats" className="link-ember">
                Stats
              </Link>
            </div>
          </div>

          {/* Social + Copyright */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <a 
                href="https://x.com/solflowdotfun" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-charcoal-400 hover:text-ember-red hover:bg-cream-300/50 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a 
                href="https://github.com/solflowfun/solflow" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-charcoal-400 hover:text-ember-red hover:bg-cream-300/50 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>
            <span className="text-sm text-charcoal-400">
              © 2026 SolFlow
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
