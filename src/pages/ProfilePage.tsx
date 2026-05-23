import { useState, useEffect } from 'react';
import { useSearchParams, Link, Navigate } from 'react-router-dom';
import { User, Package, Heart, Lock, Edit3, Check, Truck, CheckCircle, Clock, XCircle, Tag, Copy } from 'lucide-react';
import { Order } from '../store/cartStore';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { formatDate } from '../utils/validation';

interface ProfilePageProps {
  user: { id: number; ime: string; prezime: string; email: string; role: string } | null;
  orders: Order[];
  wishlist: number[];
  onWishlistToggle: (id: number) => void;
  pendingCouponsCount?: number;
  onCouponsCountChange?: (count: number) => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  cekanje_uplate: { label: 'Čeka uplatu', color: 'text-purple-400', icon: <Clock size={12} /> },
  nova: { label: 'Nova', color: 'text-yellow-400', icon: <Clock size={12} /> },
  u_obradi: { label: 'U obradi', color: 'text-blue-400', icon: <Package size={12} /> },
  poslano: { label: 'Poslano', color: 'text-purple-400', icon: <Truck size={12} /> },
  isporuceno: { label: 'Isporučeno', color: 'text-green-400', icon: <CheckCircle size={12} /> },
  otkazano: { label: 'Otkazano', color: 'text-red-400', icon: <XCircle size={12} /> },
  povrat: { label: 'Povrat', color: 'text-orange-400', icon: <XCircle size={12} /> },
};

const DEFAULT_STATUS = { label: 'Nepoznato', color: 'text-[#e8d5a3]/40', icon: <Clock size={12} /> };

