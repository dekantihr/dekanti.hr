import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Package, Truck, CreditCard, Shield, RotateCcw, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      toast.error('Unesite valjanu email adresu', {
        style: { background: '#111111', color: '#e8d5a3', border: '1px solid rgba(239,68,68,0.3)' },
        iconTheme: { primary: '#ef4444', secondary: '#0a0a0a' },
      });
      return;
    }
    
    // Check email length
    if (email.length > 255) {
      toast.error('Email adresa je predugačka');
      return;
    }
    
    // TODO: Send to backend with duplicate check
    toast.success('Hvala! Provjerite email za potvrdu pretplate.', {
      style: { background: '#111111', color: '#e8d5a3', border: '1px solid rgba(201,169,110,0.3)' },
      iconTheme: { primary: '#c9a96e', secondary: '#0a0a0a' },
    });
    setEmail('');
  };

  return (
    <footer className="bg-[#0a0a0a] border-t border-[#c9a96e]/20">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-6 group">
              <img
                src="/logos/logo_white.png"
                alt="dekantihr.com"
                className="h-10 w-auto object-contain group-hover:opacity-80 transition-opacity duration-300"
              />
              <div className="text-[9px] tracking-[0.4em] text-[#c9a96e]/60 uppercase mt-1 font-['DM_Sans']">
                Luksuzni Decant Parfemi
              </div>
            </Link>
            <p className="text-[#e8d5a3]/50 text-sm font-['DM_Sans'] font-light leading-relaxed mb-6">
              Vaš pouzdani partner u svijetu luksuznih parfema. Nudimo premium decant uzorke najekskluzivnijih svjetskih brandova po pristupačnim cijenama.
            </p>
            <div className="flex gap-3">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-[#c9a96e]/30 flex items-center justify-center text-[#c9a96e]/60 hover:border-[#c9a96e] hover:text-[#c9a96e] transition-all duration-300 text-xs font-bold hover:scale-110 hover-glow font-['DM_Sans']">
                IG
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-[#c9a96e]/30 flex items-center justify-center text-[#c9a96e]/60 hover:border-[#c9a96e] hover:text-[#c9a96e] transition-all duration-300 text-xs font-bold hover:scale-110 hover-glow font-['DM_Sans']">
                FB
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[#c9a96e] text-xs tracking-[0.3em] uppercase font-semibold mb-6">Navigacija</h3>
            <ul className="space-y-3">
              {[
                { to: '/parfemi', label: 'Svi parfemi' },
                { to: '/parfemi?featured=true', label: 'Featured kolekcija' },
                { to: '/parfemi?sort=bestseller', label: 'Bestselleri' },
                { to: '/parfemi?spol=muški', label: 'Muški parfemi' },
                { to: '/parfemi?spol=ženski', label: 'Ženski parfemi' },
                { to: '/parfemi?spol=unisex', label: 'Unisex parfemi' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-[#e8d5a3]/50 hover:text-[#c9a96e] text-sm font-['Inter'] font-light transition-colors flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-3 transition-all overflow-hidden text-[#c9a96e]">—</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Pomoć */}
          <div>
            <h3 className="text-[#c9a96e] text-xs tracking-[0.3em] uppercase font-semibold mb-6">Pomoć</h3>
            <ul className="space-y-3">
              {[
                { to: '/pracenje', label: 'Praćenje narudžbe' },
                { to: '/dostava', label: 'Dostava i isporuka' },
                { to: '/povrat', label: 'Povrat i reklamacije' },
                { to: '/faq', label: 'Česta pitanja' },
                { to: '/o-nama', label: 'O nama' },
                { to: '/kontakt', label: 'Kontakt' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-[#e8d5a3]/50 hover:text-[#c9a96e] text-sm font-['Inter'] font-light transition-colors flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-3 transition-all overflow-hidden text-[#c9a96e]">—</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter + Kontakt */}
          <div>
            <h3 className="text-[#c9a96e] text-xs tracking-[0.3em] uppercase font-semibold mb-6">Newsletter</h3>
            <p className="text-[#e8d5a3]/50 text-sm font-['Inter'] font-light mb-4">
              Pretplatite se i ostvarite <span className="text-[#c9a96e]">10% popusta</span> na prvu narudžbu!
            </p>
            <form onSubmit={handleNewsletter} className="mb-8">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="vaš@email.com"
                  className="flex-1 bg-[#1a1a1a] border border-[#c9a96e]/20 text-[#e8d5a3] placeholder-[#e8d5a3]/25 px-3 py-2.5 rounded-lg text-xs focus:outline-none focus:border-[#c9a96e]/50 font-['Inter']"
                />
                <button type="submit" className="bg-[#c9a96e]/10 border border-[#c9a96e]/40 text-[#c9a96e] px-3 py-2.5 rounded-lg text-xs hover:bg-[#c9a96e] hover:text-[#0a0a0a] transition-all flex items-center justify-center">
                  <Send size={14} />
                </button>
              </div>
            </form>

            <h3 className="text-[#c9a96e] text-xs tracking-[0.3em] uppercase font-semibold mb-4">Kontakt</h3>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2.5 text-[#e8d5a3]/50 text-xs font-['Inter']">
                <Mail size={12} className="text-[#c9a96e]/60 flex-shrink-0" />
                info@dekantihr.com
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Trusted Badges */}
      <div className="border-t border-[#c9a96e]/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-wrap justify-center gap-8 mb-6">
            {[
              { icon: <Package size={14} />, text: 'Isti dan pakiranje' },
              { icon: <Truck size={14} />, text: 'BoxNow 1-2 dana' },
              { icon: <CreditCard size={14} />, text: 'Sigurno plaćanje' },
              { icon: <Shield size={14} />, text: 'Originalni parfemi' },
              { icon: <RotateCcw size={14} />, text: '14 dana povrat' },
            ].map(badge => (
              <div key={badge.text} className="flex items-center gap-2 text-[#e8d5a3]/40 hover:text-[#e8d5a3]/60 transition-colors duration-300 cursor-default">
                <span className="text-[#c9a96e]/50">{badge.icon}</span>
                <span className="text-xs tracking-wider font-['DM_Sans'] font-light">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#c9a96e]/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-[#e8d5a3]/30 text-xs font-['DM_Sans'] font-light">
            © 2025 dekantihr.com — Sva prava pridržana.
          </p>
          <div className="flex gap-4">
            <Link to="/uvjeti" className="text-[#e8d5a3]/30 hover:text-[#c9a96e]/60 text-xs font-['DM_Sans'] transition-colors">
              Uvjeti korištenja
            </Link>
            <Link to="/privatnost" className="text-[#e8d5a3]/30 hover:text-[#c9a96e]/60 text-xs font-['DM_Sans'] transition-colors">
              Privatnost
            </Link>
            <Link to="/kolacici" className="text-[#e8d5a3]/30 hover:text-[#c9a96e]/60 text-xs font-['DM_Sans'] transition-colors">
              Kolačići
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
