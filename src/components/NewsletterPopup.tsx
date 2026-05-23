import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { api } from '../services/api';

const STORAGE_KEY = 'dekanti_newsletter_popup';
// Trigger after 45s on page OR 40% scroll depth — whichever comes first
const TRIGGER_DELAY_MS = 45_000;
const TRIGGER_SCROLL_PCT = 40;

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [hiding, setHiding] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const shouldShow = useCallback(() => {
    return !localStorage.getItem(STORAGE_KEY);
  }, []);

  const show = useCallback(() => {
    if (shouldShow()) setVisible(true);
  }, [shouldShow]);

  const dismiss = useCallback((permanent = true) => {
    if (permanent) localStorage.setItem(STORAGE_KEY, 'dismissed');
    setHiding(true);
    setTimeout(() => setVisible(false), 400);
  }, []);

  // Time-based trigger
  useEffect(() => {
    if (!shouldShow()) return;
    const t = setTimeout(show, TRIGGER_DELAY_MS);
    return () => clearTimeout(t);
  }, [show, shouldShow]);

  // Scroll-depth trigger
  useEffect(() => {
    if (!shouldShow()) return;

    const onScroll = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0 && (scrolled / total) * 100 >= TRIGGER_SCROLL_PCT) {
        show();
        window.removeEventListener('scroll', onScroll);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [show, shouldShow]);

  // Escape key
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, dismiss]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Unesite valjanu email adresu');
      return;
    }

    setLoading(true);
    try {
      const result = await api.subscribeNewsletter(trimmed);
      if (result.success) {
        setSubmitted(true);
        localStorage.setItem(STORAGE_KEY, 'subscribed');
        // Auto-close after 3s
        setTimeout(() => dismiss(false), 3000);
      } else {
        setError(result.error || 'Greška pri prijavi');
      }
    } catch {
      setError('Greška pri prijavi. Pokušajte ponovno.');
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm transition-opacity duration-400 ${
          hiding ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ transition: 'opacity 0.4s ease' }}
        onClick={() => dismiss()}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={`fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 pointer-events-none`}
        role="dialog"
        aria-modal="true"
        aria-label="Prijava na newsletter"
      >
        <div
          className={`relative w-full max-w-md pointer-events-auto transition-all duration-400 ${
            hiding
              ? 'opacity-0 scale-95 translate-y-4'
              : 'opacity-100 scale-100 translate-y-0'
          }`}
          style={{ transition: 'opacity 0.4s ease, transform 0.4s ease' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Card */}
          <div className="bg-[#111111] border border-[#c9a96e]/20 rounded-3xl overflow-hidden shadow-2xl shadow-black/80">

            {/* Top decorative bar */}
            <div className="h-px bg-gradient-to-r from-transparent via-[#c9a96e]/50 to-transparent" />

            {/* Close button */}
            <button
              onClick={() => dismiss()}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#e8d5a3]/40 hover:text-[#e8d5a3]/80 transition-all"
              aria-label="Zatvori"
            >
              <X size={14} />
            </button>

            <div className="p-7 sm:p-8">
              {!submitted ? (
                <>
                  {/* Header */}
                  <div className="mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#c9a96e]/10 border border-[#c9a96e]/20 flex items-center justify-center mb-4">
                      <span className="text-xl">✉️</span>
                    </div>
                    <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#e8d5a3] mb-2">
                      Ekskluzivne ponude
                    </h2>
                    <p className="text-[#e8d5a3]/50 text-sm font-['Inter'] leading-relaxed">
                      Prijavite se i budite prvi koji saznaju za nove parfeme, popuste i posebne ponude.
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} noValidate>
                    <div className="mb-3">
                      <input
                        type="email"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setError(''); }}
                        placeholder="vasa@email.com"
                        autoComplete="email"
                        className={`w-full bg-[#0a0a0a] border text-[#e8d5a3] placeholder-[#e8d5a3]/25 px-4 py-3.5 rounded-xl text-sm font-['Inter'] focus:outline-none transition-colors ${
                          error
                            ? 'border-red-500/50 focus:border-red-500/70'
                            : 'border-[#c9a96e]/20 focus:border-[#c9a96e]/50'
                        }`}
                        disabled={loading}
                      />
                      {error && (
                        <p className="text-red-400/80 text-xs font-['Inter'] mt-1.5 ml-1">{error}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#c9a96e] text-[#0a0a0a] py-3.5 rounded-xl font-bold text-sm font-['Inter'] tracking-wider uppercase hover:bg-[#e8d5a3] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" />
                      ) : (
                        'Prijavi se besplatno'
                      )}
                    </button>
                  </form>

                  {/* Trust microcopy */}
                  <div className="flex items-center justify-center gap-4 mt-4">
                    {['🔒 Bez spama', '✦ Odjava u 1 kliku', '🎁 Ekskluzivni popusti'].map(t => (
                      <span key={t} className="text-[#e8d5a3]/25 text-[10px] font-['Inter']">{t}</span>
                    ))}
                  </div>
                </>
              ) : (
                /* Success state */
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-5">
                    <span className="text-2xl">✅</span>
                  </div>
                  <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#e8d5a3] mb-2">
                    Hvala na prijavi!
                  </h3>
                  <p className="text-[#e8d5a3]/50 text-sm font-['Inter'] leading-relaxed">
                    Dobrodošli u dekantihr.com zajednicu. Uskoro ćete primiti prve ekskluzivne ponude.
                  </p>
                  <div className="mt-4 h-1 bg-[#0a0a0a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#c9a96e] rounded-full"
                      style={{ animation: 'progress 3s linear forwards' }}
                    />
                  </div>
                  <style>{`@keyframes progress { from { width: 0% } to { width: 100% } }`}</style>
                </div>
              )}
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-[#c9a96e]/20 to-transparent" />
          </div>
        </div>
      </div>
    </>
  );
}
