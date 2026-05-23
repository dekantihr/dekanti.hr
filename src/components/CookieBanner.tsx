import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const COOKIE_KEY = 'dekanti_cookie_consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    // Show only if no decision has been made yet
    if (!localStorage.getItem(COOKIE_KEY)) {
      // Small delay so it doesn't flash on first paint
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = (accepted: boolean) => {
    localStorage.setItem(COOKIE_KEY, accepted ? 'accepted' : 'declined');
    setHiding(true);
    setTimeout(() => setVisible(false), 400);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[9999] px-4 pb-4 sm:pb-6 transition-all duration-400 ${
        hiding ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
      }`}
      style={{ transition: 'opacity 0.4s ease, transform 0.4s ease' }}
    >
      <div className="max-w-2xl mx-auto bg-[#111111] border border-[#c9a96e]/20 rounded-2xl shadow-2xl shadow-black/60 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="w-9 h-9 rounded-xl bg-[#c9a96e]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#c9a96e]">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[#e8d5a3] text-sm font-semibold font-['Inter'] mb-1">
              Koristimo kolačiće
            </p>
            <p className="text-[#e8d5a3]/50 text-xs font-['Inter'] leading-relaxed">
              Koristimo nužne kolačiće za rad stranice i analitičke za poboljšanje iskustva.
              Više u našoj{' '}
              <Link
                to="/kolacici"
                className="text-[#c9a96e]/80 hover:text-[#c9a96e] underline underline-offset-2 transition-colors"
              >
                politici kolačića
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 mt-4 justify-end">
          <button
            onClick={() => dismiss(false)}
            className="px-4 py-2 text-xs font-['Inter'] font-medium text-[#e8d5a3]/40 hover:text-[#e8d5a3]/70 transition-colors rounded-xl hover:bg-white/5"
          >
            Odbij
          </button>
          <button
            onClick={() => dismiss(true)}
            className="px-5 py-2 bg-[#c9a96e] text-[#0a0a0a] text-xs font-['Inter'] font-bold rounded-xl hover:bg-[#e8d5a3] transition-colors tracking-wide"
          >
            Prihvati
          </button>
        </div>
      </div>
    </div>
  );
}