export default function ProfilePage({ user, orders, wishlist, onWishlistToggle, pendingCouponsCount = 0, onCouponsCountChange }: ProfilePageProps) {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') ?? 'profil');
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    ime: user?.ime ?? '',
    prezime: user?.prezime ?? '',
    email: user?.email ?? '',
    telefon: '',
    adresa: '',
    grad: '',
    postanski_broj: '',
  });

  const [products, setProducts] = useState<any[]>([]);
  const [dbOrders, setDbOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [userCoupons, setUserCoupons] = useState<any[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        const fetchedProducts = await api.getProducts();
        if (fetchedProducts) setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error loading products for wishlist:', error);
      }
    }
    loadProducts();
  }, []);

  // Fetch real orders from Supabase when orders tab is opened
  useEffect(() => {
    if (activeTab !== 'narudzbe' || !user?.email) return;
    setOrdersLoading(true);
    (async () => {
      try {
        const { supabase } = await import('../utils/supabase');
        const { data } = await supabase
          .from('orders')
          .select('*')
          .eq('email', user.email)
          .order('created_at', { ascending: false });
        if (data) setDbOrders(data);
      } catch {
        // ignore
      } finally {
        setOrdersLoading(false);
      }
    })();
  }, [activeTab, user?.email]);

  // Fetch user coupons when kuponi tab is opened
  useEffect(() => {
    if (activeTab !== 'kuponi' || !user?.id) return;
    setCouponsLoading(true);
    api.getUserCoupons(user.id)
      .then(data => setUserCoupons(data))
      .catch(() => {})
      .finally(() => setCouponsLoading(false));
  }, [activeTab, user?.id]);

  const handleActivateCoupon = async (userCouponId: number) => {
    try {
      await api.activateUserCoupon(userCouponId);
      // Refresh list
      const updated = await api.getUserCoupons(user!.id);
      setUserCoupons(updated);
      // Update pending count in parent
      const newCount = updated.filter((c: any) => c.status === 'pending').length;
      onCouponsCountChange?.(newCount);
      toast.success('Kupon aktiviran! Kopirajte kod i koristite ga pri narudžbi.');
    } catch {
      toast.error('Greška pri aktivaciji kupona');
    }
  };

  if (!user) return <Navigate to="/prijava" replace />;

  const wishlisted = products.filter(p => wishlist.includes(p.id));
  // Merge DB orders with localStorage orders, deduplicate by order_number
  const allOrders = [...dbOrders, ...orders].filter(
    (o, i, arr) => arr.findIndex(x => x.order_number === o.order_number) === i
  );

  const tabs = [
    { id: 'profil', label: 'Profil', icon: <User size={15} /> },
    { id: 'narudzbe', label: `Narudžbe (${allOrders.length})`, icon: <Package size={15} /> },
    { id: 'wishlist', label: `Wishlist (${wishlist.length})`, icon: <Heart size={15} /> },
    {
      id: 'kuponi',
      label: pendingCouponsCount > 0 ? `Kuponi (${pendingCouponsCount})` : 'Kuponi',
      icon: <Tag size={15} />,
      badge: pendingCouponsCount,
    },
    { id: 'sigurnost', label: 'Sigurnost', icon: <Lock size={15} /> },
  ];

  const handleSaveProfile = () => {
    setEditMode(false);
    toast.success('Profil uspješno ažuriran!');
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-20 md:pt-28 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-5 mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#c9a96e] to-[#e8d5a3] flex items-center justify-center text-[#0a0a0a] font-['DM_Sans'] font-bold text-2xl">
            {user.ime[0]}
          </div>
          <div>
            <p className="text-[#c9a96e] text-[10px] tracking-[0.4em] uppercase font-['Inter'] font-semibold">Moj profil</p>
            <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#e8d5a3]">{user.ime} {user.prezime}</h1>
            <p className="text-[#e8d5a3]/40 text-sm font-['Inter']">{user.email}</p>
          </div>
        </div>

        {/* Pending coupons notification banner */}
        {pendingCouponsCount > 0 && activeTab !== 'kuponi' && (
          <div className="mb-6 bg-[#c9a96e]/10 border border-[#c9a96e]/30 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
            <p className="text-[#e8d5a3] text-sm font-['Inter']">
              🎁 Imate <span className="text-[#c9a96e] font-bold">{pendingCouponsCount}</span> neaktiviran{pendingCouponsCount === 1 ? '' : pendingCouponsCount < 5 ? 'a' : 'ih'} kupon{pendingCouponsCount === 1 ? '' : pendingCouponsCount < 5 ? 'a' : 'a'}!
            </p>
            <button
              onClick={() => setActiveTab('kuponi')}
              className="text-[#c9a96e] text-sm font-['Inter'] font-semibold hover:text-[#e8d5a3] transition-colors whitespace-nowrap"
            >
              Pogledaj kupone →
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-[#111111] border border-[#c9a96e]/10 rounded-2xl p-1.5 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-['Inter'] whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#c9a96e] text-[#0a0a0a] font-bold'
                  : 'text-[#e8d5a3]/50 hover:text-[#e8d5a3]/80'
              }`}
            >
              {tab.icon}
              {tab.label}
              {'badge' in tab && (tab.badge ?? 0) > 0 && activeTab !== tab.id && (
                <span className="bg-[#c9a96e] text-[#0a0a0a] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Profil tab */}
        {activeTab === 'profil' && (
          <div className="bg-[#111111] border border-[#c9a96e]/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-['Playfair_Display'] text-xl font-bold text-[#e8d5a3]">Osobni podaci</h2>
              <button
                onClick={() => editMode ? handleSaveProfile() : setEditMode(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-['Inter'] font-semibold transition-all ${
                  editMode ? 'bg-[#c9a96e] text-[#0a0a0a]' : 'border border-[#c9a96e]/30 text-[#c9a96e] hover:bg-[#c9a96e]/5'
                }`}
              >
                {editMode ? <><Check size={13} />Spremi</> : <><Edit3 size={13} />Uredi</>}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Ime', field: 'ime' },
                { label: 'Prezime', field: 'prezime' },
                { label: 'Email', field: 'email' },
                { label: 'Telefon', field: 'telefon', placeholder: '+385 91 234 5678' },
                { label: 'Adresa', field: 'adresa', placeholder: 'Ilica 1' },
                { label: 'Grad', field: 'grad', placeholder: 'Zagreb' },
                { label: 'Poštanski broj', field: 'postanski_broj', placeholder: '10000' },
              ].map(f => (
                <div key={f.field}>
                  <label className="text-[#e8d5a3]/40 text-xs font-['Inter'] uppercase tracking-wider mb-1.5 block">{f.label}</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={profileForm[f.field as keyof typeof profileForm]}
                      onChange={e => setProfileForm(prev => ({ ...prev, [f.field]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] placeholder-[#e8d5a3]/25 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#c9a96e]/50 font-['Inter']"
                    />
                  ) : (
                    <p className="text-[#e8d5a3]/70 text-sm font-['Inter'] bg-[#0a0a0a] border border-[#c9a96e]/8 px-4 py-3 rounded-xl">
                      {profileForm[f.field as keyof typeof profileForm] || <span className="text-[#e8d5a3]/20 italic">Nije uneseno</span>}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Narudžbe tab */}
        {activeTab === 'narudzbe' && (
          <div className="space-y-4">
            {ordersLoading ? (
              <div className="text-center py-16">
                <div className="inline-block w-8 h-8 border-2 border-[#c9a96e]/30 border-t-[#c9a96e] rounded-full animate-spin" />
                <p className="text-[#e8d5a3]/40 mt-4 font-['Inter']">Učitavanje narudžbi...</p>
              </div>
            ) : allOrders.length === 0 ? (
              <div className="text-center py-16 bg-[#111111] border border-[#c9a96e]/10 rounded-2xl">
                <Package size={40} className="text-[#c9a96e]/20 mx-auto mb-3" />
                <p className="text-[#e8d5a3]/40 font-['Playfair_Display'] text-xl mb-2">Nema narudžbi</p>
                <Link to="/parfemi" className="text-[#c9a96e] text-sm hover:text-[#e8d5a3] transition-colors font-['Inter']">Pregledaj parfeme →</Link>
              </div>
            ) : (
              allOrders.map(order => {
                const cfg = STATUS_CONFIG[order.status] ?? DEFAULT_STATUS;
                return (
                  <div key={order.order_number} className="bg-[#111111] border border-[#c9a96e]/10 hover:border-[#c9a96e]/25 rounded-2xl p-5 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-[#c9a96e] font-['DM_Sans'] font-bold text-lg">{order.order_number}</p>
                        <p className="text-[#e8d5a3]/35 text-xs font-['Inter'] mt-0.5">{formatDate(order.created_at)}</p>
                      </div>
                      <div className={`flex items-center gap-1.5 text-xs font-['Inter'] font-semibold ${cfg.color}`}>
                        {cfg.icon}
                        {cfg.label}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-['Inter'] text-[#e8d5a3]/40">
                        {order.nacin_placanja === 'pouzecem' ? 'Pouzećem' : order.nacin_placanja === 'revolut' ? 'Revolut' : 'Bankovno'}
                        {order.placeno && <span className="ml-1 text-green-400 text-[8px] font-bold">plaćeno</span>}
                        {' · BoxNow paketomat'}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#c9a96e] font-['DM_Sans'] font-bold text-lg">{Number(order.ukupno).toFixed(2)}€</span>
                        <Link to={`/pracenje?broj=${order.order_number}`} className="text-[#c9a96e]/60 text-xs border border-[#c9a96e]/20 px-3 py-1.5 rounded-lg hover:bg-[#c9a96e]/5 transition-all font-['Inter']">
                          Prati →
                        </Link>
                      </div>
                    </div>
                    {order.tracking_broj && (
                      <div className="mt-3 pt-3 border-t border-[#c9a96e]/8">
                        <p className="text-[#e8d5a3]/30 text-[10px] font-['Inter']">Tracking: <span className="text-[#c9a96e]/60">{order.tracking_broj}</span></p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Wishlist tab */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlisted.length === 0 ? (
              <div className="text-center py-16 bg-[#111111] border border-[#c9a96e]/10 rounded-2xl">
                <Heart size={40} className="text-[#c9a96e]/20 mx-auto mb-3" />
                <p className="text-[#e8d5a3]/40 font-['Playfair_Display'] text-xl mb-2">Wishlist je prazan</p>
                <Link to="/parfemi" className="text-[#c9a96e] text-sm hover:text-[#e8d5a3] transition-colors font-['Inter']">Dodajte omiljene parfeme →</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {wishlisted.map(product => (
                  <div key={product.id} className="bg-[#111111] border border-[#c9a96e]/10 hover:border-[#c9a96e]/25 rounded-2xl overflow-hidden transition-all group">
                    <div className="relative">
                      <Link to={`/parfemi/${product.slug}`}>
                        <div className="h-40 overflow-hidden">
                          <img src={product.images && product.images.length > 0 ? product.images[0] : ''} alt={product.naziv} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80" />
                        </div>
                      </Link>
                      <button
                        onClick={() => onWishlistToggle(product.id)}
                        className="absolute top-3 right-3 w-8 h-8 bg-red-900/80 text-red-400 rounded-full flex items-center justify-center hover:bg-red-800 transition-all"
                      >
                        <Heart size={13} fill="currentColor" />
                      </button>
                    </div>
                    <div className="p-4">
                      <p className="text-[#c9a96e] text-[9px] tracking-[0.25em] uppercase font-['Inter'] mb-1">{product.brand?.naziv || product.brand}</p>
                      <Link to={`/parfemi/${product.slug}`} className="text-[#e8d5a3] font-['DM_Sans'] font-semibold hover:text-[#c9a96e] transition-colors block mb-2">{product.naziv}</Link>
                      <p className="text-[#c9a96e] font-['DM_Sans'] font-bold">od {product.product_sizes && product.product_sizes.length > 0 ? Math.min(...product.product_sizes.map((s: any) => s.cijena)).toFixed(2) : '0.00'}€</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Kuponi tab */}
        {activeTab === 'kuponi' && (
          <div className="space-y-4">
            {couponsLoading ? (
              <div className="text-center py-16">
                <div className="inline-block w-8 h-8 border-2 border-[#c9a96e]/30 border-t-[#c9a96e] rounded-full animate-spin" />
                <p className="text-[#e8d5a3]/40 mt-4 font-['Inter']">Učitavanje kupona...</p>
              </div>
            ) : userCoupons.length === 0 ? (
              <div className="text-center py-16 bg-[#111111] border border-[#c9a96e]/10 rounded-2xl">
                <Tag size={40} className="text-[#c9a96e]/20 mx-auto mb-3" />
                <p className="text-[#e8d5a3]/40 font-['Playfair_Display'] text-xl mb-2">Nema dostupnih kupona</p>
                <p className="text-[#e8d5a3]/25 text-sm font-['Inter']">Kuponi će se pojaviti ovdje kada ih admin pošalje</p>
              </div>
            ) : (
              userCoupons.map((uc: any) => {
                const coupon = uc.coupons;
                const isPending = uc.status === 'pending';
                const isActivated = uc.status === 'activated';
                const isUsed = uc.status === 'used';
                return (
                  <div key={uc.id} className={`bg-[#111111] border rounded-2xl p-5 transition-all ${
                    isActivated ? 'border-[#c9a96e]/40' : isUsed ? 'border-[#e8d5a3]/10 opacity-60' : 'border-[#c9a96e]/15'
                  }`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Tag size={14} className="text-[#c9a96e]" />
                          <p className="text-[#c9a96e] text-[10px] tracking-[0.3em] uppercase font-['Inter'] font-semibold">
                            {coupon?.tip === 'postotak' ? `${coupon?.vrijednost}% popusta` : `${coupon?.vrijednost}€ popusta`}
                          </p>
                        </div>

                        {/* Coupon code — blurred if pending, visible if activated */}
                        <div className={`font-['Playfair_Display'] text-2xl font-bold tracking-[0.2em] mb-2 transition-all ${
                          isPending ? 'blur-sm select-none text-[#e8d5a3]/50' : isActivated ? 'text-[#c9a96e]' : 'text-[#e8d5a3]/30'
                        }`}>
                          {coupon?.kod || '••••••'}
                        </div>

                        <div className="flex items-center gap-3 text-xs font-['Inter'] text-[#e8d5a3]/40">
                          {uc.expires_at && (
                            <span>Vrijedi do: {formatDate(uc.expires_at)}</span>
                          )}
                          <span>Dodano: {formatDate(uc.created_at)}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {isPending && (
                          <button
                            onClick={() => handleActivateCoupon(uc.id)}
                            className="bg-[#c9a96e] text-[#0a0a0a] px-4 py-2 rounded-xl text-xs font-['Inter'] font-bold hover:bg-[#e8d5a3] transition-all"
                          >
                            Aktiviraj
                          </button>
                        )}
                        {isActivated && (
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-green-400 text-xs font-['Inter'] font-semibold flex items-center gap-1">
                              <Check size={12} /> Aktiviran
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(coupon?.kod || '');
                                toast.success('Kod kopiran!');
                              }}
                              className="flex items-center gap-1.5 border border-[#c9a96e]/30 text-[#c9a96e] px-3 py-1.5 rounded-lg text-xs font-['Inter'] hover:bg-[#c9a96e]/5 transition-all"
                            >
                              <Copy size={11} /> Kopiraj kod
                            </button>
                          </div>
                        )}
                        {isUsed && (
                          <span className="text-[#e8d5a3]/30 text-xs font-['Inter'] font-semibold">Iskorišten</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Sigurnost tab */}
        {activeTab === 'sigurnost' && (
          <div className="bg-[#111111] border border-[#c9a96e]/10 rounded-2xl p-6 space-y-5">
            <h2 className="font-['Playfair_Display'] text-xl font-bold text-[#e8d5a3]">Promjena lozinke</h2>
            <div>
              <label className="text-[#e8d5a3]/40 text-xs font-['Inter'] uppercase tracking-wider mb-1.5 block">Trenutna lozinka</label>
              <input type="password" placeholder="••••••••" className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] placeholder-[#e8d5a3]/25 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#c9a96e]/50 font-['Inter']" />
            </div>
            <div>
              <label className="text-[#e8d5a3]/40 text-xs font-['Inter'] uppercase tracking-wider mb-1.5 block">Nova lozinka</label>
              <input type="password" placeholder="Min. 8 znakova" className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] placeholder-[#e8d5a3]/25 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#c9a96e]/50 font-['Inter']" />
            </div>
            <div>
              <label className="text-[#e8d5a3]/40 text-xs font-['Inter'] uppercase tracking-wider mb-1.5 block">Potvrda nove lozinke</label>
              <input type="password" placeholder="Ponovite novu lozinku" className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] placeholder-[#e8d5a3]/25 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#c9a96e]/50 font-['Inter']" />
            </div>
            <button onClick={() => toast.success('Lozinka uspješno promijenjena!')} className="bg-[#c9a96e] text-[#0a0a0a] px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#e8d5a3] transition-all font-['Inter']">
              Spremi novu lozinku
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
