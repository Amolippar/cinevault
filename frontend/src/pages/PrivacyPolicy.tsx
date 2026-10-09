import React from 'react';
import { Shield } from 'lucide-react';
import { SEO } from '../components/common/SEO';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 min-h-screen text-slate-300 space-y-8 text-xs sm:text-sm leading-relaxed">
      <SEO title="Privacy Policy" description="CineVault's commitment to user data privacy and non-invasive streaming." />

      <div className="border-b border-cinema-border/50 pb-6 space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
          <Shield className="w-4 h-4" /> Privacy & Data Transparency
        </div>
        <h1 className="text-3xl font-black text-white">Privacy Policy</h1>
        <p className="text-slate-400 text-xs">Last Updated: September 2026</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-white">1. Information We Collect</h2>
        <p>
          CineVault collects only the minimum information necessary to provide an authentic movie streaming and archiving experience:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
          <li>Account credentials (name, email address, and securely hashed passwords using bcrypt).</li>
          <li>User engagement activity (personal watch history timestamps, completion percentages, reviews, ratings, and saved watchlist items).</li>
          <li>Standard, anonymized technical telemetry (IP addresses, user-agent data, and error diagnostic logs) for DDoS mitigation and server reliability.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-white">2. How We Use Your Information</h2>
        <p>
          We use your data solely to authenticate your session, sync playback progress across devices, compute aggregated movie ratings, and maintain security. We do NOT sell, lease, or monetize your personal information to third-party data brokers.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-white">3. Third-Party Links & Authorized Streaming Partners</h2>
        <p>
          CineVault indexes authorized external links to licensed platforms (e.g. YouTube, Paramount+, Archive.org). When you click an external link, you leave CineVault and are subject to the respective external platform's privacy policy and terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-white">4. User Rights & Data Deletion</h2>
        <p>
          You retain full ownership of your data. You may request account deactivation, export of your reviews, or complete deletion of your profile and history at any time by contacting support@cinevault.org.
        </p>
      </section>
    </div>
  );
};
