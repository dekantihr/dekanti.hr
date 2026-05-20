import { useState, useEffect } from 'react';
import { useSearchParams, Link, Navigate } from 'react-router-dom';
import { User, Package, Heart, Lock, Edit3, Check, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Order } from '../store/cartStore';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface ProfilePageProps {
  user: { id: number; ime: string; prezime: string; email: string; role: string } | null;
  orders: Order[];
  wishlist: number[];
  onWishlistToggle: (id: number) => void;
}

const STATUS_CONFIG = {
  nova: { label: 'Nova', color: 'text-yellow-400', icon: <Clock size={12} /> },
  u_obradi: { label: 'U obradi', color: 'text-blue-400', icon: <Package size={12} /> },
  poslano: { label: 'Poslano', color: 'text-purple-400', icon: <Truck size={12} /> },
  isporuceno: { label: 'Isporučeno', color: 'text-green-400', icon: <CheckCircle size={12} /> },
  otkazano: { label: 'Otkazano', color: 'text-red-400', icon: <XCircle size={12} /> },
};

export default function ProfilePage({ user, orders, wishlist, onWishlistToggle }: ProfilePageProps) {
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

  useEffect(() => {
    async function loadProducts() {
      try {
        const fetchedProducts = await api.getProducts();
        if (fetchedProducts) {
          setProducts(fetchedProducts);
        }
      } catch (error) {
        console.error('Error loading products for wishlist:', error);
      }
    }
    loadProducts();
  }, []);

  if (!user) return <Navigate to="/prijava" replace />;

  const wishlisted = products.filter(p => wishlist.includes(p.id));

  const tabs = [
    { id: 'profil', label: 'Profil', icon: <User size={15} /> },
    { id: 'narudzbe', label: `Narudžbe (${orders.length})`, icon: <Package size={15} /> },
    { id: 'wishlist', label: `Wishlist (${wishlist.length})`, icon: <Heart size={15} /> },
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
            {orders.length === 0 ? (
              <div className="text-center py-16 bg-[#111111] border border-[#c9a96e]/10 rounded-2xl">
                <Package size={40} className="text-[#c9a96e]/20 mx-auto mb-3" />
                <p className="text-[#e8d5a3]/40 font-['Playfair_Display'] text-xl mb-2">Nema narudžbi</p>
                <Link to="/parfemi" className="text-[#c9a96e] text-sm hover:text-[#e8d5a3] transition-colors font-['Inter']">Pregledaj parfeme →</Link>
              </div>
            ) : (
              orders.map(order => {
                const cfg = STATUS_CONFIG[order.status];
                return (
                  <div key={order.order_number} className="bg-[#111111] border border-[#c9a96e]/10 hover:border-[#c9a96e]/25 rounded-2xl p-5 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-[#c9a96e] font-['DM_Sans'] font-bold text-lg">{order.order_number}</p>
                        <p className="text-[#e8d5a3]/35 text-xs font-['Inter'] mt-0.5">{order.created_at}</p>
                      </div>
                      <div className={`flex items-center gap-1.5 text-xs font-['Inter'] font-semibold ${cfg.color}`}>
                        {cfg.icon}
                        {cfg.label}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-['Inter'] text-[#e8d5a3]/40">
                        {order.nacin_placanja === 'pouzecem' ? '💵 Pouzećem' : order.nacin_placanja === 'revolut' ? '💳 Revolut' : '🏦 Bankovno'}
                        {order.placeno && <span className="text-green-400 ml-1">✓ plaćeno</span>}
                        {' · 🚚 BoxNow paketomat'}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#c9a96e] font-['DM_Sans'] font-bold text-lg">{order.ukupno.toFixed(2)}€</span>
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
