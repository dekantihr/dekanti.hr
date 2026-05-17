
import { Link } from 'react-router-dom';
import { HeartIcon, StarIcon, ShoppingBagIcon } from './icons';


interface ProductCardProps {
  product: any;
  isWishlisted: boolean;
  onWishlistToggle: (id: number) => void;
  onAddToCart: (product: any, sizeId: number) => void;
}

export default function ProductCard({ product, isWishlisted, onWishlistToggle, onAddToCart }: ProductCardProps) {
  const sizes = product.product_sizes || product.sizes || [];
  const minPrice = sizes.length > 0 ? Math.min(...sizes.map((s: any) => s.cijena)) : 0;
  const defaultSize = sizes[0];

  const spolColors: Record<string, string> = {
    'muški': 'bg-blue-900/40 text-blue-300 border-blue-600/30',
    'ženski': 'bg-pink-900/40 text-pink-300 border-pink-600/30',
    'unisex': 'bg-purple-900/40 text-purple-300 border-purple-600/30',
  };
  const spolColor = spolColors[String(product.spol)] ?? 'bg-[#c9a96e]/10 text-[#c9a96e] border-[#c9a96e]/20';

  return (
    <div className="group relative glass rounded-2xl overflow-hidden hover:border-[#c9a96e]/40 hover-lift hover-glow animate-staggerFadeIn" style={{ transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f]">
        <img
          src={product.images && product.images.length > 0 ? product.images[0] : ''}
          alt={`${product.brand?.naziv || product.brand} ${product.naziv}`}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.12] opacity-90 group-hover:opacity-100"
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.featured && (
            <span className="bg-gradient-to-r from-[#c9a96e] to-[#e8d5a3] text-[#0a0a0a] text-[10px] font-bold tracking-[0.15em] uppercase px-2 py-1 rounded-full shadow-[0_0_16px_rgba(201,169,110,0.5)] animate-pulse font-['Inter']">
              Featured
            </span>
          )}
          {product.bestseller_rank && product.bestseller_rank <= 5 && (
            <span className="glass text-[#c9a96e] text-[10px] font-bold tracking-[0.15em] uppercase px-2 py-1 rounded-full border border-[#c9a96e]/30 font-['Inter']">
              Bestseller
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); onWishlistToggle(product.id); }}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 ${
            isWishlisted
              ? 'bg-gradient-to-br from-[#c9a96e] to-[#e8d5a3] text-[#0a0a0a] shadow-[0_0_16px_rgba(201,169,110,0.6)]'
              : 'glass text-[#e8d5a3]/50 hover:bg-[#c9a96e]/20 hover:text-[#c9a96e] border border-[#c9a96e]/20'
          }`}
          style={{ 
            transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: isWishlisted ? '0 0 16px rgba(201,169,110,0.6)' : '0 0 0 rgba(201,169,110,0)'
          }}
          aria-label={isWishlisted ? 'Ukloni iz liste želja' : 'Dodaj u listu želja'}
        >
          <HeartIcon size={14} filled={isWishlisted} />
        </button>

        {/* Quick Add */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0" style={{ transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <button
            onClick={(e) => { e.preventDefault(); if (defaultSize) onAddToCart(product, defaultSize.id); }}
            className="w-full bg-gradient-to-r from-[#c9a96e] to-[#e8d5a3] text-[#0a0a0a] text-xs font-bold tracking-[0.15em] uppercase py-2.5 rounded-xl flex items-center justify-center gap-2 btn-ripple font-['Inter'] active:scale-[0.98]"
            style={{ 
              transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 0 0 rgba(201,169,110,0)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 24px rgba(201,169,110,0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 0 rgba(201,169,110,0)';
            }}
            aria-label={`Dodaj ${product.naziv} u košaricu`}
          >
            <ShoppingBagIcon size={14} />
            Dodaj u košaricu
          </button>
        </div>
      </div>

      {/* Content */}
      <Link to={`/parfemi/${product.slug}`} className="block p-4">
        {/* Brand + Badges */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#c9a96e] text-[11px] tracking-[0.15em] uppercase font-bold font-['Inter']">
            {product.brand?.naziv || product.brand}
          </span>
          <div className="flex gap-1.5">
            <span className={`text-[10px] tracking-wider uppercase px-1.5 py-0.5 rounded border font-semibold font-['Inter'] ${spolColor}`}>
              {product.spol}
            </span>
            <span className="text-[10px] tracking-wider uppercase px-1.5 py-0.5 rounded border bg-[#1a1a1a] text-[#e8d5a3]/50 border-[#e8d5a3]/10 font-['Inter']">
              {product.koncentracija}
            </span>
          </div>
        </div>

        {/* Name */}
        <h3 className="text-[#e8d5a3] font-['Cormorant_Garamond'] text-base font-semibold leading-tight mb-2 group-hover:text-[#c9a96e] transition-colors duration-300">
          {product.naziv}
        </h3>

        {/* Short desc */}
        <p className="text-[#e8d5a3]/40 text-xs font-['Inter'] font-light leading-relaxed mb-3 line-clamp-2">
          {product.opis_kratki}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(i => (
              <StarIcon
                key={i}
                size={11}
                filled={i <= Math.round(product.avg_ocjena)}
                className={i <= Math.round(product.avg_ocjena) ? 'text-[#c9a96e]' : 'text-[#333]'}
              />
            ))}
          </div>
          <span className="text-[#e8d5a3]/40 text-[11px] font-['Inter']">
            {(product.avg_ocjena || 0).toFixed(1)} ({product.broj_recenzija || 0})
          </span>
        </div>

        {/* Price + Sizes */}
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[9px] text-[#e8d5a3]/35 font-['Inter'] tracking-wider uppercase">od</span>
            <div className="text-[#c9a96e] font-['Cormorant_Garamond'] text-lg font-semibold">
              {minPrice.toFixed(2)}€
            </div>
          </div>
          <div className="flex gap-1">
            {sizes.slice(0, 3).map((s: any) => (
              <span key={s.id} className="text-[9px] text-[#e8d5a3]/35 border border-[#e8d5a3]/10 px-1.5 py-0.5 rounded font-['Inter'] hover:border-[#c9a96e]/30 hover:text-[#c9a96e]/60 transition-colors">
                {s.velicina_ml}ml
              </span>
            ))}
            {sizes.length > 3 && (
              <span className="text-[9px] text-[#c9a96e]/60 px-1 py-0.5 font-['Inter']">+{sizes.length - 3}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
