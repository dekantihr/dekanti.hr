import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, ChevronDown, ChevronUp, ArrowLeft, Check, Package, Truck, Shield, Sparkles, Leaf, Flower2, TreePine, Snowflake, Sun, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface ProductPageProps {
  wishlist: number[];
  onWishlistToggle: (id: number) => void;
  onAddToCart: (product: any, sizeId: number) => void;
  user: { ime: string } | null;
}

export default function ProductPage({ wishlist, onWishlistToggle, onAddToCart, user }: ProductPageProps) {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<any>(null);
  const [productReviews, setProductReviews] = useState<any[]>([]);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [reviewForm, setReviewForm] = useState({ ocjena: 5, naslov: '', tekst: '' });

  useEffect(() => {
    async function loadData() {
      if (!slug) return;
      try {
        setLoading(true);
        const p = await api.getProductBySlug(slug);
        if (p) {
          setProduct(p);
          const [reviewsData, allProducts] = await Promise.all([
            api.getProductReviews(p.id),
            api.getProducts()
          ]);
          setProductReviews(reviewsData || []);
          if (allProducts) {
            setRelated(allProducts.filter((rp: any) => rp.brand_id === p.brand_id && rp.id !== p.id).slice(0, 3));
          }
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen pt-32 flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-2 border-[#c9a96e]/30 border-t-[#c9a96e] rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🌹</div>
          <h1 className="font-['Playfair_Display'] text-3xl text-[#e8d5a3] mb-3">Parfem nije pronađen</h1>
          <Link to="/parfemi" className="text-[#c9a96e] hover:text-[#e8d5a3] transition-colors font-['Inter']">
            ← Natrag na kolekciju
          </Link>
        </div>
      </div>
    );
  }

  const size = product.product_sizes ? product.product_sizes[selectedSize] : null;
  const notes = Array.isArray(product.notes) ? product.notes : [];
  const topNotes = notes.filter((n: any) => n.tip === 'top');
  const heartNotes = notes.filter((n: any) => n.tip === 'heart');
  const baseNotes = notes.filter((n: any) => n.tip === 'base');

  const handleAddToCart = () => {
    if (!size) return;
    onAddToCart(product, size.id);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
    toast.success(`${product.naziv} ${size.velicina_ml}ml dodano u košaricu!`);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Morate se prijaviti za pisanje recenzije'); return; }
    toast.success('Recenzija je poslana na odobravanje. Hvala!');
    setReviewForm({ ocjena: 5, naslov: '', tekst: '' });
  };

  const spolIcons: Record<string, ReactNode> = { 
    'muški': <div className="w-3 h-3 rounded-full bg-blue-500/40 border border-blue-400/60" />, 
    'ženski': <Flower2 size={12} className="text-pink-400" />, 
    'unisex': <div className="w-3 h-3 rounded-full bg-purple-500/40 border border-purple-400/60" /> 
  };
  const spolIcon = spolIcons[String(product.spol)] ?? null;
  
  const sezonaIcons: Record<string, ReactNode> = { 
    'proljeće': <Flower2 size={12} className="text-pink-400" />, 
    'ljeto': <Sun size={12} className="text-yellow-400" />, 
    'jesen': <Leaf size={12} className="text-orange-400" />, 
    'zima': <Snowflake size={12} className="text-blue-300" />, 
    'sve': <Sparkles size={12} className="text-[#c9a96e]" /> 
  };
  const sezonaIcon = sezonaIcons[String(product.sezona)] ?? <Sparkles size={12} className="text-[#c9a96e]" />;

  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-20 md:pt-28">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-xs font-['Inter'] text-[#e8d5a3]/30">
          <Link to="/" className="hover:text-[#c9a96e] transition-colors">Početna</Link>
          <span>/</span>
          <Link to="/parfemi" className="hover:text-[#c9a96e] transition-colors">Parfemi</Link>
          <span>/</span>
          <span className="text-[#c9a96e]">{product.naziv}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#111111] border border-[#c9a96e]/10 group">
              <img
                src={product.images && product.images.length > 0 ? product.images[activeImage] || product.images[0] : ''}
                alt={`${product.brand?.naziv || product.brand} ${product.naziv}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.featured && (
                  <span className="bg-[#c9a96e] text-[#0a0a0a] text-[9px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full">
                    Featured
                  </span>
                )}
              </div>
              {/* Wishlist */}
              <button
                onClick={() => onWishlistToggle(product.id)}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  wishlist.includes(product.id)
                    ? 'bg-[#c9a96e] text-[#0a0a0a]'
                    : 'bg-[#0a0a0a]/60 text-[#e8d5a3]/60 hover:bg-[#c9a96e]/20 hover:text-[#c9a96e] border border-[#c9a96e]/20'
                }`}
              >
                <Heart size={16} fill={wishlist.includes(product.id) ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${i === activeImage ? 'border-[#c9a96e]' : 'border-[#c9a96e]/10 hover:border-[#c9a96e]/40'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <Link to={`/parfemi?brand=${product.brand_id}`} className="text-[#c9a96e] text-xs tracking-[0.3em] uppercase font-semibold font-['Inter'] hover:text-[#e8d5a3] transition-colors">
                {product.brand?.naziv || product.brand}
              </Link>
              <div className="flex gap-2">
                <span className="flex items-center gap-1 text-[9px] tracking-wider uppercase px-2 py-1 rounded border border-[#c9a96e]/30 bg-[#c9a96e]/5 text-[#c9a96e]/80 font-['Inter']">
                  {spolIcon} {product.spol}
                </span>
                <span className="text-[9px] tracking-wider uppercase px-2 py-1 rounded border border-[#e8d5a3]/10 bg-[#1a1a1a] text-[#e8d5a3]/50 font-['Inter']">
                  {product.koncentracija}
                </span>
                <span className="flex items-center gap-1 text-[9px] tracking-wider uppercase px-2 py-1 rounded border border-[#e8d5a3]/10 bg-[#1a1a1a] text-[#e8d5a3]/50 font-['Inter']">
                  {sezonaIcon} {product.sezona}
                </span>
              </div>
            </div>

            {/* Name */}
            <h1 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-[#e8d5a3] leading-tight">
              {product.naziv}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={14} className={i <= Math.round(product.avg_ocjena) ? 'text-[#c9a96e]' : 'text-[#333]'} fill={i <= Math.round(product.avg_ocjena) ? 'currentColor' : 'none'} />
                ))}
              </div>
              <span className="text-[#c9a96e] font-semibold text-sm font-['Inter']">{product.avg_ocjena}</span>
              <span className="text-[#e8d5a3]/40 text-sm font-['Inter']">({product.broj_recenzija} recenzija)</span>
            </div>

            {/* Short desc */}
            <p className="text-[#e8d5a3]/60 font-['Inter'] font-light leading-relaxed text-sm">
              {product.opis_kratki}
            </p>

            {/* Divider */}
            <div className="h-[1px] bg-[#c9a96e]/15" />

            {/* Size Selector */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[#e8d5a3]/80 text-sm font-semibold font-['Inter'] tracking-wider uppercase">Odaberite veličinu</h3>
                <span className="text-[#c9a96e] font-['Playfair_Display'] text-2xl font-bold">{size?.cijena?.toFixed(2) || '0.00'}€</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {product.product_sizes?.map((s: any, i: number) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSize(i)}
                    disabled={s.zaliha === 0}
                    className={`relative py-3 px-2 rounded-xl border text-center transition-all duration-200 ${
                      i === selectedSize
                        ? 'border-[#c9a96e] bg-[#c9a96e]/10 text-[#c9a96e]'
                        : s.zaliha === 0
                        ? 'border-[#333] bg-[#111] text-[#e8d5a3]/20 cursor-not-allowed'
                        : 'border-[#c9a96e]/20 bg-[#111] text-[#e8d5a3]/60 hover:border-[#c9a96e]/50 hover:text-[#e8d5a3]/90'
                    }`}
                  >
                    <div className="text-sm font-bold font-['Inter']">{s.velicina_ml}ml</div>
                    <div className="text-[10px] font-['Inter'] mt-0.5">{s.cijena.toFixed(2)}€</div>
                    {s.zaliha > 0 && s.zaliha <= 5 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[8px] px-1 py-0.5 rounded-full font-bold">
                        Zadnji!
                      </span>
                    )}
                    {s.zaliha === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-[1px] bg-[#333] rotate-45" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              {size && size.zaliha > 0 && size.zaliha <= 10 && (
                <p className="flex items-center gap-1.5 text-orange-400/70 text-xs font-['Inter'] mt-2">
                  <AlertTriangle size={12} />
                  Samo {size.zaliha} komada na zalihi
                </p>
              )}
            </div>

            {/* Add to Cart */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!size || size.zaliha === 0}
                className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-['Inter'] font-bold text-sm tracking-[0.1em] uppercase ${
                  addedToCart
                    ? 'bg-green-600 text-white'
                    : !size || size.zaliha === 0
                    ? 'bg-[#1a1a1a] text-[#e8d5a3]/20 cursor-not-allowed border border-[#333]'
                    : 'bg-[#c9a96e] text-[#0a0a0a] hover:bg-[#e8d5a3]'
                }`}
                style={size && size.zaliha > 0 ? { 
                  transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 0 0 rgba(201,169,110,0)'
                } : undefined}
                onMouseEnter={size && size.zaliha > 0 ? (e) => {
                  e.currentTarget.style.boxShadow = '0 0 40px rgba(201,169,110,0.3)';
                } : undefined}
                onMouseLeave={size && size.zaliha > 0 ? (e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 rgba(201,169,110,0)';
                } : undefined}
              >
                {addedToCart ? <Check size={18} /> : <ShoppingBag size={18} />}
                {addedToCart ? 'Dodano!' : !size || size.zaliha === 0 ? 'Nema na zalihi' : 'Dodaj u košaricu'}
              </button>
              <button
                onClick={() => onWishlistToggle(product.id)}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${
                  wishlist.includes(product.id)
                    ? 'bg-[#c9a96e]/20 border-[#c9a96e] text-[#c9a96e]'
                    : 'border-[#c9a96e]/25 text-[#e8d5a3]/50 hover:border-[#c9a96e]/50 hover:text-[#c9a96e]'
                }`}
              >
                <Heart size={18} fill={wishlist.includes(product.id) ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <Package size={16} />, text: 'Isti dan pakiranje' },
                { icon: <Truck size={16} />, text: 'HP Pošta24' },
                { icon: <Shield size={16} />, text: 'Sigurna kupnja' },
              ].map(b => (
                <div key={b.text} className="flex flex-col items-center gap-1.5 bg-[#111111] border border-[#c9a96e]/8 rounded-xl p-3 text-center">
                  <span className="text-[#c9a96e]/60">{b.icon}</span>
                  <span className="text-[#e8d5a3]/35 text-[9px] font-['Inter'] tracking-wide">{b.text}</span>
                </div>
              ))}
            </div>

            {/* Long Description */}
            <div className="bg-[#111111] border border-[#c9a96e]/10 rounded-2xl p-5">
              <button
                onClick={() => setDescExpanded(!descExpanded)}
                className="flex items-center justify-between w-full text-[#e8d5a3]/80 font-semibold font-['Inter'] text-sm"
              >
                Opis parfema
                {descExpanded ? <ChevronUp size={15} className="text-[#c9a96e]" /> : <ChevronDown size={15} className="text-[#c9a96e]" />}
              </button>
              {descExpanded && (
                <p className="text-[#e8d5a3]/50 text-sm font-['Inter'] font-light leading-relaxed mt-4">
                  {product.opis_dugi}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Mirisna piramida */}
        <div className="mt-16">
          <div className="text-center mb-10">
            <p className="text-[#c9a96e] text-[10px] tracking-[0.5em] uppercase font-semibold font-['Inter'] mb-2">Profil mirisa</p>
            <h2 className="font-['Playfair_Display'] text-3xl font-bold text-[#e8d5a3]">Mirisna <span className="text-[#c9a96e] italic">piramida</span></h2>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Glava', sublabel: 'Top notes', notes: topNotes, icon: <Leaf size={24} className="text-green-400" />, desc: 'Prve 15-30 min' },
                { label: 'Srce', sublabel: 'Heart notes', notes: heartNotes, icon: <Flower2 size={24} className="text-pink-400" />, desc: 'Do 4 sata' },
                { label: 'Baza', sublabel: 'Base notes', notes: baseNotes, icon: <TreePine size={24} className="text-amber-600" />, desc: 'Cijeli dan' },
              ].map(tier => (
                <div key={tier.label} className="bg-[#111111] border border-[#c9a96e]/15 rounded-2xl p-5 text-center">
                  <div className="flex justify-center mb-2">{tier.icon}</div>
                  <h3 className="text-[#c9a96e] font-['Playfair_Display'] font-bold text-sm mb-0.5">{tier.label}</h3>
                  <p className="text-[#e8d5a3]/30 text-[9px] font-['Inter'] mb-1">{tier.sublabel}</p>
                  <p className="text-[#e8d5a3]/20 text-[8px] font-['Inter'] mb-3">{tier.desc}</p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {tier.notes.map((n: any) => (
                      <span key={n.naziv} className="text-[10px] text-[#e8d5a3]/60 border border-[#c9a96e]/15 px-2 py-0.5 rounded-full font-['Inter']">
                        {n.naziv}
                      </span>
                    ))}
                    {tier.notes.length === 0 && <span className="text-[#e8d5a3]/20 text-xs">—</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[#c9a96e] text-[10px] tracking-[0.5em] uppercase font-semibold font-['Inter'] mb-2">Recenzije</p>
              <h2 className="font-['Playfair_Display'] text-3xl font-bold text-[#e8d5a3]">
                Što kažu kupci <span className="text-[#c9a96e]">({product.broj_recenzija})</span>
              </h2>
            </div>
            <div className="text-right">
              <div className="text-[#c9a96e] font-['Playfair_Display'] text-4xl font-bold">{product.avg_ocjena}</div>
              <div className="flex gap-0.5 justify-end">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={12} className={i <= Math.round(product.avg_ocjena) ? 'text-[#c9a96e]' : 'text-[#333]'} fill={i <= Math.round(product.avg_ocjena) ? 'currentColor' : 'none'} />
                ))}
              </div>
              <p className="text-[#e8d5a3]/30 text-xs font-['Inter']">od 5</p>
            </div>
          </div>

          {/* Review list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            {productReviews.length === 0 ? (
              <p className="text-[#e8d5a3]/40 col-span-2 text-center py-8">Trenutno nema recenzija. Budite prvi!</p>
            ) : productReviews.map((review: any) => (
              <div key={review.id} className="bg-[#111111] border border-[#c9a96e]/10 rounded-2xl p-5">
                <div className="flex gap-0.5 mb-3">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={11} className={i <= review.ocjena ? 'text-[#c9a96e]' : 'text-[#333]'} fill={i <= review.ocjena ? 'currentColor' : 'none'} />
                  ))}
                </div>
                {review.naslov && <h4 className="text-[#e8d5a3]/80 text-sm font-semibold font-['Inter'] mb-2">{review.naslov}</h4>}
                <p className="text-[#e8d5a3]/50 text-sm font-['Inter'] font-light leading-relaxed italic mb-3">"{review.tekst}"</p>
                <div className="flex justify-between">
                  <span className="text-[#e8d5a3]/60 text-xs font-['Inter'] font-semibold">{review.user_name || review.korisnik_id}</span>
                  <span className="text-[#e8d5a3]/25 text-xs font-['Inter']">{new Date(review.created_at).toLocaleDateString('hr-HR')}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Review form */}
          {user ? (
            <div className="bg-[#111111] border border-[#c9a96e]/10 rounded-2xl p-6">
              <h3 className="text-[#e8d5a3]/80 font-['Playfair_Display'] text-xl font-bold mb-5">Napišite recenziju</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="text-[#e8d5a3]/50 text-xs font-['Inter'] uppercase tracking-wider mb-2 block">Ocjena</label>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(i => (
                      <button key={i} type="button" onClick={() => setReviewForm(f => ({ ...f, ocjena: i }))} className="transition-transform hover:scale-110">
                        <Star size={24} className={i <= reviewForm.ocjena ? 'text-[#c9a96e]' : 'text-[#333]'} fill={i <= reviewForm.ocjena ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[#e8d5a3]/50 text-xs font-['Inter'] uppercase tracking-wider mb-2 block">Naslov</label>
                  <input
                    type="text"
                    value={reviewForm.naslov}
                    onChange={e => setReviewForm(f => ({ ...f, naslov: e.target.value }))}
                    placeholder="Kratki naslov recenzije"
                    className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] placeholder-[#e8d5a3]/25 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#c9a96e]/50 font-['Inter']"
                  />
                </div>
                <div>
                  <label className="text-[#e8d5a3]/50 text-xs font-['Inter'] uppercase tracking-wider mb-2 block">Vaša recenzija</label>
                  <textarea
                    value={reviewForm.tekst}
                    onChange={e => setReviewForm(f => ({ ...f, tekst: e.target.value }))}
                    required
                    rows={4}
                    placeholder="Opišite Vaše iskustvo s ovim parfemom..."
                    className="w-full bg-[#0a0a0a] border border-[#c9a96e]/20 text-[#e8d5a3] placeholder-[#e8d5a3]/25 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#c9a96e]/50 font-['Inter'] resize-none"
                  />
                </div>
                <button type="submit" className="bg-[#c9a96e] text-[#0a0a0a] px-8 py-3 rounded-xl font-bold text-sm tracking-wider uppercase hover:bg-[#e8d5a3] transition-all">
                  Pošalji recenziju
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center py-8 bg-[#111111] border border-[#c9a96e]/10 rounded-2xl">
              <p className="text-[#e8d5a3]/40 font-['Inter'] mb-3">Prijavite se za pisanje recenzije</p>
              <Link to="/prijava" className="text-[#c9a96e] border border-[#c9a96e]/30 px-6 py-2.5 rounded-full text-sm hover:bg-[#c9a96e]/5 transition-all font-['Inter']">
                Prijava
              </Link>
            </div>
          )}
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[#c9a96e] text-[10px] tracking-[0.5em] uppercase font-semibold font-['Inter'] mb-2">Isti brand</p>
                <h2 className="font-['Playfair_Display'] text-3xl font-bold text-[#e8d5a3]">Više od <span className="text-[#c9a96e] italic">{product.brand}</span></h2>
              </div>
              <Link to={`/parfemi?brand=${product.brand_id}`} className="text-[#c9a96e] text-sm font-['Inter'] hover:text-[#e8d5a3] transition-colors flex items-center gap-1">
                Vidi sve <ArrowLeft size={13} className="rotate-180" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p: any) => (
                <div key={p.id} className="bg-[#111111] border border-[#c9a96e]/10 hover:border-[#c9a96e]/25 rounded-2xl overflow-hidden transition-all group">
                  <Link to={`/parfemi/${p.slug}`}>
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f]">
                      <img src={p.images && p.images.length > 0 ? p.images[0] : ''} alt={p.naziv} className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-500 opacity-80" />
                    </div>
                    <div className="p-4">
                      <p className="text-[#c9a96e] text-[9px] tracking-[0.25em] uppercase font-['Inter'] mb-1">{p.brand?.naziv || p.brand}</p>
                      <h3 className="text-[#e8d5a3] font-['Playfair_Display'] font-bold mb-2">{p.naziv}</h3>
                      <p className="text-[#c9a96e] font-['Playfair_Display'] font-semibold">
                        od {p.product_sizes && p.product_sizes.length > 0 ? Math.min(...p.product_sizes.map((s: any) => s.cijena)).toFixed(2) : '0.00'}€
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
