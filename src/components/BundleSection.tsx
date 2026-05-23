import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { api } from '../services/api';
import type { CartItem } from '../store/cartStore';

interface BundleSectionProps {
  onAddToCart: (items: CartItem[]) => void;
}

export default function BundleSection({ onAddToCart }: BundleSectionProps) {
  const [bundles, setBundles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.getBundles()
      .then(data => { if (!cancelled) setBundles(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading || bundles.length === 0) return null;

  const handleAddBundle = (bundle: any) => {
    setAddingId(bundle.id);

    // Distribute bundle price proportionally across 3 items
    const totalOriginal = bundle.items.reduce((s: number, i: any) => s + i.cijena, 0);
    const ratio = totalOriginal > 0 ? bundle.cijena / totalOriginal : 1;

    const cartItems: CartItem[] = bundle.items.map((item: any, idx: number) => {
      // Last item absorbs rounding difference
      const isLast = idx === bundle.items.length - 1;
      const allocated = isLast
        ? bundle.cijena - bundle.items.slice(0, -1).reduce((s: number, i: any) => s + parseFloat((i.cijena * ratio).toFixed(2)), 0)
        : parseFloat((item.cijena * ratio).toFixed(2));

      return {
        product_id: item.product_id,
        product_size_id: item.product_size_id,
        naziv: item.naziv,
        brand: item.brand,
        ml: item.ml,
        cijena: allocated,
        kolicina: 1,
        image: item.image,
        slug: item.slug,
        max_zaliha: item.zaliha,
        bundle_id: bundle.id,
        bundle_naziv: bundle.naziv,
        bundle_cijena: idx === 0 ? bundle.cijena : undefined,
        bundle_item_index: (idx + 1) as 1 | 2 | 3,
      };
    });

    onAddToCart(cartItems);
    setTimeout(() => setAddingId(null), 1200);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Header */}
      <div className="text-center mb-14">
        <p className="text-[#c9a96e] text-xs tracking-[0.3em] uppercase font-['Inter'] mb-4">
          Tematski paketi
        </p>
        <h2 className="font-['Cormorant_Garamond'] text-4xl md:text-5xl font-bold text-[#e8d5a3]">
          Kurirani <span className="text-[#c9a96e] italic">paketi</span>
        </h2>
        <p className="text-[#e8d5a3]/40 text-sm font-['Inter'] mt-4 max-w-lg mx-auto leading-relaxed">
          Tri savršeno odabrana mirisa po posebnoj cijeni — manje od zbroja pojedinačnih.
        </p>
      </div>

      {/* Bundle cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {bundles.map(bundle => {
          const originalTotal = bundle.items.reduce((s: number, i: any) => s + i.cijena, 0);
          const saving = originalTotal - bundle.cijena;
          const inStock = bundle.items.every((i: any) => i.zaliha > 0);

          return (
            <div
              key={bundle.id}
              className="relative bg-[#111111] border border-[#c9a96e]/12 rounded-2xl overflow-hidden group hover:border-[#c9a96e]/30 transition-all duration-500"
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/40 to-transparent" />

              {/* Savings badge */}
              {saving > 0 && (
                <div className="absolute top-4 right-4 bg-[#c9a96e] text-[#0a0a0a] text-[10px] font-bold font-['Inter'] tracking-wider uppercase px-2.5 py-1 rounded-full">
                  Uštedi {saving.toFixed(2)}€
                </div>
              )}

              <div className="p-7 md:p-8">
                {/* Bundle name + desc */}
                <div className="mb-7">
                  <h3 className="font-['Cormorant_Garamond'] text-2xl font-bold text-[#e8d5a3] mb-2">
                    {bundle.naziv}
                  </h3>
                  {bundle.opis && (
                    <p className="text-[#e8d5a3]/45 text-sm font-['Inter'] leading-relaxed">
                      {bundle.opis}
                    </p>
                  )}
                </div>

                {/* 3 products */}
                <div className="space-y-3 mb-7">
                  {bundle.items.map((item: any, idx: number) => (
                    <div
                      key={item.product_size_id}
                      className="flex items-center gap-4 bg-[#0a0a0a] rounded-xl p-3 border border-[#c9a96e]/8 group-hover:border-[#c9a96e]/15 transition-colors duration-300"
                    >
                      {/* Image */}
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-[#1a1a1a]">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.naziv}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-[#c9a96e]/20 text-xs font-['Cormorant_Garamond']">
                              {idx + 1}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[#e8d5a3]/80 text-sm font-semibold font-['Inter'] truncate">
                          {item.naziv}
                        </p>
                        <p className="text-[#e8d5a3]/35 text-xs font-['Inter']">
                          {item.brand} · {item.ml}ml
                        </p>
                      </div>

                      {/* Individual price (struck through) */}
                      <span className="text-[#e8d5a3]/25 text-xs font-['Inter'] line-through flex-shrink-0">
                        {item.cijena.toFixed(2)}€
                      </span>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="h-px bg-[#c9a96e]/10 mb-6" />

                {/* Pricing + CTA */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-['Cormorant_Garamond'] text-3xl font-bold text-[#c9a96e]">
                        {bundle.cijena.toFixed(2)}€
                      </span>
                      <span className="text-[#e8d5a3]/30 text-sm font-['Inter'] line-through">
                        {originalTotal.toFixed(2)}€
                      </span>
                    </div>
                    <p className="text-[#e8d5a3]/30 text-[11px] font-['Inter'] mt-0.5">
                      Cijena paketa · {bundle.items.length} parfema
                    </p>
                  </div>

                  <button
                    onClick={() => handleAddBundle(bundle)}
                    disabled={!inStock || addingId === bundle.id}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-['Inter'] font-semibold text-sm tracking-wide transition-all duration-300 flex-shrink-0 ${
                      !inStock
                        ? 'bg-white/5 text-white/20 cursor-not-allowed'
                        : addingId === bundle.id
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-[#c9a96e] text-[#0a0a0a] hover:bg-[#e8d5a3]'
                    }`}
                  >
                    {addingId === bundle.id ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-400"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        Dodano
                      </>
                    ) : !inStock ? (
                      'Rasprodano'
                    ) : (
                      <>
                        <ShoppingBag size={15} />
                        Dodaj paket
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Bottom accent */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/20 to-transparent" />
            </div>
          );
        })}
      </div>

      {/* View all link */}
      <div className="text-center mt-10">
        <Link
          to="/parfemi"
          className="inline-flex items-center gap-2 text-[#c9a96e]/60 hover:text-[#c9a96e] text-sm font-['Inter'] transition-colors"
        >
          Ili pregledaj sve parfeme pojedinačno
          <ArrowRight size={13} />
        </Link>
      </div>
    </section>
  );
}
