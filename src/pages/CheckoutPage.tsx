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
  nacin_placanja: 'bankovna' | 'revolut';
}

export default function CheckoutPage({ items, coupon, subtotal, dostava, popust, ukupno, user, onOrderComplete, onClearCart }: CheckoutPageProps) {
  const [step, setStep] = useState<Step>('podaci');
  const [orderNumber, setOrderNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
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
  const revolutLink = api.buildRevolutLink();

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
      : `Narudžba ${orderNumberStr} — dekanti.hr`;
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
      `<div style="max-width:560px;margin:0 auto;background:#0a0a0a;color:#e8d5a3;font-family:Arial,sans-serif;border-radius:16px;overflow:hidden;border:1px solid rgba(201,169,110,0.2)"><div style="background:#111;padding:24px;text-align:center;border-bottom:1px solid rgba(201,169,110,0.15)"><h1 style="font-family:Georgia,serif;color:#c9a96e;margin:0;font-size:24px;letter-spacing:2px">DEKANTI<span style="color:#e8d5a3">.HR</span></h1></div><div style="padding:32px 24px"><h2 style="color:#e8d5a3;font-size:20px;margin:0 0 8px">${heading}</h2><p style="color:#e8d5a3;opacity:0.6;margin:0 0 24px;font-size:14px">${note}</p><div style="background:#111;border:1px solid rgba(201,169,110,0.15);border-radius:12px;padding:16px;margin-bottom:24px"><p style="color:#e8d5a3;opacity:0.4;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px">Broj narudžbe</p><p style="color:#c9a96e;font-size:22px;font-weight:bold;margin:0;font-family:Georgia,serif">${orderNumberStr}</p></div>${paymentBlock}<p style="color:#e8d5a3;opacity:0.5;font-size:13px;margin:0 0 16px">Ukupno: <strong style="color:#c9a96e">${totalEur.toFixed(2)}€</strong></p><div style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);border-radius:12px;padding:16px"><p style="color:#4ade80;font-size:13px;font-weight:bold;margin:0 0 4px">📦 BoxNow dostava</p><p style="color:#4ade80;opacity:0.7;font-size:12px;margin:0">Pakiramo i šaljemo isti dan (do 14:00) nakon potvrde uplate. BoxNow paketomat — 1-2 radna dana.</p></div></div><div style="background:#111;padding:16px 24px;text-align:center;border-top:1px solid rgba(201,169,110,0.1)"><p style="color:#e8d5a3;opacity:0.3;font-size:11px;margin:0">dekanti.hr · Vaš niche parfem dućan</p></div></div>`
    ).catch(() => {});
  };

  const submitOrder = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);

    try {
      // Generate the order number ahead of time so it can be reused as the
      // Revolut payment reference (customer types it in the description).
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      const futureOrderNumber = `HR-${year}-${random}`;

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
            <p className="text-[#c9a96e] text-[10px] tracking-[0.5em] uppercase font-semibold font-['Inter'] mb-2">dekanti.hr</p>
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
                        <p className="text-[#e8d5a3]/80 text-sm font-semibold font-['Inter']">� BoxNow paketomat</p>
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
                      { value: 'bankovna' as const, label: '🏦 Bankovna transakcija', desc: 'Plaćanje na račun — podaci za uplatu u emailu' },
                      { value: 'revolut' as const, label: '💳 Revolut', desc: 'Brzo plaćanje putem Revolut me linka' },
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
                  {form.nacin_placanja === 'revolut' && (
                    <div className="mt-4 bg-purple-900/15 border border-purple-500/25 rounded-xl p-4">
                      <p className="text-purple-200/85 text-xs font-['Inter'] font-semibold mb-2">💳 Plaćanje Revolutom</p>
                      <p className="text-purple-200/55 text-xs font-['Inter'] leading-relaxed">
                        Nakon potvrde dobivate detalje plaćanja: Revolut handle, točan iznos i broj narudžbe za opis. Iznos i opis upisujete sami u Revolut aplikaciji.
                      </p>
                      <p className="text-purple-200/45 text-[11px] font-['Inter'] mt-2">
                        * Pošiljku šaljemo nakon ručne potvrde uplate (najčešće unutar 1 sata radnim danom).
                      </p>
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
                        {form.nacin_placanja === 'revolut' ? '💳 Revolut' : '🏦 Bankovna transakcija'}
                      </p>
                      <p className="text-[#e8d5a3]/50 font-['Inter'] text-xs mt-1">� BoxNow paketomat</p>
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

            {/* Revolut Payment Modal */}
            {showPaymentModal && pendingOrder && (
              <div className="bg-gradient-to-b from-[#141414] to-[#111111] border border-[#c9a96e]/20 rounded-3xl p-6 md:p-8 shadow-2xl">
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-2 border-purple-500/40 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/10">
                    <CreditCard size={28} className="text-purple-300" />
                  </div>
                  <h2 className="font-['Playfair_Display'] text-2xl md:text-3xl font-bold text-[#e8d5a3] mb-1">Plaćanje Revolutom</h2>
                  <p className="text-[#e8d5a3]/40 font-['Inter'] text-xs tracking-wide">
                    Detalji za uplatu — kopirajte i upišite u Revolut aplikaciji
                  </p>
                </div>

                {/* Three copy fields: amount, reference, handle */}
                <div className="space-y-3 mb-5">
                  {/* Amount */}
                  <div className="bg-[#0a0a0a] border border-[#c9a96e]/20 rounded-2xl p-4 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[#e8d5a3]/35 text-[10px] font-['Inter'] uppercase tracking-[0.18em] mb-1">Iznos</p>
                      <p className="text-[#c9a96e] font-['Playfair_Display'] text-3xl font-bold leading-none">
                        {pendingOrder.ukupno.toFixed(2)}€
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(pendingOrder.ukupno.toFixed(2))}
                      className="flex items-center gap-1.5 text-[#c9a96e] border border-[#c9a96e]/30 px-3 py-2 rounded-lg text-[11px] font-['Inter'] font-semibold hover:bg-[#c9a96e]/10 transition-all flex-shrink-0"
                      type="button"
                    >
                      <Copy size={11} />
                      Kopiraj iznos
                    </button>
                  </div>

                  {/* Reference */}
                  <div className="bg-[#0a0a0a] border border-purple-500/30 rounded-2xl p-4 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-purple-300/60 text-[10px] font-['Inter'] uppercase tracking-[0.18em] mb-1">Opis uplate (obavezno)</p>
                      <p className="text-purple-100 font-mono font-bold text-lg truncate">{orderNumber}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(orderNumber)}
                      className="flex items-center gap-1.5 text-purple-200 border border-purple-500/40 px-3 py-2 rounded-lg text-[11px] font-['Inter'] font-semibold hover:bg-purple-500/15 transition-all flex-shrink-0"
                      type="button"
                    >
                      <Copy size={11} />
                      Kopiraj opis
                    </button>
                  </div>

                  {/* Handle */}
                  <div className="bg-[#0a0a0a] border border-[#c9a96e]/15 rounded-2xl p-4 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[#e8d5a3]/35 text-[10px] font-['Inter'] uppercase tracking-[0.18em] mb-1">Primatelj</p>
                      <p className="text-[#e8d5a3]/85 font-['Inter'] text-sm font-semibold truncate">revolut.me/{revolutHandle}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(revolutLink)}
                      className="flex items-center gap-1.5 text-[#e8d5a3]/70 border border-[#c9a96e]/25 px-3 py-2 rounded-lg text-[11px] font-['Inter'] font-semibold hover:bg-[#c9a96e]/5 transition-all flex-shrink-0"
                      type="button"
                    >
                      <Copy size={11} />
                      Kopiraj link
                    </button>
                  </div>
                </div>

                {/* Open Revolut button */}
                <a
                  href={revolutLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white py-4 rounded-2xl font-bold text-sm tracking-[0.1em] uppercase transition-all flex items-center justify-center gap-2 mb-4 shadow-lg shadow-purple-600/20"
                >
                  <ExternalLink size={15} />
                  Otvori Revolut
                </a>

                {/* Instructions */}
                <div className="bg-[#0a0a0a] border border-[#c9a96e]/10 rounded-xl p-4 mb-5">
                  <p className="text-[#e8d5a3]/70 text-xs font-['Inter'] font-semibold mb-2.5 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#c9a96e]/15 text-[#c9a96e] text-[9px] flex items-center justify-center font-bold">i</span>
                    Upute za uplatu
                  </p>
                  <ol className="space-y-1.5 text-[#e8d5a3]/50 text-xs font-['Inter'] leading-relaxed">
                    <li className="flex gap-2"><span className="text-[#c9a96e] font-semibold">1.</span> Kliknite "Otvori Revolut" — otvara se profil <span className="text-[#c9a96e]">{revolutHandle}</span></li>
                    <li className="flex gap-2"><span className="text-[#c9a96e] font-semibold">2.</span> Upišite točan iznos: <span className="text-[#c9a96e] font-semibold">{pendingOrder.ukupno.toFixed(2)} EUR</span></li>
                    <li className="flex gap-2"><span className="text-purple-300 font-semibold">3.</span> U "Reference" / "Opis" upišite: <span className="text-purple-300 font-mono font-semibold">{orderNumber}</span></li>
                    <li className="flex gap-2"><span className="text-[#c9a96e] font-semibold">4.</span> Završite uplatu i vratite se ovdje</li>
                    <li className="flex gap-2"><span className="text-[#c9a96e] font-semibold">5.</span> Kliknite "Platio sam" — narudžba ide u red za potvrdu</li>
                  </ol>
                </div>

                <div className="bg-amber-900/15 border border-amber-500/20 rounded-xl p-3 mb-5">
                  <p className="text-amber-200/85 text-xs font-['Inter'] leading-relaxed">
                    <span className="font-semibold">Bitno:</span> upišite točan iznos i broj narudžbe — to nam omogućuje da brzo upoznamo vašu uplatu i pošaljemo paket isti dan.
                  </p>
                </div>

                {/* Confirm + cancel */}
                <div className="space-y-2">
                  <button
                    onClick={handleMarkAsPaid}
                    disabled={isProcessing}
                    className="w-full bg-[#c9a96e] text-[#0a0a0a] py-4 rounded-2xl font-bold text-sm tracking-[0.1em] uppercase hover:bg-[#e8d5a3] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#c9a96e]/10"
                    type="button"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" />
                        Spremam narudžbu...
                      </>
                    ) : (
                      <>
                        <Check size={16} />
                        Platio sam — pošalji narudžbu
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancelPayment}
                    disabled={isProcessing}
                    className="w-full text-[#e8d5a3]/40 py-2.5 rounded-xl text-xs font-['Inter'] hover:text-[#e8d5a3]/70 transition-all disabled:opacity-30"
                    type="button"
                  >
                    Odustani
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Potvrda */}
            {step === 'potvrda' && (() => {
              const total = pendingOrder?.ukupno ?? ukupno;
              const isRevolut = form.nacin_placanja === 'revolut';
              const isAwaitingRevolutConfirm = isRevolut && !paymentConfirmed;
              const headline = isAwaitingRevolutConfirm
                ? 'Provjeravamo uplatu'
                : 'Narudžba potvrđena!';
              const iconColor = isAwaitingRevolutConfirm
                ? 'border-purple-500/50 bg-purple-500/10'
                : 'border-[#c9a96e] bg-[#c9a96e]/10';
              const Icon = isAwaitingRevolutConfirm ? Clock : Check;
              const iconClass = isAwaitingRevolutConfirm ? 'text-purple-300' : 'text-[#c9a96e]';
              return (
                <div className="text-center">
                  <div className="bg-[#111111] border border-[#c9a96e]/20 rounded-3xl p-10">
                    <div className={`w-20 h-20 ${iconColor} border-2 rounded-full flex items-center justify-center mx-auto mb-6`}>
                      <Icon size={32} className={iconClass} />
                    </div>
                    <h2 className="font-['Playfair_Display'] text-3xl font-bold text-[#e8d5a3] mb-2">{headline}</h2>
                    <p className="text-[#e8d5a3]/50 font-['Inter'] font-light mb-6">
                      {isAwaitingRevolutConfirm
                        ? <>Provjeravamo dolaznu Revolut uplatu i šaljemo potvrdu na <span className="text-[#c9a96e]/80">{form.email}</span> čim je obrađena.</>
                        : <>Hvala na narudžbi! Poslali smo potvrdu na <span className="text-[#c9a96e]/80">{form.email}</span></>
                      }
                    </p>

                    {/* Status-specific banner */}
                    {isAwaitingRevolutConfirm ? (
                      <div className="bg-purple-900/15 border border-purple-500/25 rounded-xl p-4 mb-6 text-left">
                        <div className="flex items-start gap-3">
                          <Clock size={18} className="text-purple-300 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-purple-200/85 text-sm font-['Inter'] font-semibold mb-1">Ručna potvrda Revolut uplate</p>
                            <p className="text-purple-200/60 text-xs font-['Inter'] leading-relaxed">
                              Vašu uplatu provjeravamo ručno (osobni Revolut račun) — najčešće unutar 1 sata radnim danom.
                              Po potvrdi šaljemo paket isti dan ako je narudžba zaprimljena do 14:00.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-green-900/15 border border-green-500/20 rounded-xl p-4 mb-6 text-left">
                        <div className="flex items-start gap-3">
                          <Truck size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-green-300/80 text-sm font-['Inter'] font-semibold mb-1">Brza dostava</p>
                            <p className="text-green-300/60 text-xs font-['Inter']">
                              Pakiramo i šaljemo isti dan ako je narudžba primljena do 14:00.
                            </p>
                            <p className="text-green-300/50 text-xs font-['Inter'] mt-1">
                              BoxNow paketomat — 1-2 radna dana unutar Hrvatske
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-[#0a0a0a] border border-[#c9a96e]/20 rounded-2xl p-5 mb-6">
                      <p className="text-[#e8d5a3]/40 text-xs font-['Inter'] uppercase tracking-wider mb-1">Broj narudžbe</p>
                      <p className="text-[#c9a96e] font-['Playfair_Display'] text-2xl font-bold">{orderNumber}</p>
                    </div>
                    <div className="text-left space-y-2 mb-6">
                      <div className="flex justify-between text-sm font-['Inter']">
                        <span className="text-[#e8d5a3]/40">Status</span>
                        {isAwaitingRevolutConfirm ? (
                          <span className="text-purple-300 font-semibold">⏳ Čeka potvrdu uplate</span>
                        ) : isRevolut && paymentConfirmed ? (
                          <span className="text-green-400 font-semibold">✓ Plaćeno · Nova narudžba</span>
                        ) : (
                          <span className="text-orange-400 font-semibold">🟡 Nova narudžba</span>
                        )}
                      </div>
                      <div className="flex justify-between text-sm font-['Inter']">
                        <span className="text-[#e8d5a3]/40">Ukupno</span>
                        <span className="text-[#c9a96e] font-bold font-['Playfair_Display'] text-lg">{total.toFixed(2)}€</span>
                      </div>
                      <div className="flex justify-between text-sm font-['Inter']">
                        <span className="text-[#e8d5a3]/40">Plaćanje</span>
                        <span className="text-[#e8d5a3]/70">
                          {isRevolut ? 'Revolut' : 'Bankovna transakcija'}
                          {isRevolut && paymentConfirmed && <span className="text-green-400 ml-1">(plaćeno)</span>}
                        </span>
                      </div>
                    </div>

                    {form.nacin_placanja === 'bankovna' && (
                      <div className="bg-blue-900/20 border border-blue-600/20 rounded-xl p-4 mb-6 text-left">
                        <p className="text-blue-300/80 text-xs font-['Inter'] font-semibold mb-2">📧 Podaci za uplatu su poslani na vaš email.</p>
                        <p className="text-blue-300/60 text-xs font-['Inter']">IBAN: HR12 1234 5678 9012 3456 7</p>
                        <p className="text-blue-300/60 text-xs font-['Inter']">Poziv na broj: {orderNumber}</p>
                      </div>
                    )}

                    {isAwaitingRevolutConfirm && (
                      <div className="bg-[#0a0a0a] border border-purple-500/20 rounded-xl p-4 mb-6 text-left">
                        <p className="text-purple-200/80 text-xs font-['Inter'] font-semibold mb-2">Detalji uplate (za vašu evidenciju)</p>
                        <div className="space-y-1 text-xs font-['Inter']">
                          <div className="flex justify-between"><span className="text-[#e8d5a3]/40">Primatelj</span><span className="text-[#e8d5a3]/80">revolut.me/{revolutHandle}</span></div>
                          <div className="flex justify-between"><span className="text-[#e8d5a3]/40">Iznos</span><span className="text-[#c9a96e]">{total.toFixed(2)}€</span></div>
                          <div className="flex justify-between"><span className="text-[#e8d5a3]/40">Opis</span><span className="text-purple-200 font-mono">{orderNumber}</span></div>
                        </div>
                      </div>
                    )}

                    {isRevolut && paymentConfirmed && (
                      <div className="bg-purple-900/15 border border-purple-500/20 rounded-xl p-4 mb-6 text-left">
                        <p className="text-purple-300/80 text-xs font-['Inter'] font-semibold mb-1">💳 Revolut uplata potvrđena</p>
                        <p className="text-purple-300/50 text-xs font-['Inter']">Hvala! Vaša uplata je zabilježena i narudžba ide u obradu.</p>
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
              );
            })()}
          </div>

          {/* Order summary sidebar */}
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
