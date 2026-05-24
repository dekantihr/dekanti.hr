import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronRight, Package, CreditCard, ClipboardCheck, Copy, ExternalLink, Truck, Clock } from 'lucide-react';
import { CartItem, AppliedCoupon } from '../store/cartStore';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import ScrollReveal from '../components/ScrollReveal';

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
  nacin_placanja: 'revolut';
}

export default function CheckoutPage({ items, coupon, subtotal, dostava, popust, ukupno, user, onOrderComplete, onClearCart }: CheckoutPageProps) {
  const [step, setStep] = useState<Step>('podaci');
  const [orderNumber, setOrderNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [paymentTermsAccepted, setPaymentTermsAccepted] = useState(false);
  // Snapshot of totals + items captured at the moment user clicks
  // "Confirm order". Used so the modal still shows the correct numbers
  // after the cart has been cleared in the parent state.
  const [pendingOrder, setPendingOrder] = useState<{
    items: CartItem[];
    subtotal: number;
    dostava: number;
    popust: number;
    ukupno: number;
    couponId: number | null;
    paymentRef: string;
  } | null>(null);

  const revolutHandle = api.getRevolutHandle();
  // buildRevolutPayLink always carries the correct amount in cents (?amount=1940 for 19.40€)
  const buildRevolutPayLink = (amountEur: number) => api.buildRevolutLink(amountEur);

  const [form, setForm] = useState<FormData>({
    ime: user?.ime ?? '',
    prezime: user?.prezime ?? '',
    email: user?.email ?? '',
    telefon: '',
    adresa: '',
    grad: '',
    postanski_broj: '',
    napomena: '',
    nacin_placanja: 'revolut',
  });

  const updateForm = (field: keyof FormData, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const steps = [
    { id: 'podaci', label: 'Podaci', icon: <Package size={14} /> },
    { id: 'dostava', label: 'Plaćanje', icon: <CreditCard size={14} /> },
    { id: 'pregled', label: 'Pregled', icon: <ClipboardCheck size={14} /> },
    { id: 'potvrda', label: 'Potvrda', icon: <Check size={14} /> },
  ];

  const currentStepIdx = steps.findIndex(s => s.id === step);

  // Poll for payment confirmation while we're on the post-Revolut waiting screen.
  // The merchant marks the order paid in the admin panel — when that happens,
  // `placeno` flips to true and we surface a celebratory toast on the
  // confirmation screen without requiring the customer to refresh.
  useEffect(() => {
    if (step !== 'potvrda' || form.nacin_placanja !== 'revolut' || !orderNumber || paymentConfirmed) return;
    let cancelled = false;
    const interval = setInterval(async () => {
      try {
        const status = await api.checkPaymentStatus(orderNumber);
        if (!cancelled && status?.placeno) {
          setPaymentConfirmed(true);
          clearInterval(interval);
          toast.success('Vaša uplata je potvrđena, narudžba ide u pripremu.', {
            duration: 6000,
            style: { background: '#111111', color: '#e8d5a3', border: '1px solid rgba(201,169,110,0.3)' },
            iconTheme: { primary: '#c9a96e', secondary: '#0a0a0a' },
          });
        }
      } catch {
        // ignore transient errors — keep polling
      }
    }, 8000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [step, form.nacin_placanja, orderNumber, paymentConfirmed]);

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

  // Build the order payload from a snapshot of the cart (so it stays
  // correct after the cart is cleared in state).
  const buildOrderData = (
    snapshot: NonNullable<typeof pendingOrder>,
    opts: { paid: boolean; status: 'cekanje_uplate' | 'nova' }
  ) => ({
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
    cijena_dostave: snapshot.dostava,
    subtotal: snapshot.subtotal,
    popust_iznos: snapshot.popust,
    kupon_id: snapshot.couponId,
    ukupno: snapshot.ukupno,
    placeno: opts.paid,
    status: opts.status,
    payment_reference: snapshot.paymentRef,
    items: snapshot.items.map(item => ({
      product_size_id: item.product_size_id,
      naziv_proizvoda: item.naziv,
      brand_naziv: item.brand,
      ml: item.ml,
      cijena: item.cijena,
      kolicina: item.kolicina,
    })),
  });

  const sendOrderConfirmationEmail = (orderNumberStr: string, totalEur: number, awaitingPayment: boolean) => {
    const subject = awaitingPayment
      ? `Narudžba ${orderNumberStr} — uplata se obrađuje`
      : `Narudžba ${orderNumberStr} — dekantihr.com`;
    const heading = awaitingPayment
      ? `Hvala, ${form.ime}! Vaša narudžba čeka potvrdu uplate.`
      : `Hvala na narudžbi, ${form.ime}!`;
    const note = awaitingPayment
      ? `Vašu uplatu provjeravamo ručno (Revolut osobni račun) — najčešće unutar 1 sata. Po potvrdi šaljemo paket isti dan ako je narudžba zaprimljena do 14:00.`
      : `Vaša narudžba je zaprimljena i spremamo je za slanje.`;
    const paymentBlock = awaitingPayment
      ? `<div style="background:#0a0a0a;border:1px solid rgba(168,85,247,0.25);border-radius:12px;padding:16px;margin-bottom:24px"><p style="color:#c4b5fd;font-size:12px;font-weight:bold;margin:0 0 8px">💳 Plaćanje Revolutom</p><p style="color:#e8d5a3;opacity:0.6;font-size:12px;margin:0 0 4px">Iznos: <strong style="color:#c9a96e">${totalEur.toFixed(2)}€</strong></p><p style="color:#e8d5a3;opacity:0.6;font-size:12px;margin:0 0 4px">Primatelj: <strong>revolut.me/${revolutHandle}</strong></p><p style="color:#e8d5a3;opacity:0.6;font-size:12px;margin:0">Opis uplate: <strong>${orderNumberStr}</strong></p></div>`
      : '';
    api.sendEmail(
      form.email,
      subject,
      `<div style="max-width:560px;margin:0 auto;background:#0a0a0a;color:#e8d5a3;font-family:Arial,sans-serif;border-radius:16px;overflow:hidden;border:1px solid rgba(201,169,110,0.2)"><div style="background:#111;padding:24px;text-align:center;border-bottom:1px solid rgba(201,169,110,0.15)"><h1 style="font-family:Georgia,serif;color:#c9a96e;margin:0;font-size:24px;letter-spacing:2px">DEKANTI<span style="color:#e8d5a3">.HR</span></h1></div><div style="padding:32px 24px"><h2 style="color:#e8d5a3;font-size:20px;margin:0 0 8px">${heading}</h2><p style="color:#e8d5a3;opacity:0.6;margin:0 0 24px;font-size:14px">${note}</p><div style="background:#111;border:1px solid rgba(201,169,110,0.15);border-radius:12px;padding:16px;margin-bottom:24px"><p style="color:#e8d5a3;opacity:0.4;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px">Broj narudžbe</p><p style="color:#c9a96e;font-size:22px;font-weight:bold;margin:0;font-family:Georgia,serif">${orderNumberStr}</p></div>${paymentBlock}<p style="color:#e8d5a3;opacity:0.5;font-size:13px;margin:0 0 16px">Ukupno: <strong style="color:#c9a96e">${totalEur.toFixed(2)}€</strong></p><div style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);border-radius:12px;padding:16px"><p style="color:#4ade80;font-size:13px;font-weight:bold;margin:0 0 4px">📦 BoxNow dostava</p><p style="color:#4ade80;opacity:0.7;font-size:12px;margin:0">Pakiramo i šaljemo isti dan (do 14:00) nakon potvrde uplate. BoxNow paketomat — 1-2 radna dana.</p></div></div><div style="background:#111;padding:16px 24px;text-align:center;border-top:1px solid rgba(201,169,110,0.1)"><p style="color:#e8d5a3;opacity:0.3;font-size:11px;margin:0">dekantihr.com · Vaš niche parfem dućan</p></div></div>`
    ).catch(() => {});
  };

  const submitOrder = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);

    try {
      // Generate the order number server-side to avoid collisions.
      // This number is also used as the Revolut payment reference.
      const { supabase } = await import('../utils/supabase');
      let futureOrderNumber: string;
      try {
        const { data: generatedNumber, error: genError } = await supabase
          .rpc('generate_order_number');
        if (genError || !generatedNumber) throw genError;
        futureOrderNumber = generatedNumber as string;
      } catch {
        // Fallback to client-side generation
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        futureOrderNumber = `HR-${year}-${random}`;
      }

      const snapshot = {
        items: [...items],
        subtotal,
        dostava,
        popust,
        ukupno,
        couponId: coupon?.id ?? null,
        paymentRef: futureOrderNumber,
      };
      setPendingOrder(snapshot);
      setOrderNumber(futureOrderNumber);

      if (form.nacin_placanja === 'revolut') {
        // Personal Revolut.me cannot prefill amounts and has no webhook.
        // We therefore create the order with status `cekanje_uplate` so the
        // merchant sees it in their reconciliation queue and can flip it
        // once the matching incoming transfer lands in their Revolut app.
        setShowPaymentModal(true);
      } else {
        // Bank transfer — order is created right away and the customer
        // pays offline. Status starts in `nova` because the workflow
        // already supports manual reconciliation for bank transfers too.
        const orderData = buildOrderData(snapshot, { paid: false, status: 'nova' });
        const result = await api.createOrder(orderData);
        setOrderNumber(result.order_number);
        onOrderComplete(result);
        onClearCart();
        sendOrderConfirmationEmail(result.order_number, snapshot.ukupno, false);
        setStep('potvrda');
      }
    } catch (error: any) {
      console.error('Error submitting order:', error);
      toast.error(error?.message || 'Greška pri slanju narudžbe. Molimo pokušajte ponovno.');
    } finally {
      setIsProcessing(false);
    }
  };

  // After the customer pays in Revolut and clicks "Platio sam", we create
  // the order with `cekanje_uplate` and move them to the confirmation screen.
  // The merchant then verifies the payment from the Revolut app and marks
  // it as paid in the admin panel — at that point the polling effect above
  // detects `placeno` flipping to true and shows a confirmation toast.
  const handleMarkAsPaid = async () => {
    if (!pendingOrder || isProcessing) return;
    setIsProcessing(true);
    try {
      const orderData = buildOrderData(pendingOrder, { paid: false, status: 'cekanje_uplate' });
      const result = await api.createOrder(orderData);
      setOrderNumber(result.order_number);
      onOrderComplete(result);
      onClearCart();
      sendOrderConfirmationEmail(result.order_number, pendingOrder.ukupno, true);
      setShowPaymentModal(false);
      setStep('potvrda');
      toast.success('Hvala! Provjeravamo vašu uplatu.', {
        style: { background: '#111111', color: '#e8d5a3', border: '1px solid rgba(201,169,110,0.3)' },
        iconTheme: { primary: '#c9a96e', secondary: '#0a0a0a' },
      });
    } catch (error: any) {
      console.error('Failed to register pending payment:', error);
      toast.error(error?.message || 'Greška pri spremanju narudžbe. Pokušajte ponovno.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelPayment = () => {
    setShowPaymentModal(false);
    setPendingOrder(null);
    setOrderNumber('');
    setPaymentTermsAccepted(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Kopirano!', {
      style: { background: '#111111', color: '#e8d5a3', border: '1px solid rgba(201,169,110,0.3)' },
      iconTheme: { primary: '#c9a96e', secondary: '#0a0a0a' },
    });
  };

  if (items.length === 0 && step !== 'potvrda' && !showPaymentModal) {
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
        <ScrollReveal animation="fade-up">
          <div className="mb-8">
            <p className="text-[#c9a96e] text-[10px] tracking-[0.5em] uppercase font-semibold font-['Inter'] mb-2">dekantihr.com</p>
            <h1 className="font-['Playfair_Display'] text-4xl md:text-5xl font-bold text-[#e8d5a3]">
              {step === 'potvrda'
                ? (form.nacin_placanja === 'revolut' && !paymentConfirmed
                    ? 'Provjeravamo uplatu'
                    : 'Narudžba potvrđena!')
                : 'Naručivanje'}
            </h1>
          </div>
        </ScrollReveal>

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
          {/* Main content — full width when payment modal is open or on confirmation */}
          <div className={showPaymentModal || step === 'potvrda' ? 'lg:col-span-3' : 'lg:col-span-2'}>
            {/* Step 1: Podaci */}
            {step === 'podaci' && !showPaymentModal && (
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

            {/* Step 2: Dostava/Plaćanje — redesigned with logos */}
            {step === 'dostava' && !showPaymentModal && (
              <div className="space-y-5">
                {/* Delivery section */}
                <div className="bg-[#111111] border border-[#c9a96e]/10 rounded-2xl overflow-hidden">
                  <div className="px-6 pt-6 pb-4 border-b border-[#c9a96e]/8">
                    <p className="text-[#e8d5a3]/35 text-[10px] uppercase tracking-[0.25em] font-['Inter'] mb-1">Korak 2 od 3</p>
                    <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#e8d5a3]">Dostava i plaćanje</h2>
                  </div>

                  {/* BoxNow delivery card */}
                  <div className="p-6">
                    <p className="text-[#e8d5a3]/40 text-[10px] uppercase tracking-[0.2em] font-['Inter'] mb-3">Način dostave</p>
                    <div className="relative bg-[#0a0a0a] border-2 border-[#c9a96e]/40 rounded-2xl p-5 overflow-hidden">
                      {/* Selected indicator */}
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#c9a96e] flex items-center justify-center">
                        <Check size={11} className="text-[#0a0a0a]" strokeWidth={3} />
                      </div>
                      <div className="flex items-center gap-4">
                        {/* BoxNow logo — inline SVG for pixel-perfect rendering */}
                        <div className="w-14 h-14 rounded-xl flex-shrink-0 shadow-md overflow-hidden">
                          <svg width="56" height="56" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
                            <rect width="56" height="56" rx="12" fill="#44D62C"/>
                            <text x="28" y="24" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="18" fill="white" textAnchor="middle" dominantBaseline="middle">BOX</text>
                            <text x="28" y="42" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="18" fill="white" textAnchor="middle" dominantBaseline="middle">NOW</text>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-[#e8d5a3] text-sm font-bold font-['Inter'] mb-0.5">BoxNow paketomat</p>
                          <p className="text-[#e8d5a3]/45 text-xs font-['Inter']">1–2 radna dana · 200+ lokacija u HR · 24/7 preuzimanje</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[9px] bg-green-500/15 text-green-400 border border-green-500/25 px-2 py-0.5 rounded-full font-['Inter'] font-semibold">Praćenje pošiljke</span>
                            <span className="text-[9px] bg-[#c9a96e]/10 text-[#c9a96e] border border-[#c9a96e]/20 px-2 py-0.5 rounded-full font-['Inter'] font-semibold">SMS obavijest</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {dostava === 0 ? (
                            <div>
                              <p className="text-green-400 font-bold text-sm font-['Inter']">BESPLATNO</p>
                              <p className="text-[#e8d5a3]/30 text-[10px] font-['Inter'] line-through">2.99€</p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-[#c9a96e] font-bold text-lg font-['DM_Sans']">{dostava.toFixed(2)}€</p>
                              <p className="text-[#e8d5a3]/30 text-[10px] font-['Inter']">po narudžbi</p>
                            </div>
                          )}
                        </div>
                      </div>
                      {dostava > 0 && (
                        <div className="mt-3 pt-3 border-t border-[#c9a96e]/8 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#c9a96e]/50" />
                          <p className="text-[#e8d5a3]/35 text-[11px] font-['Inter']">
                            Besplatna dostava za narudžbe iznad <span className="text-[#c9a96e]">50€</span> — još {(50 - subtotal).toFixed(2)}€
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment section */}
                  <div className="px-6 pb-6">
                    <p className="text-[#e8d5a3]/40 text-[10px] uppercase tracking-[0.2em] font-['Inter'] mb-3">Način plaćanja</p>

                    {/* Single payment option — card/online */}
                    <div className="bg-[#0a0a0a] border-2 border-[#c9a96e]/30 rounded-2xl overflow-hidden">
                      {/* Header */}
                      <div className="p-4 flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-[#c9a96e] flex items-center justify-center flex-shrink-0">
                          <Check size={11} className="text-[#0a0a0a]" strokeWidth={3} />
                        </div>
                        <div className="flex-1">
                          <p className="text-[#e8d5a3]/90 text-sm font-bold font-['Inter']">Online plaćanje</p>
                          <p className="text-[#e8d5a3]/40 text-xs font-['Inter']">Sigurno · Brzo · Potvrda unutar 1h</p>
                        </div>
                        {/* Accepted methods */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {/* Visa */}
                          <div className="bg-[#1a1f71] rounded px-1.5 py-0.5 flex items-center">
                            <span className="text-white text-[9px] font-black tracking-tight font-['Inter']">VISA</span>
                          </div>
                          {/* Mastercard */}
                          <div className="flex items-center -space-x-1">
                            <div className="w-4 h-4 rounded-full bg-[#eb001b] opacity-90" />
                            <div className="w-4 h-4 rounded-full bg-[#f79e1b] opacity-90" />
                          </div>
                          {/* Apple Pay */}
                          <div className="bg-black border border-white/10 rounded px-1.5 py-0.5">
                            <span className="text-white text-[9px] font-semibold font-['Inter'] tracking-tight"> Pay</span>
                          </div>
                        </div>
                      </div>

                      {/* Info box */}
                      <div className="mx-4 mb-4 bg-[#111111] border border-[#c9a96e]/10 rounded-xl p-3">
                        <p className="text-[#e8d5a3]/55 text-[11px] font-['Inter'] leading-relaxed">
                          Nakon potvrde narudžbe otvorit će se sigurna stranica za plaćanje. Unesite podatke kartice ili platite Apple Pay / Google Pay. <span className="text-[#c9a96e]/80">Ne trebate nikakav račun.</span>
                        </p>
                      </div>

                      {/* Trust row */}
                      <div className="px-4 pb-4 flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-[#e8d5a3]/30 text-[10px] font-['Inter']">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#c9a96e]/50"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                          SSL zaštita
                        </div>
                        <div className="flex items-center gap-1.5 text-[#e8d5a3]/30 text-[10px] font-['Inter']">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#c9a96e]/50"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                          Sigurno plaćanje
                        </div>
                        <div className="flex items-center gap-1.5 text-[#e8d5a3]/30 text-[10px] font-['Inter']">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#c9a96e]/50"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                          Bez registracije
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Security badges — removed emojis */}
                  <div className="px-6 pb-5 flex items-center gap-5 flex-wrap border-t border-[#c9a96e]/8 pt-4">
                    <div className="flex items-center gap-1.5 text-[#e8d5a3]/25 text-[10px] font-['Inter']">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#c9a96e]/30"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                      SSL zaštita
                    </div>
                    <div className="flex items-center gap-1.5 text-[#e8d5a3]/25 text-[10px] font-['Inter']">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#c9a96e]/30"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      Sigurna kupnja
                    </div>
                    <div className="flex items-center gap-1.5 text-[#e8d5a3]/25 text-[10px] font-['Inter']">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#c9a96e]/30"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                      Praćenje paketa
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep('podaci')} className="flex-1 border border-[#c9a96e]/20 text-[#c9a96e]/70 py-3.5 rounded-2xl font-['Inter'] text-sm hover:border-[#c9a96e]/40 hover:text-[#c9a96e] transition-all">
                    ← Natrag
                  </button>
                  <button onClick={() => setStep('pregled')} className="flex-1 bg-[#c9a96e] text-[#0a0a0a] py-3.5 rounded-2xl font-bold text-sm tracking-wider uppercase hover:bg-[#e8d5a3] transition-all shadow-lg shadow-[#c9a96e]/15">
                    Pregled narudžbe →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Pregled */}
            {step === 'pregled' && !showPaymentModal && (
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
                        {form.nacin_placanja === 'revolut' ? 'Kartica / Apple Pay / Revolut' : 'Kartica / Apple Pay / Revolut'}
                      </p>
                      <p className="text-[#e8d5a3]/50 font-['Inter'] text-xs mt-1">BoxNow paketomat</p>
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
                    ) : (
                      <span className="flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        Potvrdi narudžbu
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && pendingOrder && (
              <div className="max-w-lg mx-auto">
                <div className="bg-[#111111] border border-[#c9a96e]/15 rounded-2xl overflow-hidden">

                  {/* Top accent */}
                  <div className="h-px bg-gradient-to-r from-transparent via-[#c9a96e]/40 to-transparent" />

                  {/* Header */}
                  <div className="px-6 pt-6 pb-5 border-b border-[#c9a96e]/8">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#e8d5a3]/35 text-[10px] tracking-[0.25em] uppercase font-['Inter'] mb-1">Narudžba {orderNumber}</p>
                        <h2 className="font-['Inter'] text-2xl font-bold text-[#e8d5a3] tracking-tight">
                          Plaćanje
                        </h2>
                      </div>
                      <div className="text-right">
                        <p className="text-[#e8d5a3]/30 text-[10px] font-['Inter'] uppercase tracking-wider mb-1">Iznos</p>
                        <p className="font-['DM_Sans'] text-3xl font-bold text-[#c9a96e] tracking-tight">
                          {pendingOrder.ukupno.toFixed(2)}€
                        </p>
                      </div>
                    </div>

                    {/* Accepted methods row */}
                    <div className="flex items-center gap-2 mt-4">
                      <div className="bg-[#1a1f71] rounded-md px-2 py-1">
                        <span className="text-white text-[10px] font-black tracking-tight font-['Inter']">VISA</span>
                      </div>
                      <div className="flex items-center -space-x-1.5">
                        <div className="w-5 h-5 rounded-full bg-[#eb001b] border border-[#111]" />
                        <div className="w-5 h-5 rounded-full bg-[#f79e1b] border border-[#111]" />
                      </div>
                      <div className="bg-[#1a1a1a] border border-white/10 rounded-md px-2 py-1">
                        <span className="text-white text-[10px] font-semibold font-['Inter'] tracking-tight"> Pay</span>
                      </div>
                      <div className="bg-[#1a1a1a] border border-white/10 rounded-md px-2 py-1">
                        <span className="text-white text-[10px] font-semibold font-['Inter'] tracking-tight">G Pay</span>
                      </div>
                      <span className="text-[#e8d5a3]/20 text-[10px] font-['Inter'] ml-1">+ Revolut</span>
                    </div>
                  </div>

                  <div className="px-6 py-5 space-y-4">

                    {/* Step 1 — Pay button */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-5 h-5 rounded-full bg-[#c9a96e]/15 border border-[#c9a96e]/30 flex items-center justify-center flex-shrink-0">
                          <span className="text-[#c9a96e] text-[10px] font-bold font-['Inter']">1</span>
                        </div>
                        <p className="text-[#e8d5a3]/60 text-xs font-['Inter'] uppercase tracking-wider">Otvorite stranicu za plaćanje</p>
                      </div>
                      <a
                        href={buildRevolutPayLink(pendingOrder.ukupno)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-[#c9a96e] hover:bg-[#e8d5a3] text-[#0a0a0a] py-4 rounded-xl font-['Inter'] font-bold text-sm tracking-wide transition-all"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                        Plati karticom ili Apple Pay
                      </a>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-[#c9a96e]/8" />

                    {/* Step 2 — Copy details */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-5 h-5 rounded-full bg-[#c9a96e]/15 border border-[#c9a96e]/30 flex items-center justify-center flex-shrink-0">
                          <span className="text-[#c9a96e] text-[10px] font-bold font-['Inter']">2</span>
                        </div>
                        <p className="text-[#e8d5a3]/60 text-xs font-['Inter'] uppercase tracking-wider">Unesite točan iznos i opis</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-[#0a0a0a] border border-[#c9a96e]/12 rounded-xl p-3">
                          <p className="text-[#e8d5a3]/30 text-[9px] uppercase tracking-wider font-['Inter'] mb-1.5">Iznos</p>
                          <div className="flex items-center justify-between">
                            <span className="text-[#c9a96e] font-['DM_Sans'] font-bold text-lg tracking-tight">{pendingOrder.ukupno.toFixed(2)}€</span>
                            <button onClick={() => copyToClipboard(pendingOrder.ukupno.toFixed(2))} className="text-[#e8d5a3]/25 hover:text-[#c9a96e] transition-colors p-1" type="button">
                              <Copy size={13} />
                            </button>
                          </div>
                        </div>
                        <div className="bg-[#0a0a0a] border border-[#c9a96e]/12 rounded-xl p-3">
                          <p className="text-[#e8d5a3]/30 text-[9px] uppercase tracking-wider font-['Inter'] mb-1.5">Opis uplate</p>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[#e8d5a3]/70 font-['Inter'] text-xs font-semibold truncate">{orderNumber}</span>
                            <button onClick={() => copyToClipboard(orderNumber)} className="text-[#e8d5a3]/25 hover:text-[#c9a96e] transition-colors p-1 flex-shrink-0" type="button">
                              <Copy size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                      <p className="text-[#e8d5a3]/30 text-[11px] font-['Inter'] mt-2 leading-relaxed">
                        Unesite <span className="text-[#c9a96e]/80">točan iznos</span> i <span className="text-[#c9a96e]/80">broj narudžbe</span> kao opis — bez toga ne možemo identificirati vašu uplatu.
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-[#c9a96e]/8" />

                    {/* Step 3 — Confirm */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-5 h-5 rounded-full bg-[#c9a96e]/15 border border-[#c9a96e]/30 flex items-center justify-center flex-shrink-0">
                          <span className="text-[#c9a96e] text-[10px] font-bold font-['Inter']">3</span>
                        </div>
                        <p className="text-[#e8d5a3]/60 text-xs font-['Inter'] uppercase tracking-wider">Potvrdite da ste platili</p>
                      </div>

                      {/* Checkbox */}
                      <button
                        onClick={() => setPaymentTermsAccepted(v => !v)}
                        className={`w-full flex items-start gap-3 text-left p-3.5 rounded-xl border transition-all mb-3 ${
                          paymentTermsAccepted
                            ? 'border-[#c9a96e]/30 bg-[#c9a96e]/5'
                            : 'border-[#c9a96e]/10 bg-[#0a0a0a] hover:border-[#c9a96e]/20'
                        }`}
                        type="button"
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                          paymentTermsAccepted ? 'bg-[#c9a96e] border-[#c9a96e]' : 'border-[#c9a96e]/30'
                        }`}>
                          {paymentTermsAccepted && <Check size={10} className="text-[#0a0a0a]" strokeWidth={3} />}
                        </div>
                        <p className="text-[#e8d5a3]/50 text-[11px] font-['Inter'] leading-relaxed">
                          Uplatio/la sam <span className="text-[#c9a96e]">{pendingOrder.ukupno.toFixed(2)}€</span> na{' '}
                          <span className="text-[#e8d5a3]/70">{revolutHandle}</span> s opisom{' '}
                          <span className="text-[#e8d5a3]/70 font-semibold">{orderNumber}</span>. Razumijem da pogrešan iznos znači da narudžba neće biti poslana — sukladno{' '}
                          <Link to="/uvjeti" target="_blank" onClick={e => e.stopPropagation()} className="text-[#c9a96e]/70 underline underline-offset-2">uvjetima</Link>.
                        </p>
                      </button>

                      <button
                        onClick={handleMarkAsPaid}
                        disabled={isProcessing || !paymentTermsAccepted}
                        className={`w-full py-4 rounded-xl font-['Inter'] font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 ${
                          paymentTermsAccepted && !isProcessing
                            ? 'bg-[#c9a96e] text-[#0a0a0a] hover:bg-[#e8d5a3]'
                            : 'bg-[#c9a96e]/10 text-[#c9a96e]/25 cursor-not-allowed'
                        }`}
                        type="button"
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                            Registriram narudžbu...
                          </>
                        ) : (
                          <>
                            <Check size={14} />
                            Platio sam — pošalji narudžbu
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-6 pb-5">
                    <button
                      onClick={handleCancelPayment}
                      disabled={isProcessing}
                      className="w-full text-[#e8d5a3]/25 py-2 text-xs font-['Inter'] hover:text-[#e8d5a3]/50 transition-colors disabled:opacity-30"
                      type="button"
                    >
                      Odustani od plaćanja
                    </button>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-[#c9a96e]/15 to-transparent" />
                </div>
              </div>
            )}

            {/* Step 4: Potvrda — full redesign */}
            {step === 'potvrda' && (() => {
              const total = pendingOrder?.ukupno ?? ukupno;
              const isRevolut = form.nacin_placanja === 'revolut';
              const isAwaiting = isRevolut && !paymentConfirmed;
              return (
                <div className="max-w-2xl mx-auto space-y-4">
                  {/* Hero confirmation card */}
                  <div className={`relative overflow-hidden rounded-3xl ${
                    isAwaiting
                      ? 'bg-gradient-to-br from-[#0f0a1e] via-[#120d20] to-[#0a0a0a]'
                      : 'bg-gradient-to-br from-[#0a1a0f] via-[#0d1a10] to-[#0a0a0a]'
                  }`}>
                    {/* Ambient glow */}
                    <div className={`absolute inset-0 ${
                      isAwaiting
                        ? 'bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.15),transparent_60%)]'
                        : 'bg-[radial-gradient(ellipse_at_top,rgba(201,169,110,0.12),transparent_60%)]'
                    }`} />
                    <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${
                      isAwaiting ? 'via-purple-500/50' : 'via-[#c9a96e]/50'
                    } to-transparent`} />

                    <div className="relative p-8 md:p-10 text-center">
                      {/* Icon */}
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                        isAwaiting
                          ? 'bg-purple-500/15 border-2 border-purple-500/40 shadow-lg shadow-purple-500/20'
                          : 'bg-[#c9a96e]/15 border-2 border-[#c9a96e]/50 shadow-lg shadow-[#c9a96e]/20'
                      }`}>
                        {isAwaiting
                          ? <Clock size={36} className="text-purple-300" />
                          : <Check size={36} className="text-[#c9a96e]" strokeWidth={2.5} />
                        }
                      </div>

                      <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-white mb-3">
                        {isAwaiting ? 'Narudžba zaprimljena' : 'Narudžba potvrđena!'}
                      </h2>
                      <p className="text-white/50 font-['Inter'] font-light text-sm leading-relaxed max-w-sm mx-auto">
                        {isAwaiting
                          ? <>Provjeravamo vašu Revolut uplatu. Potvrda stiže na <span className="text-white/80">{form.email}</span> čim je obrađena.</>
                          : <>Hvala, {form.ime}! Potvrda narudžbe poslana je na <span className="text-white/80">{form.email}</span>.</>
                        }
                      </p>

                      {/* Order number */}
                      <div className="mt-6 inline-block bg-black/30 border border-white/10 rounded-2xl px-6 py-4">
                        <p className="text-white/30 text-[9px] uppercase tracking-[0.25em] font-['Inter'] mb-1">Broj narudžbe</p>
                        <p className={`font-['DM_Sans'] text-2xl font-bold ${isAwaiting ? 'text-purple-200' : 'text-[#c9a96e]'}`}>
                          {orderNumber}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status cards row */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        icon: isAwaiting ? '⏳' : '✅',
                        label: 'Plaćanje',
                        value: isAwaiting ? 'Čeka potvrdu' : 'Potvrđeno',
                        color: isAwaiting ? 'text-purple-300' : 'text-green-400',
                      },
                      {
                        icon: '💰',
                        label: 'Ukupno',
                        value: `${total.toFixed(2)}€`,
                        color: 'text-[#c9a96e]',
                      },
                      {
                        icon: '📦',
                        label: 'Dostava',
                        value: '1–2 dana',
                        color: 'text-[#e8d5a3]/70',
                      },
                    ].map(card => (
                      <div key={card.label} className="bg-[#111111] border border-[#c9a96e]/10 rounded-2xl p-4 text-center">
                        <p className="text-xl mb-1">{card.icon}</p>
                        <p className="text-[#e8d5a3]/35 text-[9px] uppercase tracking-[0.15em] font-['Inter'] mb-1">{card.label}</p>
                        <p className={`text-sm font-bold font-['Inter'] ${card.color}`}>{card.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Revolut awaiting detail */}
                  {isAwaiting && (
                    <div className="bg-[#111111] border border-purple-500/20 rounded-2xl p-5">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/15 flex items-center justify-center flex-shrink-0">
                          <Clock size={16} className="text-purple-300" />
                        </div>
                        <div>
                          <p className="text-white/80 text-sm font-semibold font-['Inter'] mb-1">Ručna provjera uplate</p>
                          <p className="text-white/45 text-xs font-['Inter'] leading-relaxed">
                            Koristimo osobni Revolut račun — uplatu provjeravamo ručno, najčešće unutar 1 sata radnim danom. Po potvrdi šaljemo paket isti dan (do 14:00).
                          </p>
                        </div>
                      </div>
                      <div className="bg-black/30 border border-purple-500/15 rounded-xl p-3 space-y-2">
                        <p className="text-purple-200/60 text-[10px] uppercase tracking-[0.15em] font-['Inter'] mb-2">Detalji vaše uplate</p>
                        {[
                          ['Primatelj', `revolut.me/${revolutHandle}`],
                          ['Iznos', `${total.toFixed(2)} EUR`],
                          ['Opis', orderNumber],
                        ].map(([k, v]) => (
                          <div key={k} className="flex justify-between text-xs font-['Inter']">
                            <span className="text-white/30">{k}</span>
                            <span className={k === 'Opis' ? 'text-purple-200 font-mono' : k === 'Iznos' ? 'text-[#c9a96e] font-semibold' : 'text-white/70'}>{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Revolut confirmed */}
                  {isRevolut && paymentConfirmed && (
                    <div className="bg-[#111111] border border-green-500/20 rounded-2xl p-5 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-green-500/15 flex items-center justify-center flex-shrink-0">
                        <Check size={16} className="text-green-400" strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-green-300/90 text-sm font-semibold font-['Inter'] mb-1">Uplata potvrđena</p>
                        <p className="text-green-300/55 text-xs font-['Inter']">Vaša uplata je zabilježena. Narudžba ide u pripremu i šaljemo je isti dan.</p>
                      </div>
                    </div>
                  )}

                  {/* Delivery info */}
                  <div className="bg-[#111111] border border-[#c9a96e]/10 rounded-2xl p-5 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#c9a96e]/10 flex items-center justify-center flex-shrink-0">
                      <Truck size={16} className="text-[#c9a96e]" />
                    </div>
                    <div>
                      <p className="text-[#e8d5a3]/80 text-sm font-semibold font-['Inter'] mb-1">BoxNow paketomat · 1–2 radna dana</p>
                      <p className="text-[#e8d5a3]/40 text-xs font-['Inter'] leading-relaxed">
                        {isAwaiting
                          ? 'Pakiramo i šaljemo isti dan (do 14:00) nakon potvrde uplate. Kod za preuzimanje stiže SMS-om.'
                          : 'Pakiramo i šaljemo isti dan ako je narudžba primljena do 14:00. Kod za preuzimanje stiže SMS-om.'
                        }
                      </p>
                    </div>
                  </div>

                  {/* CTA buttons */}
                  <div className="flex gap-3">
                    <Link
                      to={`/pracenje?broj=${orderNumber}`}
                      className="flex-1 border border-[#c9a96e]/25 text-[#c9a96e] py-3.5 rounded-2xl font-['Inter'] text-sm text-center hover:bg-[#c9a96e]/5 hover:border-[#c9a96e]/40 transition-all"
                    >
                      Prati narudžbu
                    </Link>
                    <Link
                      to="/parfemi"
                      className="flex-1 bg-[#c9a96e] text-[#0a0a0a] py-3.5 rounded-2xl font-bold text-sm text-center hover:bg-[#e8d5a3] transition-all shadow-lg shadow-[#c9a96e]/15"
                    >
                      Nastavi kupovinu
                    </Link>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Order summary sidebar — hidden when modal is open or on confirmation */}
          {step !== 'potvrda' && !showPaymentModal && (
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
                  <span className="text-[#c9a96e] font-['DM_Sans'] font-bold text-xl">{ukupno.toFixed(2)}€</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
