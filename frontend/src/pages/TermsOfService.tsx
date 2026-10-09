import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { SEO } from '../components/common/SEO';

export const TermsOfService: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 min-h-screen text-slate-300 space-y-8 text-xs sm:text-sm leading-relaxed">
      <SEO title="Terms of Service" description="Terms of service and legal agreement governing the CineVault platform." />

      <div className="border-b border-cinema-border/50 pb-6 space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
          <ShieldCheck className="w-4 h-4" /> Legal User Agreement
        </div>
        <h1 className="text-3xl font-black text-white">Terms of Service</h1>
        <p className="text-slate-400 text-xs">Last Updated: September 2026</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-white">1. Acceptance of Terms</h2>
        <p>
          By creating an account, browsing, or streaming content on CineVault ("the Platform"), you acknowledge and agree to be bound by these Terms of Service. If you do not agree, you must discontinue use immediately.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-white">2. Permitted Use & Copyright Compliance</h2>
        <p>
          CineVault is dedicated exclusively to public-domain film preservation and authorized, licensed streaming. Users agree:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
          <li>Not to attempt unauthorized scraping, bulk ripping, or redistribution of streaming assets.</li>
          <li>Not to submit reviews containing defamatory, abusive, infringing, or illegal material.</li>
          <li>Not to circumvent security mechanisms, rate limiters, or administrative authentication controls.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-white">3. Public Domain Content</h2>
        <p>
          Movies categorized under "PUBLIC_DOMAIN" have been researched to confirm that statutory copyright protections have expired or were forfeited under applicable law. While public-domain films may be freely viewed, certain derivative elements (such as restored musical scores, foreign subtitles, or colorization) may be subject to separate third-party rights.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-white">4. DMCA / Takedown Procedure</h2>
        <p>
          If you believe in good faith that any material on CineVault infringes your copyright, please furnish a formal written notice to our designated Copyright Agent at legal@cinevault.org in compliance with 17 U.S.C. § 512(c)(3).
        </p>
      </section>
    </div>
  );
};
