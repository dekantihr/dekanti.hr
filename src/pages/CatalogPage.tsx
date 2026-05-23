import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search, ChevronDown, X, Grid3X3, List } from 'lucide-react';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';
import ScrollReveal from '../components/ScrollReveal';

interface CatalogPageProps {
  wishlist: number[];
  onWishlistToggle: (id: number) => void;
  onAddToCart: (product: any, sizeId: number) => void;
}

export default function CatalogPage({ wishlist, onWishlistToggle, onAddToCart }: CatalogPageProps) {
  const [searchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // State for data
  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [allNotes, setAllNotes] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [fetchedProducts, fetchedBrands] = await Promise.all([
          api.getProducts(),
          api.getBrands()
        ]);
        
        const validProducts = fetchedProducts || [];
        setProducts(validProducts);
        setBrands(fetchedBrands || []);
        
        // Extract unique notes
        const notesSet = new Set<string>();
        validProducts.forEach((p: any) => {
          if (Array.isArray(p.notes)) {
            p.notes.forEach((n: any) => notesSet.add(n.naziv));
          }
        });
        setAllNotes(Array.from(notesSet).sort());
      } catch (error) {
        console.error('Error fetching catalog:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filters from URL
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [selectedBrands, setSelectedBrands] = useState<number[]>(
    searchParams.get('brand') ? [parseInt(searchParams.get('brand')!)] : []
  );
  const [selectedSpol, setSelectedSpol] = useState<string[]>(
    searchParams.get('spol') ? [searchParams.get('spol')!] : []
  );
  const [selectedSezona, setSelectedSezona] = useState<string[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(100);
  const [sort, setSort] = useState(searchParams.get('sort') ?? 'featured');
  const [page, setPage] = useState(1);
  const PER_PAGE = 9;

  // Reset page on filter change
  useEffect(() => setPage(1), [search, selectedBrands, selectedSpol, selectedSezona, selectedNotes, priceMin, priceMax, sort]);

  const filtered = useMemo(() => {
    let result = products.filter(p => p.active);

    if (searchParams.get('featured') === 'true') result = result.filter(p => p.featured);

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.naziv?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.opis_kratki?.toLowerCase().includes(q) ||
        (Array.isArray(p.notes) && p.notes.some((n: any) => n.naziv.toLowerCase().includes(q)))
      );
    }

    if (selectedBrands.length) result = result.filter(p => selectedBrands.includes(p.brand_id));
    if (selectedSpol.length) result = result.filter(p => selectedSpol.includes(p.spol));
    if (selectedSezona.length) result = result.filter(p => selectedSezona.includes(p.sezona) || p.sezona === 'sve');
    if (selectedNotes.length) result = result.filter(p => Array.isArray(p.notes) && selectedNotes.some(n => p.notes.some((pn: any) => pn.naziv === n)));

    result = result.filter(p => {
      const minPrice = Array.isArray(p.product_sizes) && p.product_sizes.length > 0 
        ? Math.min(...p.product_sizes.map((s: any) => s.cijena)) 
        : 0;
      return minPrice >= priceMin && minPrice <= priceMax;
    });

    const totalStock = (p: any) =>
      Array.isArray(p.product_sizes) && p.product_sizes.length > 0
        ? p.product_sizes.reduce((sum: number, s: any) => sum + (s.zaliha ?? 0), 0)
        : 0;

    const soldOutLast = (arr: any[]) =>
      [...arr].sort((a, b) => {
        const aOut = totalStock(a) === 0 ? 1 : 0;
        const bOut = totalStock(b) === 0 ? 1 : 0;
        return aOut - bOut;
      });

    switch (sort) {
      case 'cijena_asc': return soldOutLast([...result].sort((a, b) => {
        const minA = Array.isArray(a.product_sizes) && a.product_sizes.length > 0 ? Math.min(...a.product_sizes.map((s: any) => s.cijena)) : 0;
        const minB = Array.isArray(b.product_sizes) && b.product_sizes.length > 0 ? Math.min(...b.product_sizes.map((s: any) => s.cijena)) : 0;
        return minA - minB;
      }));
      case 'cijena_desc': return soldOutLast([...result].sort((a, b) => {
        const minA = Array.isArray(a.product_sizes) && a.product_sizes.length > 0 ? Math.min(...a.product_sizes.map((s: any) => s.cijena)) : 0;
        const minB = Array.isArray(b.product_sizes) && b.product_sizes.length > 0 ? Math.min(...b.product_sizes.map((s: any) => s.cijena)) : 0;
        return minB - minA;
      }));
      case 'bestseller': return soldOutLast([...result].sort((a, b) => (a.bestseller_rank ?? 999) - (b.bestseller_rank ?? 999)));
      case 'ocjena': return soldOutLast([...result].sort((a, b) => (b.avg_ocjena || 0) - (a.avg_ocjena || 0)));
      case 'novo': return soldOutLast([...result].reverse());
      default: return soldOutLast([...result].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)));
    }
  }, [products, search, selectedBrands, selectedSpol, selectedSezona, selectedNotes, priceMin, priceMax, sort, searchParams]);

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const toggleBrand = (id: number) => setSelectedBrands(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  const toggleSpol = (s: string) => setSelectedSpol(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleSezona = (s: string) => setSelectedSezona(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleNote = (n: string) => setSelectedNotes(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]);

  const clearFilters = () => {
    setSearch(''); setSelectedBrands([]); setSelectedSpol([]);
    setSelectedSezona([]); setSelectedNotes([]); setPriceMin(0); setPriceMax(100);
    setSort('featured');
  };

  const activeFilterCount = selectedBrands.length + selectedSpol.length + selectedSezona.length + selectedNotes.length + (priceMin > 0 || priceMax < 100 ? 1 : 0);

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Brands */}
      <div>
        <h3 className="text-[#c9a96e] text-[10px] tracking-[0.3em] uppercase font-semibold font-['Inter'] mb-3">Brand</h3>
        <div className="space-y-2">
          {brands.map((brand: any) => (
            <label key={brand.id} className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-4 h-4 rounded border transition-all ${selectedBrands.includes(brand.id) ? 'bg-[#c9a96e] border-[#c9a96e]' : 'border-[#c9a96e]/30 group-hover:border-[#c9a96e]/60'}`}>
                {selectedBrands.includes(brand.id) && <span className="text-[#0a0a0a] text-[9px] flex items-center justify-center h-full">✓</span>}
              </div>
              <input type="checkbox" className="hidden" checked={selectedBrands.includes(brand.id)} onChange={() => toggleBrand(brand.id)} />
              <span className="text-[#e8d5a3]/60 text-sm font-['Inter'] group-hover:text-[#e8d5a3]/90 transition-colors">{brand.naziv}</span>
              <span className="text-[#e8d5a3]/20 text-xs font-['Inter'] ml-auto">
                {products.filter((p: any) => p.brand_id === brand.id && p.active).length}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="h-[1px] bg-[#c9a96e]/10" />

      {/* Spol */}
      <div>
        <h3 className="text-[#c9a96e] text-[10px] tracking-[0.3em] uppercase font-semibold font-['Inter'] mb-3">Spol</h3>
        <div className="space-y-2">
          {['muški', 'ženski', 'unisex'].map(s => (
            <label key={s} className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-4 h-4 rounded border transition-all ${selectedSpol.includes(s) ? 'bg-[#c9a96e] border-[#c9a96e]' : 'border-[#c9a96e]/30 group-hover:border-[#c9a96e]/60'}`}>
                {selectedSpol.includes(s) && <span className="text-[#0a0a0a] text-[9px] flex items-center justify-center h-full">✓</span>}
              </div>
              <input type="checkbox" className="hidden" checked={selectedSpol.includes(s)} onChange={() => toggleSpol(s)} />
              <span className="text-[#e8d5a3]/60 text-sm font-['Inter'] group-hover:text-[#e8d5a3]/90 transition-colors capitalize">{s}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="h-[1px] bg-[#c9a96e]/10" />

      {/* Sezona */}
      <div>
        <h3 className="text-[#c9a96e] text-[10px] tracking-[0.3em] uppercase font-semibold font-['Inter'] mb-3">Sezona</h3>
        <div className="space-y-2">
          {['proljeće', 'ljeto', 'jesen', 'zima'].map(s => (
            <label key={s} className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-4 h-4 rounded border transition-all ${selectedSezona.includes(s) ? 'bg-[#c9a96e] border-[#c9a96e]' : 'border-[#c9a96e]/30 group-hover:border-[#c9a96e]/60'}`}>
                {selectedSezona.includes(s) && <span className="text-[#0a0a0a] text-[9px] flex items-center justify-center h-full">✓</span>}
              </div>
              <input type="checkbox" className="hidden" checked={selectedSezona.includes(s)} onChange={() => toggleSezona(s)} />
              <span className="text-[#e8d5a3]/60 text-sm font-['Inter'] group-hover:text-[#e8d5a3]/90 transition-colors capitalize">{s}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="h-[1px] bg-[#c9a96e]/10" />

      {/* Cijena */}
      <div>
        <h3 className="text-[#c9a96e] text-[10px] tracking-[0.3em] uppercase font-semibold font-['Inter'] mb-3">
          Cijena (od {priceMin}€ do {priceMax}€)
        </h3>
        <input type="range" min={0} max={100} value={priceMin} onChange={e => setPriceMin(+e.target.value)} className="w-full accent-[#c9a96e] mb-2" />
        <input type="range" min={0} max={100} value={priceMax} onChange={e => setPriceMax(+e.target.value)} className="w-full accent-[#c9a96e]" />
      </div>

      <div className="h-[1px] bg-[#c9a96e]/10" />

      {/* Mirisne note */}
      <div>
        <h3 className="text-[#c9a96e] text-[10px] tracking-[0.3em] uppercase font-semibold font-['Inter'] mb-3">Mirisne note</h3>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {allNotes.slice(0, 15).map(n => (
            <label key={n} className="flex items-center gap-2.5 cursor-pointer group">
              <div className={`w-3.5 h-3.5 rounded border flex-shrink-0 transition-all ${selectedNotes.includes(n) ? 'bg-[#c9a96e] border-[#c9a96e]' : 'border-[#c9a96e]/30 group-hover:border-[#c9a96e]/60'}`}>
                {selectedNotes.includes(n) && <span className="text-[#0a0a0a] text-[8px] flex items-center justify-center h-full">✓</span>}
              </div>
              <input type="checkbox" className="hidden" checked={selectedNotes.includes(n)} onChange={() => toggleNote(n)} />
              <span className="text-[#e8d5a3]/55 text-xs font-['Inter'] group-hover:text-[#e8d5a3]/90 transition-colors">{n}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-24 md:pt-28">
      {/* Header */}
      <ScrollReveal animation="fade-up">
        <div className="border-b border-[#c9a96e]/10 bg-[#111111]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <p className="text-[#c9a96e] text-[10px] tracking-[0.5em] uppercase font-semibold font-['Inter'] mb-2">dekantihr.com</p>
            <h1 className="font-['Playfair_Display'] text-4xl md:text-5xl font-bold text-[#e8d5a3]">
              {searchParams.get('featured') === 'true' ? 'Featured kolekcija' :
               sort === 'bestseller' ? 'Bestselleri' :
               'Svi parfemi'}
            </h1>
            <p className="text-[#e8d5a3]/40 font-['Inter'] font-light mt-2">
              {loading ? 'Učitavanje...' : `${filtered.length} parfema u kolekciji`}
            </p>
          </div>
        </div>
      </ScrollReveal>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c9a96e]/50" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Pretraži parfeme..."
              className="w-full bg-[#111111] border border-[#c9a96e]/20 text-[#e8d5a3] placeholder-[#e8d5a3]/30 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#c9a96e]/50 font-['Inter']"
            />
          </div>

          {/* Filter button (mobile) */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden flex items-center gap-2 border border-[#c9a96e]/30 text-[#c9a96e] px-4 py-2.5 rounded-xl text-sm font-['Inter'] hover:bg-[#c9a96e]/5 transition-all"
          >
            <SlidersHorizontal size={15} />
            Filteri
            {activeFilterCount > 0 && (
              <span className="bg-[#c9a96e] text-[#0a0a0a] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="appearance-none bg-[#111111] border border-[#c9a96e]/20 text-[#e8d5a3]/70 px-4 py-2.5 pr-8 rounded-xl text-sm focus:outline-none focus:border-[#c9a96e]/50 font-['Inter'] cursor-pointer"
            >
              <option value="featured">Preporučeno</option>
              <option value="bestseller">Popularnost</option>
              <option value="ocjena">Ocjena</option>
              <option value="cijena_asc">Cijena: rastuće</option>
              <option value="cijena_desc">Cijena: padajuće</option>
              <option value="novo">Najnovije</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#c9a96e]/50 pointer-events-none" />
          </div>

          {/* View mode */}
          <div className="hidden sm:flex border border-[#c9a96e]/20 rounded-xl overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={`p-2.5 transition-all ${viewMode === 'grid' ? 'bg-[#c9a96e]/20 text-[#c9a96e]' : 'text-[#e8d5a3]/40 hover:text-[#e8d5a3]/70'}`}>
              <Grid3X3 size={15} />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2.5 transition-all ${viewMode === 'list' ? 'bg-[#c9a96e]/20 text-[#c9a96e]' : 'text-[#e8d5a3]/40 hover:text-[#e8d5a3]/70'}`}>
              <List size={15} />
            </button>
          </div>

          {/* Clear filters */}
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 text-red-400/60 text-sm font-['Inter'] hover:text-red-400 transition-colors">
              <X size={13} />
              Očisti filtere ({activeFilterCount})
            </button>
          )}
        </div>

        <div className="flex gap-8">
          {/* Sidebar — Desktop */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-28 bg-[#111111] border border-[#c9a96e]/10 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[#e8d5a3]/80 text-sm font-semibold font-['Inter'] tracking-wide">Filteri</h2>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-[#c9a96e]/60 text-xs hover:text-[#c9a96e] transition-colors">
                    Očisti
                  </button>
                )}
              </div>
              <FilterSidebar />
            </div>
          </aside>

          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
              <div className="relative w-72 max-w-[85vw] bg-[#111111] h-full overflow-y-auto p-5 ml-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[#e8d5a3]/80 text-sm font-semibold font-['Inter']">Filteri</h2>
                  <button onClick={() => setSidebarOpen(false)} className="text-[#e8d5a3]/50 hover:text-[#c9a96e]">
                    <X size={18} />
                  </button>
                </div>
                <FilterSidebar />
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-full mt-6 bg-[#c9a96e] text-[#0a0a0a] py-3 rounded-xl font-bold text-sm"
                >
                  Primijeni filtere ({filtered.length})
                </button>
              </div>
            </div>
          )}

          {/* Products */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block w-8 h-8 border-2 border-[#c9a96e]/30 border-t-[#c9a96e] rounded-full animate-spin" />
                <p className="text-[#e8d5a3]/40 mt-4 font-['Inter']">Učitavanje parfema...</p>
              </div>
            ) : paginated.length === 0 ? (
              <ScrollReveal animation="scale">
                <div className="text-center py-20">
                  <div className="text-4xl mb-4">🌹</div>
                  <h3 className="text-[#e8d5a3]/60 font-['Playfair_Display'] text-xl mb-2">Nema rezultata</h3>
                  <p className="text-[#e8d5a3]/30 text-sm font-['Inter'] mb-6">Pokušajte s drugačijim filterima</p>
                  <button onClick={clearFilters} className="text-[#c9a96e] border border-[#c9a96e]/30 px-6 py-3 rounded-full text-sm hover:bg-[#c9a96e]/5 transition-all">
                    Očisti sve filtere
                  </button>
                </div>
              </ScrollReveal>
            ) : (
              <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                {paginated.map((product, index) => (
                  <ScrollReveal 
                    key={product.id}
                    animation="fade-up"
                    delay={index * 80}
                  >
                    <ProductCard
                      product={product}
                      isWishlisted={wishlist.includes(product.id)}
                      onWishlistToggle={onWishlistToggle}
                      onAddToCart={onAddToCart}
                    />
                  </ScrollReveal>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-[#c9a96e]/20 text-[#c9a96e]/60 rounded-lg text-sm font-['Inter'] hover:border-[#c9a96e]/50 disabled:opacity-30 transition-all"
                >
                  ←
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-['Inter'] transition-all ${p === page ? 'bg-[#c9a96e] text-[#0a0a0a] font-bold' : 'border border-[#c9a96e]/20 text-[#e8d5a3]/50 hover:border-[#c9a96e]/50'}`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-[#c9a96e]/20 text-[#c9a96e]/60 rounded-lg text-sm font-['Inter'] hover:border-[#c9a96e]/50 disabled:opacity-30 transition-all"
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


