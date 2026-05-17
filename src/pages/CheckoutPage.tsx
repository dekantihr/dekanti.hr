import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronRight, Package, CreditCard, ClipboardCheck } from 'lucide-react';
import { CartItem, AppliedCoupon } from '../store/cartStore';
import toast from 'react-hot-toast';
import { api } from '../services/api';

interface CheckoutPageProps {
  items: CartItem[];
  coupon: AppliedCoupon | null;
  subtotal: number;
  dostava: number;
  popust: number;
  ukupno: number;
  user: { id: number; ime: string; prezime: string; email: string } | null;
  onOrderComplete: (order: any) => void;
  onClearCart: () => void;
}

type Step = 'podaci' | 'dostava' | 'pregled' | 'potvrda';

interface FormData {
  ime: string;
  prezime: string;
  email: string;
  telefon: string;
  adresa: string;
  grad: string;
  postanski_broj: string;
  napomena: string;
  nacin_placanja: 'pouzecem' | 'bankovna';
}

export default function CheckoutPage({ items, subtotal, dostava, popust, ukupno, user, onOrderComplete, onClearCart }: CheckoutPageProps) {
  const [step, setStep] = useState<Step>('podaci');
  const [orderNumber, setOrderNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [form, setForm] = useState<FormData>({
    ime: user?.ime ?? '',
    prezime: user?.prezime ?? '',
    email: user?.email ?? '',
    telefon: '',
    adresa: '',
    grad: '',
    postanski_broj: '',
    napomena: '',
    nacin_placanja: 'pouzecem',
  });

  const updateForm = (field: keyof FormData, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const steps = [
    { id: 'podaci', label: 'Podaci', icon: <Package size={14} /> },
    { id: 'dostava', label: 'Plaćanje', icon: <CreditCard size={14} /> },
    { id: 'pregled', label: 'Pregled', icon: <ClipboardCheck size={14} /> },
    { id: 'potvrda', label: 'Potvrda', icon: <Check size={14} /> },
  ];

  const currentStepIdx = steps.findIndex(s => s.id === step);

  const validatePodaci = () => {
    if (!form.ime || !form.prezime || !form.email || !form.telefon || !form.adresa || !form.grad || !form.postanski_broj) {
      toast.error('Ispunite sva obavezna polja');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error('Unesite valjanu email adresu');
      return false;
    }
    return true;
  };

  const submitOrder = async () => {
    setIsProcessing(true);
    
    try {
      const orderData = {
        user_id: user?.id ?? null,
        ime: form.ime,
        prezime: form.prezime,
        email: form.email,
        telefon: form.telefon,
        adresa: form.adresa,
        grad: form.grad,
        postanski_broj: form.postanski_broj,
        napomena: form.napomena,
        nacin_dostave: 'hp_posta24' as const,
        nacin_placanja: form.nacin_placanja,
        cijena_dostave: dostava,
        subtotal,
        popust_iznos: popust,
        kupon_id: null, // We should probably store the coupon ID if we have it
        ukupno,
        items: items.map(item => ({
          product_size_id: item.product_size_id,
          naziv_proizvoda: item.naziv,
          brand_naziv: item.brand,
          ml: item.ml,
          cijena: item.cijena,
          kolicina: item.kolicina
        }))
      };

      const result = await api.createOrder(orderData);
      setOrderNumber(result.order_number);
      
      onOrderComplete(result);
      onClearCart();
      setStep('potvrda');
    } catch (error: any) {
      console.error('Error submitting order:', error);
      toast.error('Greška pri slanju narudžbe. Molimo pokušajte ponovno.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && step !== 'potvrda') {
    return (
      <div className="bg-[#0a0a0a] min-h-screen pt-32 flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-['Playfair_Display'] text-3xl text-[#e8d5a3] mb-4">Košarica je prazna</h2>
          <Link to="/parfemi" className="text-[#c9a96e] border border-[#c9a96e]/30 px-6 py-3 rounded-full hover:bg-[#c9a96e]/5 transition-all font-['Inter']">
            Pregledaj parfeme
          </Link>
        </div>
      </div>
    );
  }

  const inputCls = "w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] placeholder-[#e8d5a3]/25 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#c9a96e]/50 font-['Inter']";
  const labelCls = "text-[#e8d5a3]/50 text-xs font-['Inter'] uppercase tracking-wider mb-1.5 block";

  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-20 md:pt-28 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[#c9a96e] text-[10px] tracking-[0.5em] uppercase font-semibold font-['Inter'] mb-2">dekanti.hr</p>
          <h1 className="font-['Playfair_Display'] text-4xl md:text-5xl font-bold text-[#e8d5a3]">
            {step === 'potvrda' ? 'Narudžba potvrđena!' : 'Naručivanje'}
          </h1>
        </div>

        {/* Steps */}
        {step !== 'potvrda' && (
          <div className="flex items-center mb-10">
            {steps.slice(0, 3).map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  i < currentStepIdx ? 'text-[#c9a96e]' : i === currentStepIdx ? 'text-[#c9a96e] bg-[#c9a96e]/10 border border-[#c9a96e]/30' : 'text-[#e8d5a3]/25'
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i < currentStepIdx ? 'bg-[#c9a96e] text-[#0a0a0a]' : i === currentStepIdx ? 'bg-[#c9a96e] text-[#0a0a0a]' : 'bg-[#1a1a1a] border border-[#333]'
                  }`}>
                    {i < currentStepIdx ? <Check size={11} /> : i + 1}
                  </div>
                  <span className="text-xs font-['Inter'] font-medium hidden sm:block">{s.label}</span>
                </div>
                {i < 2 && <ChevronRight size={14} className="text-[#e8d5a3]/15 mx-1" />}
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Step 1: Podaci */}
            {step === 'podaci' && (
              <div className="bg-[#111111] border border-[#c9a96e]/10 rounded-2xl p-6 space-y-5">
                <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#e8d5a3] mb-2">Podaci za dostavu</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Ime *</label>
                    <input type="text" value={form.ime} onChange={e => updateForm('ime', e.target.value)} placeholder="Ivan" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Prezime *</label>
                    <input type="text" value={form.prezime} onChange={e => updateForm('prezime', e.target.value)} placeholder="Horvat" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Email adresa *</label>
                  <input type="email" value={form.email} onChange={e => updateForm('email', e.target.value)} placeholder="ivan@email.com" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Telefon *</label>
                  <input type="tel" value={form.telefon} onChange={e => updateForm('telefon', e.target.value)} placeholder="+385 91 234 5678" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Adresa *</label>
                  <input type="text" value={form.adresa} onChange={e => updateForm('adresa', e.target.value)} placeholder="Ilica 1" className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Grad *</label>
                    <input type="text" value={form.grad} onChange={e => updateForm('grad', e.target.value)} placeholder="Zagreb" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Poštanski broj *</label>
                    <input type="text" value={form.postanski_broj} onChange={e => updateForm('postanski_broj', e.target.value)} placeholder="10000" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Napomena (nije obavezno)</label>
                  <textarea value={form.napomena} onChange={e => updateForm('napomena', e.target.value)} rows={3} placeholder="Posebne napomene za dostavu..." className={`${inputCls} resize-none`} />
                </div>
                <button onClick={() => { if (validatePodaci()) setStep('dostava'); }} className="w-full bg-[#c9a96e] text-[#0a0a0a] py-4 rounded-2xl font-bold text-sm tracking-wider uppercase hover:bg-[#e8d5a3] transition-all">
                  Nastavi na plaćanje →
                </button>
              </div>
            )}

            {/* Step 2: Dostava/Plaćanje */}
            {step === 'dostava' && (
              <div className="bg-[#111111] border border-[#c9a96e]/10 rounded-2xl p-6 space-y-6">
                <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#e8d5a3]">Dostava i plaćanje</h2>

                {/* Dostava */}
                <div>
                  <label className="text-[#e8d5a3]/50 text-xs font-['Inter'] uppercase tracking-wider mb-3 block">Način dostave</label>
                  <div className="bg-[#0a0a0a] border border-[#c9a96e]/30 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border-2 border-[#c9a96e] flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#c9a96e]" />
                      </div>
                      <div>
                        <p className="text-[#e8d5a3]/80 text-sm font-semibold font-['Inter']">🚚 HP Pošta24</p>
                        <p className="text-[#e8d5a3]/35 text-xs font-['Inter']">1-2 radna dana · Praćenje pošiljke</p>
                      </div>
                    </div>
                    <span className="text-[#c9a96e] font-semibold text-sm font-['Inter']">
                      {dostava === 0 ? 'BESPLATNO' : `${dostava.toFixed(2)}€`}
                    </span>
                  </div>
                  {dostava > 0 && (
                    <p className="text-[#e8d5a3]/25 text-xs font-['Inter'] mt-2">
                      💡 Besplatna dostava za narudžbe iznad 50€
                    </p>
                  )}
                </div>

                {/* Plaćanje */}
                <div>
                  <label className="text-[#e8d5a3]/50 text-xs font-['Inter'] uppercase tracking-wider mb-3 block">Način plaćanja</label>
                  <div className="space-y-3">
                    {[
                      { value: 'pouzecem' as const, label: '💵 Pouzećem (COD)', desc: 'Plaćate gotovinom pri preuzimanju pošiljke' },
                      { value: 'bankovna' as const, label: '🏦 Bankovna transakcija', desc: 'Plaćanje na račun — podaci za uplatu u emailu' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => updateForm('nacin_placanja', opt.value)}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                          form.nacin_placanja === opt.value
                            ? 'border-[#c9a96e]/50 bg-[#c9a96e]/5'
                            : 'border-[#c9a96e]/15 hover:border-[#c9a96e]/30 bg-[#0a0a0a]'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          form.nacin_placanja === opt.value ? 'border-[#c9a96e]' : 'border-[#c9a96e]/30'
                        }`}>
                          {form.nacin_placanja === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-[#c9a96e]" />}
                        </div>
                        <div>
                          <p className="text-[#e8d5a3]/80 text-sm font-semibold font-['Inter']">{opt.label}</p>
                          <p className="text-[#e8d5a3]/35 text-xs font-['Inter']">{opt.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {form.nacin_placanja === 'bankovna' && (
                    <div className="mt-4 bg-blue-900/20 border border-blue-600/20 rounded-xl p-4">
                      <p className="text-blue-300/80 text-xs font-['Inter'] font-semibold mb-1">Podaci za uplatu:</p>
                      <p className="text-blue-300/60 text-xs font-['Inter']">IBAN: HR12 1234 5678 9012 3456 7</p>
                      <p className="text-blue-300/60 text-xs font-['Inter']">Primatelj: dekanti.hr</p>
                      <p className="text-blue-300/60 text-xs font-['Inter']">Opis: Narudžba [broj narudžbe]</p>
                      <p className="text-blue-300/50 text-xs font-['Inter'] mt-2">* Pošiljka se šalje nakon potvrde uplate</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep('podaci')} className="flex-1 border border-[#c9a96e]/25 text-[#c9a96e] py-3.5 rounded-2xl font-['Inter'] text-sm hover:bg-[#c9a96e]/5 transition-all">
                    ← Natrag
                  </button>
                  <button onClick={() => setStep('pregled')} className="flex-1 bg-[#c9a96e] text-[#0a0a0a] py-3.5 rounded-2xl font-bold text-sm tracking-wider uppercase hover:bg-[#e8d5a3] transition-all">
                    Pregled narudžbe →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Pregled */}
            {step === 'pregled' && (
              <div className="space-y-4">
                <div className="bg-[#111111] border border-[#c9a96e]/10 rounded-2xl p-6">
                  <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#e8d5a3] mb-4">Pregled narudžbe</h2>

                  {/* Items */}
                  <div className="space-y-3 mb-5">
                    {items.map(item => (
                      <div key={item.product_size_id} className="flex items-center gap-3 py-3 border-b border-[#c9a96e]/8">
                        <img src={item.image} alt={item.naziv} className="w-12 h-12 rounded-lg object-cover flex-shrink-0 opacity-80" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[#e8d5a3]/80 text-sm font-['Inter'] font-semibold truncate">{item.naziv} {item.ml}ml</p>
                          <p className="text-[#e8d5a3]/35 text-xs font-['Inter']">{item.brand} · {item.kolicina}x {item.cijena.toFixed(2)}€</p>
                        </div>
                        <span className="text-[#c9a96e] font-semibold text-sm font-['Inter'] flex-shrink-0">
                          {(item.cijena * item.kolicina).toFixed(2)}€
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Address */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[#e8d5a3]/30 text-[10px] uppercase tracking-wider font-['Inter'] mb-1">Dostava na adresu</p>
                      <p className="text-[#e8d5a3]/70 font-['Inter']">{form.ime} {form.prezime}</p>
                      <p className="text-[#e8d5a3]/50 font-['Inter'] text-xs">{form.adresa}</p>
                      <p className="text-[#e8d5a3]/50 font-['Inter'] text-xs">{form.postanski_broj} {form.grad}</p>
                      <p className="text-[#e8d5a3]/50 font-['Inter'] text-xs">{form.email}</p>
                      <p className="text-[#e8d5a3]/50 font-['Inter'] text-xs">{form.telefon}</p>
                    </div>
                    <div>
                      <p className="text-[#e8d5a3]/30 text-[10px] uppercase tracking-wider font-['Inter'] mb-1">Plaćanje</p>
                      <p className="text-[#e8d5a3]/70 font-['Inter']">
                        {form.nacin_placanja === 'pouzecem' ? '💵 Pouzećem' : '🏦 Bankovna transakcija'}
                      </p>
                      <p className="text-[#e8d5a3]/50 font-['Inter'] text-xs mt-1">🚚 HP Pošta24</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep('dostava')} className="flex-1 border border-[#c9a96e]/25 text-[#c9a96e] py-3.5 rounded-2xl font-['Inter'] text-sm hover:bg-[#c9a96e]/5 transition-all">
                    ← Natrag
                  </button>
                  <button
                    onClick={submitOrder}
                    disabled={isProcessing}
                    className="flex-1 bg-[#c9a96e] text-[#0a0a0a] py-3.5 rounded-2xl font-bold text-sm tracking-wider uppercase hover:bg-[#e8d5a3] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" />
                        Procesira se...
                      </>
                    ) : '✓ Potvrdi narudžbu'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Potvrda */}
            {step === 'potvrda' && (
              <div className="text-center">
                <div className="bg-[#111111] border border-[#c9a96e]/20 rounded-3xl p-10">
                  <div className="w-20 h-20 bg-[#c9a96e]/10 border-2 border-[#c9a96e] rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check size={32} className="text-[#c9a96e]" />
                  </div>
                  <h2 className="font-['Playfair_Display'] text-3xl font-bold text-[#e8d5a3] mb-2">Narudžba potvrđena!</h2>
                  <p className="text-[#e8d5a3]/50 font-['Inter'] font-light mb-6">
                    Hvala na narudžbi! Poslali smo potvrdu na {form.email}
                  </p>
                  <div className="bg-[#0a0a0a] border border-[#c9a96e]/20 rounded-2xl p-5 mb-6">
                    <p className="text-[#e8d5a3]/40 text-xs font-['Inter'] uppercase tracking-wider mb-1">Broj narudžbe</p>
                    <p className="text-[#c9a96e] font-['Playfair_Display'] text-2xl font-bold">{orderNumber}</p>
                  </div>
                  <div className="text-left space-y-2 mb-6">
                    <div className="flex justify-between text-sm font-['Inter']">
                      <span className="text-[#e8d5a3]/40">Status</span>
                      <span className="text-orange-400 font-semibold">🟡 Nova narudžba</span>
                    </div>
                    <div className="flex justify-between text-sm font-['Inter']">
                      <span className="text-[#e8d5a3]/40">Ukupno</span>
                      <span className="text-[#c9a96e] font-bold font-['Playfair_Display'] text-lg">{ukupno.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between text-sm font-['Inter']">
                      <span className="text-[#e8d5a3]/40">Plaćanje</span>
                      <span className="text-[#e8d5a3]/70">{form.nacin_placanja === 'pouzecem' ? 'Pouzećem' : 'Bankovna transakcija'}</span>
                    </div>
                  </div>
                  {form.nacin_placanja === 'bankovna' && (
                    <div className="bg-blue-900/20 border border-blue-600/20 rounded-xl p-4 mb-6 text-left">
                      <p className="text-blue-300/80 text-xs font-['Inter'] font-semibold mb-2">📧 Podaci za uplatu su poslani na vaš email.</p>
                      <p className="text-blue-300/60 text-xs font-['Inter']">IBAN: HR12 1234 5678 9012 3456 7</p>
                      <p className="text-blue-300/60 text-xs font-['Inter']">Poziv na broj: {orderNumber}</p>
                    </div>
                  )}
                  <div className="flex gap-3 justify-center">
                    <Link to={`/pracenje?broj=${orderNumber}`} className="border border-[#c9a96e]/30 text-[#c9a96e] px-6 py-3 rounded-xl font-['Inter'] text-sm hover:bg-[#c9a96e]/5 transition-all">
                      Prati narudžbu
                    </Link>
                    <Link to="/parfemi" className="bg-[#c9a96e] text-[#0a0a0a] px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#e8d5a3] transition-all">
                      Nastavite kupovinu
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          {step !== 'potvrda' && (
            <div>
              <div className="bg-[#111111] border border-[#c9a96e]/10 rounded-2xl p-5 sticky top-28">
                <h3 className="text-[#e8d5a3]/70 font-['Playfair_Display'] font-bold text-lg mb-4">Narudžba</h3>
                <div className="space-y-3 mb-4">
                  {items.map(item => (
                    <div key={item.product_size_id} className="flex items-center gap-2.5">
                      <div className="relative flex-shrink-0">
                        <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover opacity-80" />
                        <span className="absolute -top-1.5 -right-1.5 bg-[#c9a96e] text-[#0a0a0a] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                          {item.kolicina}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#e8d5a3]/70 text-xs font-['Inter'] truncate">{item.naziv} {item.ml}ml</p>
                      </div>
                      <span className="text-[#e8d5a3]/60 text-xs font-['Inter'] flex-shrink-0">{(item.cijena * item.kolicina).toFixed(2)}€</span>
                    </div>
                  ))}
                </div>
                <div className="h-[1px] bg-[#c9a96e]/10 mb-4" />
                <div className="space-y-2 text-xs font-['Inter']">
                  <div className="flex justify-between"><span className="text-[#e8d5a3]/40">Međuiznos</span><span className="text-[#e8d5a3]/70">{subtotal.toFixed(2)}€</span></div>
                  {popust > 0 && <div className="flex justify-between"><span className="text-green-400">Popust</span><span className="text-green-400">-{popust.toFixed(2)}€</span></div>}
                  <div className="flex justify-between"><span className="text-[#e8d5a3]/40">Dostava</span><span className={dostava === 0 ? 'text-green-400' : 'text-[#e8d5a3]/70'}>{dostava === 0 ? 'BESPLATNO' : `${dostava.toFixed(2)}€`}</span></div>
                </div>
                <div className="h-[1px] bg-[#c9a96e]/10 my-3" />
                <div className="flex justify-between">
                  <span className="text-[#e8d5a3] font-semibold font-['Inter'] text-sm">Ukupno</span>
                  <span className="text-[#c9a96e] font-['Playfair_Display'] font-bold text-xl">{ukupno.toFixed(2)}€</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
