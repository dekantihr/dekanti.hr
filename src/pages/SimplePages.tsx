import { Link } from 'react-router-dom';
import { Sparkles, Gem, Package, Truck } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-20 md:pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <p className="text-[#c9a96e] text-[10px] tracking-[0.5em] uppercase font-semibold font-['Inter'] mb-3">dekanti.hr</p>
          <h1 className="font-['Playfair_Display'] text-5xl font-bold text-[#e8d5a3] mb-4">
            O <span className="text-[#c9a96e] italic">nama</span>
          </h1>
          <div className="flex items-center gap-4 justify-center">
            <div className="flex-1 h-[1px] max-w-[100px] bg-[#c9a96e]/20" />
            <Sparkles size={14} className="text-[#c9a96e]" />
            <div className="flex-1 h-[1px] max-w-[100px] bg-[#c9a96e]/20" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="font-['Playfair_Display'] text-3xl font-bold text-[#e8d5a3] mb-4">Naša priča</h2>
            <p className="text-[#e8d5a3]/50 font-['Inter'] font-light leading-relaxed mb-4">
              dekanti.hr je hrvatska platforma za prodaju premium decant parfema. Naša misija je omogućiti svima da iskuse luksuzne mirise renomiranih svjetskih brandova po pristupačnim cijenama.
            </p>
            <p className="text-[#e8d5a3]/50 font-['Inter'] font-light leading-relaxed mb-4">
              Dekantiranje parfema je umjetnost — svaki decant pažljivo punimo iz originalnih boca kako bismo vam dostavili autentično iskustvo mirisa bez skupocjenih originalnih pakiranja.
            </p>
            <p className="text-[#e8d5a3]/50 font-['Inter'] font-light leading-relaxed">
              Svi naši parfemi su 100% autentični, od certificiranih dobavljača. Garantiramo kvalitetu ili novac natrag.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { number: '200+', label: 'Zadovoljnih kupaca' },
              { number: '50+', label: 'Parfema u ponudi' },
              { number: '5', label: 'Premium brandova' },
              { number: '4.9/5', label: 'Prosječna ocjena' },
            ].map(stat => (
              <div key={stat.label} className="bg-[#111111] border border-[#c9a96e]/15 rounded-2xl p-5 text-center">
                <p className="text-[#c9a96e] font-['Playfair_Display'] text-3xl font-bold mb-1">{stat.number}</p>
                <p className="text-[#e8d5a3]/40 text-xs font-['Inter']">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111111] border border-[#c9a96e]/10 rounded-3xl p-8 mb-10">
          <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#e8d5a3] mb-6 text-center">Zašto dekanti.hr?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Gem size={32} className="text-[#c9a96e]" />, title: '100% Autentični parfemi', desc: 'Svi parfemi su originalni, iz certificiranih izvora. Bez falsifikata, bez kompromisa.' },
              { icon: <Package size={32} className="text-[#c9a96e]" />, title: 'Pažljivo pakiranje', desc: 'Svaki decant se pažljivo puni i pakira da bi stigao savršen do vaših vrata.' },
              { icon: <Truck size={32} className="text-[#c9a96e]" />, title: 'Brza dostava', desc: 'HP Pošta24 dostava unutar 1-2 radna dana. Narudžbe do 14h šaljemo isti dan.' },
            ].map(item => (
              <div key={item.title} className="text-center">
                <div className="flex justify-center mb-3">{item.icon}</div>
                <h3 className="text-[#e8d5a3]/80 font-['Playfair_Display'] font-bold mb-2">{item.title}</h3>
                <p className="text-[#e8d5a3]/40 text-sm font-['Inter'] font-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link to="/parfemi" className="inline-flex items-center gap-2 bg-[#c9a96e] text-[#0a0a0a] px-8 py-4 rounded-full font-bold text-sm tracking-wider uppercase hover:bg-[#e8d5a3] transition-all">
            Pregledaj kolekciju →
          </Link>
        </div>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-32 flex items-center justify-center">
      <div className="text-center px-4">
        <div className="font-['Playfair_Display'] text-8xl font-bold text-[#c9a96e]/20 mb-4">404</div>
        <h1 className="font-['Playfair_Display'] text-4xl font-bold text-[#e8d5a3] mb-3">Stranica nije pronađena</h1>
        <p className="text-[#e8d5a3]/40 font-['Inter'] font-light mb-8">Tražena stranica ne postoji ili je premještena.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="bg-[#c9a96e] text-[#0a0a0a] px-6 py-3 rounded-full font-bold text-sm hover:bg-[#e8d5a3] transition-all font-['Inter']">
            Početna stranica
          </Link>
          <Link to="/parfemi" className="border border-[#c9a96e]/30 text-[#c9a96e] px-6 py-3 rounded-full text-sm hover:bg-[#c9a96e]/5 transition-all font-['Inter']">
            Pregledaj parfeme
          </Link>
        </div>
      </div>
    </div>
  );
}
