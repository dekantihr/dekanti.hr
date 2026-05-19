import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, Tag, ArrowRight } from 'lucide-react';
import { CartItem, AppliedCoupon } from '../store/cartStore';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import ScrollReveal from '../components/ScrollReveal';

interface CartPageProps {
  items: CartItem[];
  coupon: AppliedCoupon | null;
  onCouponSet: (c: AppliedCoupon | null) => void;
  onUpdateQuantity: (sizeId: number, qty: number) => void;
  onRemoveItem: (sizeId: number) => void;
  subtotal: number;
  dostava: number;
  popust: number;
  ukupno: number;
}

export default function CartPage({ items, coupon, onCouponSet, onUpdateQuantity, onRemoveItem, subtotal, dostava, popust, ukupno }: CartPageProps) {
  const [couponCode, setCouponCode] = useState('');
  const navigate = useNavigate();

  const applyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) return;

    try {
      const response = await api.validateCoupon(code, subtotal);
      
      if (!response.valid || !response.coupon) {
        toast.error(response.error || 'Kupon nije valjan ili je istekao');
        return;
      }
      
      onCouponSet(response.coupon);
      toast.success(`Kupon "${response.coupon.kod}" primijenjen! Uštedjeli ste: ${response.coupon.popust_iznos.toFixed(2)}€`);
      setCouponCode('');
    } catch (error) {
      console.error('Error applying coupon:', error);
      toast.error('Došlo je do greške pri primjeni kupona');
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen pt-32 flex items-center justify-center">
        <div className="text-center px-4">
          <ScrollReveal animation="scale">
            <ShoppingBag size={60} className="text-[#c9a96e]/20 mx-auto mb-6" />
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={100}>
            <h1 className="font-['Playfair_Display'] text-4xl font-bold text-[#e8d5a3] mb-3">Košarica je prazna</h1>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={200}>
            <p className="text-[#e8d5a3]/40 font-['Inter'] font-light mb-8">Otkrijte naše premium decant parfeme i dodajte ih u košaricu</p>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={300}>
            <Link to="/parfemi" className="inline-flex items-center gap-2 bg-[#c9a96e] text-[#0a0a0a] px-8 py-4 rounded-full font-bold text-sm tracking-wider uppercase hover:bg-[#e8d5a3] transition-all">
              Pregledaj kolekciju
              <ArrowRight size={16} />
            </Link>
          </ScrollReveal>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-20 md:pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ScrollReveal animation="fade-up">
          <div className="mb-8">
            <p className="text-[#c9a96e] text-[10px] tracking-[0.5em] uppercase font-semibold font-['Inter'] mb-2">dekanti.hr</p>
            <h1 className="font-['Playfair_Display'] text-4xl md:text-5xl font-bold text-[#e8d5a3]">
              Vaša <span className="text-[#c9a96e] italic">košarica</span>
            </h1>
            <p className="text-[#e8d5a3]/40 font-['Inter'] mt-1">{items.reduce((s, i) => s + i.kolicina, 0)} artikal(a)</p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(item => (
              <div key={item.product_size_id} className="bg-[#111111] border border-[#c9a96e]/10 hover:border-[#c9a96e]/20 rounded-2xl p-4 flex gap-4 transition-all">
                {/* Image */}
                <Link to={`/parfemi/${item.slug}`} className="flex-shrink-0">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-[#1a1a1a]">
                    <img src={item.image} alt={item.naziv} className="w-full h-full object-cover" />
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[#c9a96e] text-[9px] tracking-[0.25em] uppercase font-['Inter'] font-semibold">{item.brand}</p>
                      <Link to={`/parfemi/${item.slug}`} className="text-[#e8d5a3] font-['Playfair_Display'] font-semibold hover:text-[#c9a96e] transition-colors line-clamp-1">
                        {item.naziv}
                      </Link>
                      <p className="text-[#e8d5a3]/40 text-xs font-['Inter'] mt-0.5">{item.ml}ml · {item.cijena.toFixed(2)}€/kom</p>
                    </div>
                    <button onClick={() => onRemoveItem(item.product_size_id)} className="text-[#e8d5a3]/25 hover:text-red-400 transition-colors flex-shrink-0 p-1">
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Qty */}
                    <div className="flex items-center gap-2 bg-[#0a0a0a] border border-[#c9a96e]/15 rounded-xl overflow-hidden">
                      <button onClick={() => onUpdateQuantity(item.product_size_id, item.kolicina - 1)} className="p-2 text-[#e8d5a3]/50 hover:text-[#c9a96e] hover:bg-[#c9a96e]/5 transition-all">
                        <Minus size={13} />
                      </button>
                      <span className="text-[#e8d5a3] text-sm font-['Inter'] font-semibold w-8 text-center">{item.kolicina}</span>
                      <button onClick={() => onUpdateQuantity(item.product_size_id, item.kolicina + 1)} disabled={item.kolicina >= item.max_zaliha} className="p-2 text-[#e8d5a3]/50 hover:text-[#c9a96e] hover:bg-[#c9a96e]/5 transition-all disabled:opacity-30">
                        <Plus size={13} />
                      </button>
                    </div>
                    {/* Total */}
                    <span className="text-[#c9a96e] font-['Playfair_Display'] font-bold text-lg">
                      {(item.cijena * item.kolicina).toFixed(2)}€
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue shopping */}
            <Link to="/parfemi" className="inline-flex items-center gap-2 text-[#c9a96e]/60 hover:text-[#c9a96e] text-sm font-['Inter'] transition-colors mt-2">
              ← Nastavite kupovinu
            </Link>
          </div>

          {/* Summary */}
          <div>
            <div className="bg-[#111111] border border-[#c9a96e]/15 rounded-2xl p-6 sticky top-28">
              <h2 className="text-[#e8d5a3]/80 font-['Playfair_Display'] text-xl font-bold mb-5">Sažetak narudžbe</h2>

              {/* Coupon */}
              <div className="mb-5">
                {coupon ? (
                  <div className="flex items-center justify-between bg-green-900/20 border border-green-600/30 rounded-xl px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <Tag size={13} className="text-green-400" />
                      <span className="text-green-400 text-xs font-['Inter'] font-semibold">{coupon.kod}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 text-xs font-['Inter']">-{coupon.popust_iznos.toFixed(2)}€</span>
                      <button onClick={() => onCouponSet(null)} className="text-green-400/60 hover:text-green-400 text-xs">✕</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c9a96e]/40" />
                      <input
                        type="text"
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value.toUpperCase())}
                        onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                        placeholder="Kupon kod"
                        className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] placeholder-[#e8d5a3]/25 pl-9 pr-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-[#c9a96e]/50 font-['Inter'] uppercase tracking-wider"
                      />
                    </div>
                    <button onClick={applyCoupon} className="bg-[#c9a96e]/10 border border-[#c9a96e]/30 text-[#c9a96e] px-3 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#c9a96e] hover:text-[#0a0a0a] transition-all whitespace-nowrap">
                      Primijeni
                    </button>
                  </div>
                )}
                <p className="text-[#e8d5a3]/20 text-[10px] font-['Inter'] mt-1.5">
                  Unesite kod kupona za popust
                </p>
              </div>

              <div className="h-[1px] bg-[#c9a96e]/10 mb-4" />

              {/* Price breakdown */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm font-['Inter']">
                  <span className="text-[#e8d5a3]/50">Međuiznos</span>
                  <span className="text-[#e8d5a3]/80">{subtotal.toFixed(2)}€</span>
                </div>
                {popust > 0 && (
                  <div className="flex justify-between text-sm font-['Inter']">
                    <span className="text-green-400">Popust ({coupon?.kod})</span>
                    <span className="text-green-400">-{popust.toFixed(2)}€</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-['Inter']">
                  <span className="text-[#e8d5a3]/50">Dostava (BoxNow)</span>
                  <span className={dostava === 0 ? 'text-green-400' : 'text-[#e8d5a3]/80'}>
                    {dostava === 0 ? 'BESPLATNO' : `${dostava.toFixed(2)}€`}
                  </span>
                </div>
                {dostava > 0 && (
                  <p className="text-[#e8d5a3]/25 text-[10px] font-['Inter']">
                    Besplatna dostava za narudžbe iznad 50€ (još {(50 - subtotal).toFixed(2)}€)
                  </p>
                )}
              </div>

              <div className="h-[1px] bg-[#c9a96e]/10 mb-4" />

              <div className="flex justify-between mb-6">
                <span className="text-[#e8d5a3] font-semibold font-['Inter']">Ukupno</span>
                <span className="text-[#c9a96e] font-['Playfair_Display'] text-2xl font-bold">{ukupno.toFixed(2)}€</span>
              </div>

              <button
                onClick={() => navigate('/naruci')}
                className="w-full bg-[#c9a96e] text-[#0a0a0a] py-4 rounded-2xl font-bold text-sm tracking-[0.1em] uppercase font-['Inter'] hover:bg-[#e8d5a3] transition-all shadow-[0_0_20px_rgba(201,169,110,0.2)] flex items-center justify-center gap-2"
              >
                Naruči
                <ArrowRight size={16} />
              </button>

              <div className="flex items-center justify-center gap-4 mt-4">
                <span className="text-[#e8d5a3]/25 text-[10px] font-['Inter']">🔒 Sigurna kupnja</span>
                <span className="text-[#e8d5a3]/25 text-[10px] font-['Inter']">💳 Kartica / Revolut</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
