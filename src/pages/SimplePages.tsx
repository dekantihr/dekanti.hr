import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal animation="fade-up">
          <div className="flex items-center gap-2 mb-8">
            <Link to="/" className="text-[#c9a96e]/60 hover:text-[#c9a96e] text-sm flex items-center gap-1 transition-colors">
              <ArrowLeft size={14} /> Početna
            </Link>
            <span className="text-[#c9a96e]/30">/</span>
            <span className="text-[#e8d5a3]/60 text-sm">O nama</span>
          </div>
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delay={100}>
          <h1 className="font-['Cormorant_Garamond'] text-5xl md:text-6xl font-bold text-[#e8d5a3] mb-8">
            O <span className="text-[#c9a96e] italic">nama</span>
          </h1>
        </ScrollReveal>

        <div className="space-y-8 text-[#e8d5a3]/70 font-['DM_Sans'] font-light leading-relaxed">
          <ScrollReveal animation="fade-up" delay={200}>
            <p className="text-lg">
              dekantihr.com je specijalizirana online platforma za prodaju premium decant parfema najpoznatijih svjetskih luksuznih brandova. Naša misija je približiti luksuz svakom ljubitelju mirisa — bez kompromisa po pitanju kvalitete, a uz znatno pristupačnije cijene.
            </p>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={300}>
            <h2 className="font-['Cormorant_Garamond'] text-2xl font-semibold text-[#e8d5a3] mb-4">Naša priča</h2>
            <p>
              Svaki parfem dolazi iz originalnog flakona i toči se u sterilnim uvjetima neposredno prije slanja. Surađujemo s ovlaštenim distributerima unutar Europske unije koji nam ustupaju testerska pakiranja, višak zaliha (overstock) te ambalažu s manjim estetskim oštećenjima koja ne može ići u klasičnu maloprodaju.
            </p>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={400}>
            <h2 className="font-['Cormorant_Garamond'] text-2xl font-semibold text-[#e8d5a3] mb-4">Zašto odabrati nas?</h2>
            <ul className="space-y-3">
              {[
                'Originalni luksuzni parfemi točeni iz autentičnih bočica',
                'Premium decant pakiranja od 2ml, 5ml, 10ml i 20ml',
                'Sterilni uvjeti točenja i maksimalna svježina',
                'Dostava preko BoxNow paketomata od samo 0,80 €',
                'Sigurno kartično plaćanje i digitalni nalozi',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c9a96e] mt-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </ScrollReveal>

          <ScrollReveal animation="fade-up" delay={500}>
            <h2 className="font-['Cormorant_Garamond'] text-2xl font-semibold text-[#e8d5a3] mb-4">Kontakt</h2>
            <p>
              Za sva pitanja, sugestije ili suradnju slobodno nas kontaktirajte putem emaila <span className="text-[#c9a96e]">info@dekantihr.com</span> ili putem Instagrama <span className="text-[#c9a96e]">@dekantihr.com</span>.
            </p>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="text-center">
        <ScrollReveal animation="scale">
          <h1 className="font-['Cormorant_Garamond'] text-8xl md:text-9xl font-bold text-[#c9a96e]/20 mb-4">404</h1>
        </ScrollReveal>
        <ScrollReveal animation="fade-up" delay={150}>
          <h2 className="font-['Cormorant_Garamond'] text-3xl md:text-4xl font-semibold text-[#e8d5a3] mb-4">
            Stranica nije pronađena
          </h2>
        </ScrollReveal>
        <ScrollReveal animation="fade-up" delay={250}>
          <p className="text-[#e8d5a3]/50 font-['DM_Sans'] font-light mb-8 max-w-md mx-auto">
            Čini se da ste zalutali u nepoznati miris. Vratite se na početnu stranicu i nastavite istraživati našu kolekciju.
          </p>
        </ScrollReveal>
        <ScrollReveal animation="fade-up" delay={350}>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[#c9a96e] text-[#0a0a0a] px-8 py-4 rounded-full font-['Inter'] font-semibold text-sm tracking-wide uppercase hover:bg-[#e8d5a3] transition-colors"
          >
            <Home size={16} />
            Nazad na početnu
          </Link>
        </ScrollReveal>
      </div>
    </div>
  );
}
