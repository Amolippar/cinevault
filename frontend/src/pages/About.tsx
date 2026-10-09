import React from 'react';
import { ShieldCheck, Film, BookOpen, Heart, Award, CheckCircle } from 'lucide-react';
import { SEO } from '../components/common/SEO';

export const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 min-h-screen space-y-12">
      <SEO
        title="About CineVault - Mission & Film Preservation"
        description="Learn about CineVault's commitment to legal streaming, public domain preservation, and copyright compliance."
      />

      {/* Hero Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <Film className="w-3.5 h-3.5" /> Preserving Cinematic Heritage
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          About CineVault
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
          CineVault is an independent, production-grade movie discovery and legal streaming platform designed to honor, preserve, and provide free public access to historic cinema.
        </p>
      </div>

      {/* Core Principles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">100% Legal & Authorization-Only</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            We never host, stream, or facilitate downloads of copyrighted media without verified statutory distribution rights. Every film stream is audited for public domain status or licensed contractual authorization.
          </p>
        </div>

        <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Public Domain Preservation</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Films like <em>Night of the Living Dead</em>, <em>Charade</em>, and <em>Metropolis</em> belong to human cultural commons. We index, digitize, and present them in modern, accessible streaming formats.
          </p>
        </div>

        <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Authorized Partner Portals</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            For contemporary films under active copyright protection, we partner with legitimate distributors (YouTube, Paramount+, Criterion) and direct users straight to authorized providers.
          </p>
        </div>

        <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Cinephile Community</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Film students, researchers, and cinema lovers around the world can review, rate, bookmark, and study classic titles with zero deceptive ads or forced popups.
          </p>
        </div>
      </div>

      {/* Licensing Deep Dive */}
      <div id="licensing" className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-4">
        <h2 className="text-xl font-bold text-white">How CineVault Verifies Content Legality</h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          The United States and international copyright statutes recognize specific categories under which films enter the public domain:
        </p>

        <ul className="space-y-3 text-xs text-slate-400">
          <li className="flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Pre-1929 Publications:</strong> All works published prior to January 1, 1929 have naturally entered the worldwide public domain following standard term expirations (e.g., Buster Keaton's <em>The General</em>, Fritz Lang's <em>Metropolis</em>).
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>1909 Act Notice Deficiencies:</strong> Works published in the US before 1978 without the statutory copyright notice automatically entered the public domain upon publication (e.g., <em>Night of the Living Dead (1968)</em>, <em>Charade (1963)</em>).
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Failure to Renew:</strong> Works published between 1923 and 1963 required renewal registrations with the US Copyright Office in their 28th year. Unrenewed titles permanently entered the public domain (e.g., <em>His Girl Friday (1940)</em>).
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Creative Commons & Open Licenses:</strong> Contemporary films voluntarily dedicated to the public domain or licensed under CC-BY / CC0 (e.g., Nina Paley's <em>Sita Sings the Blues</em>).
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};
