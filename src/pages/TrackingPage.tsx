import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Order } from '../store/cartStore';
import { supabase } from '../utils/supabase';
import ScrollReveal from '../components/ScrollReveal';

interface TrackingPageProps {
  orders: Order[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode; step: number }> = {
  cekanje_uplate: { label: 'Čeka uplatu', color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/30', icon: <Clock size={16} />, step: 0 },
  nova: { label: 'Nova narudžba', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30', icon: <Clock size={16} />, step: 0 },
  u_obradi: { label: 'U obradi', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/30', icon: <Package size={16} />, step: 1 },
  poslano: { label: 'Poslano', color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/30', icon: <Truck size={16} />, step: 2 },
  isporuceno: { label: 'Isporučeno', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/30', icon: <CheckCircle size={16} />, step: 3 },
  otkazano: { label: 'Otkazano', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/30', icon: <XCircle size={16} />, step: -1 },
};

export default function TrackingPage({ orders }: TrackingPageProps) {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('broj') ?? '');
  const [result, setResult] = useState<any | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto-search if order number is in URL
  useEffect(() => {
    const broj = searchParams.get('broj');
    if (broj) {
      setQuery(broj);
      searchOrder(broj);
    }
  }, []);

  const searchOrder = async (orderNumber: string) => {
    const trimmed = orderNumber.trim().toUpperCase();
    if (!trimmed) return;

    setLoading(true);
    setResult(null);
    setNotFound(false);

    try {
      // 1. Search Supabase first (real orders)
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .ilike('order_number', trimmed)
        .single();

      if (!error && data) {
        setResult(data);
        setLoading(false);
        return;
      }

      // 2. Fall back to localStorage orders (current session)
      const localOrder = orders.find(
        o => o.order_number.toUpperCase() === trimmed
      );
      if (localOrder) {
        setResult(localOrder);
        setLoading(false);
        return;
      }

      // Not found anywhere
      setNotFound(true);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchOrder(query);
  };

  const config = result ? (STATUS_CONFIG[result.status] ?? STATUS_CONFIG['nova']) : null;
  const steps = ['Nova', 'U obradi', 'Poslano', 'Isporučeno'];

  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-20 md:pt-28 pb-16">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-12">
            <p className="text-[#c9a96e] text-[10px] tracking-[0.5em] uppercase font-semibold font-['Inter'] mb-3">dekantihr.com</p>
            <h1 className="font-['Playfair_Display'] text-4xl md:text-5xl font-bold text-[#e8d5a3] mb-3">
              Praćenje <span className="text-[#c9a96e] italic">narudžbe</span>
            </h1>
            <p className="text-[#e8d5a3]/40 font-['Inter'] font-light">Unesite broj narudžbe za provjeru statusa</p>
          </div>
        </ScrollReveal>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c9a96e]/40" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="HR-2026-000001"
                className="w-full bg-[#111111] border border-[#c9a96e]/20 text-[#e8d5a3] placeholder-[#e8d5a3]/25 pl-11 pr-4 py-4 rounded-2xl text-sm focus:outline-none focus:border-[#c9a96e]/50 font-['Inter'] tracking-wider"
              />
            </div>
            <button type="submit" disabled={loading} className="bg-[#c9a96e] text-[#0a0a0a] px-6 py-4 rounded-2xl font-bold text-sm tracking-wider uppercase hover:bg-[#e8d5a3] transition-all disabled:opacity-60 flex items-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" /> : 'Traži'}
            </button>
          </div>
          <p className="text-[#e8d5a3]/20 text-xs font-['Inter'] mt-2 text-center">
            Unesite broj narudžbe iz potvrdnog emaila (npr. HR-2026-123456)
          </p>
        </form>

        {/* Not found */}
        {notFound && (
          <div className="text-center py-8 bg-[#111111] border border-red-500/20 rounded-2xl">
            <XCircle size={32} className="text-red-400/50 mx-auto mb-3" />
            <p className="text-[#e8d5a3]/50 font-['Inter']">Narudžba nije pronađena</p>
            <p className="text-[#e8d5a3]/25 text-sm font-['Inter'] mt-1">Provjerite broj narudžbe i pokušajte ponovo</p>
          </div>
        )}

        {/* Result */}
        {result && config && (
          <div className="bg-[#111111] border border-[#c9a96e]/15 rounded-3xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1a1a1a] to-[#111111] border-b border-[#c9a96e]/10 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#e8d5a3]/40 text-xs font-['Inter'] uppercase tracking-wider mb-1">Broj narudžbe</p>
                  <p className="text-[#c9a96e] font-['DM_Sans'] text-2xl font-bold">{result.order_number}</p>
                  <p className="text-[#e8d5a3]/40 text-sm font-['Inter'] mt-1">Naručeno: {result.created_at}</p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold font-['Inter'] ${config.color} ${config.bg}`}>
                  {config.icon}
                  {config.label}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            {result.status !== 'otkazano' && (
              <div className="p-6 border-b border-[#c9a96e]/10">
                <div className="relative">
                  {/* Line */}
                  <div className="absolute top-4 left-0 right-0 h-0.5 bg-[#1a1a1a]" />
                  <div
                    className="absolute top-4 left-0 h-0.5 bg-[#c9a96e] transition-all duration-1000"
                    style={{ width: `${(config.step / 3) * 100}%` }}
                  />

                  <div className="relative flex justify-between">
                    {steps.map((stepLabel, i) => (
                      <div key={i} className="flex flex-col items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                          i <= config.step
                            ? 'bg-[#c9a96e] border-[#c9a96e] text-[#0a0a0a]'
                            : 'bg-[#0a0a0a] border-[#333] text-[#e8d5a3]/20'
                        }`}>
                          {i < config.step ? <CheckCircle size={14} /> : <span className="text-xs font-bold">{i + 1}</span>}
                        </div>
                        <span className={`text-[10px] font-['Inter'] tracking-wider ${i <= config.step ? 'text-[#c9a96e]' : 'text-[#e8d5a3]/25'}`}>
                          {stepLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tracking */}
            {result.tracking_broj && (
              <div className="px-6 py-4 border-b border-[#c9a96e]/10 bg-[#c9a96e]/3">
                <p className="text-[#e8d5a3]/40 text-[10px] uppercase tracking-wider font-['Inter'] mb-1">BoxNow kod za preuzimanje</p>
                <div className="flex items-center gap-3">
                  <Truck size={16} className="text-[#c9a96e]" />
                  <span className="text-[#c9a96e] font-['Inter'] font-bold text-sm tracking-widest">{result.tracking_broj}</span>
                  <a href="https://boxnow.hr" target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#c9a96e]/60 border border-[#c9a96e]/25 px-2 py-1 rounded-lg hover:bg-[#c9a96e]/5 transition-all font-['Inter']">
                    Prati na BoxNow →
                  </a>
                </div>
              </div>
            )}

            {/* Details */}
            <div className="p-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[#e8d5a3]/25 text-[10px] uppercase tracking-wider font-['Inter'] mb-1">Dostava</p>
                <p className="text-[#e8d5a3]/60 font-['Inter']">{result.ime} {result.prezime}</p>
                <p className="text-[#e8d5a3]/40 text-xs font-['Inter']">{result.adresa}</p>
                <p className="text-[#e8d5a3]/40 text-xs font-['Inter']">{result.postanski_broj} {result.grad}</p>
              </div>
              <div>
                <p className="text-[#e8d5a3]/25 text-[10px] uppercase tracking-wider font-['Inter'] mb-1">Iznos</p>
                <p className="text-[#c9a96e] font-['DM_Sans'] font-bold text-xl">{result.ukupno.toFixed(2)}€</p>
                <p className="text-[#e8d5a3]/40 text-xs font-['Inter']">
                  {result.nacin_placanja === 'revolut' ? '💳 Revolut' : result.nacin_placanja === 'bankovna' ? '🏦 Bankovno' : '💳 Kartica'}
                  {result.placeno && <span className="text-green-400 ml-1">✓ plaćeno</span>}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info box */}
        <ScrollReveal animation="fade-up" delay={200}>
          <div className="mt-8 bg-[#111111] border border-[#c9a96e]/10 rounded-2xl p-5">
            <h3 className="text-[#e8d5a3]/70 text-sm font-semibold font-['Inter'] mb-3">ℹ️ Informacije o dostavi</h3>
            <ul className="space-y-2 text-xs text-[#e8d5a3]/40 font-['Inter']">
              <li>• Narudžbe primljene do 14:00 pakiramo i šaljemo isti dan</li>
              <li>• BoxNow paketomat dostava: 1-2 radna dana unutar Hrvatske</li>
              <li>• Kod za preuzimanje stiže SMS-om i emailom nakon predaje u paketomat</li>
              <li>• Za pitanja: info@dekantihr.com ili Instagram @dekantihr.com</li>
            </ul>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
