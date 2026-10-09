import React, { useState } from 'react';
import { Mail, MessageSquare, ShieldCheck, Send, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { SEO } from '../components/common/SEO';

export const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('general');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const { success, error } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      error('Please complete all required fields.');
      return;
    }

    setIsSent(true);
    success('Your inquiry has been submitted to the CineVault legal & support desk.');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 min-h-screen space-y-12">
      <SEO title="Contact & DMCA Agent" description="Contact CineVault support, inquiries, or our designated copyright agent." />

      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-white">Contact & Support</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Have questions about legal streaming, archive contributions, or licensing partnerships? Get in touch with our curatorial team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Info Column */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-2">
            <Mail className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">General Inquiries</h3>
            <p className="text-xs text-slate-400">info@cinevault.org</p>
          </div>

          <div id="dmca" className="p-6 rounded-2xl glass-card border border-slate-800 space-y-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Designated Copyright Agent</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              For DMCA notices, copyright verification audits, or rights documentation, email our legal desk:
            </p>
            <p className="text-xs font-semibold text-emerald-400">legal@cinevault.org</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2">
          <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl">
            {isSent ? (
              <div className="text-center py-12 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">Message Received</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Thank you for reaching out. A CineVault curator or legal compliance officer will respond within 24 business hours.
                </p>
                <button
                  onClick={() => {
                    setIsSent(false);
                    setMessage('');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-white"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Your Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Subject / Department
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  >
                    <option value="general">General Support</option>
                    <option value="licensing">Film Licensing & Public Domain Inquiry</option>
                    <option value="dmca">DMCA / Copyright Compliance Notice</option>
                    <option value="partnership">Authorized Provider Partnership</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Your Message
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your question or provide legal rights citations..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
