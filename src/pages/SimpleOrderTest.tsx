import { useState } from 'react';
import { api } from '../services/api';
import { supabase } from '../utils/supabase';
import toast from 'react-hot-toast';

export default function SimpleOrderTest() {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);

  // Create a test order
  const createTestOrder = async () => {
    setLoading(true);
    try {
      const order = await api.createOrder({
        user_id: null,
        ime: 'Test',
        prezime: 'Kupac',
        email: `test${Date.now()}@dekanti.hr`,
        telefon: '+385911234567',
        adresa: 'Testna ulica 123',
        grad: 'Zagreb',
        postanski_broj: '10000',
        napomena: 'Testna narudžba iz Simple Order Test',
        nacin_dostave: 'hp_posta24',
        nacin_placanja: 'pouzecem',
        cijena_dostave: 4.50,
        subtotal: 15.99,
        popust_iznos: 0,
        ukupno: 20.49,
        items: [
          {
            product_size_id: 1, // Dior Sauvage 5ml
            naziv_proizvoda: 'Dior Sauvage EDP',
            brand_naziv: 'Dior',
            ml: 5,
            cijena: 8.99,
            kolicina: 1
          }
        ]
      });

      toast.success(`✅ Narudžba kreirana: ${order.order_number}`, {
        duration: 5000,
        style: {
          background: '#111111',
          color: '#e8d5a3',
          border: '1px solid rgba(201,169,110,0.3)'
        }
      });

      // Refresh orders list
      fetchOrders();
    } catch (error: any) {
      toast.error(`❌ Greška: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all orders from Supabase
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            naziv_proizvoda,
            brand_naziv,
            ml,
            cijena,
            kolicina
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
      
      toast.success(`✅ Učitano ${data?.length || 0} narudžbi iz Supabase`);
    } catch (error: any) {
      toast.error(`❌ Greška: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8d5a3] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-['Cormorant_Garamond'] font-bold mb-4">
            🛒 Simple Order Test
          </h1>
          <p className="text-[#e8d5a3]/70 mb-8">
            Create test orders and see them in REAL-TIME from Supabase
          </p>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={createTestOrder}
              disabled={loading}
              className="bg-[#c9a96e] text-[#0a0a0a] px-8 py-3 rounded-xl font-semibold hover:bg-[#e8d5a3] transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : '➕ Create Test Order'}
            </button>
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="bg-[#111111] border border-[#c9a96e]/30 text-[#e8d5a3] px-8 py-3 rounded-xl font-semibold hover:bg-[#c9a96e]/10 transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : '🔄 Refresh Orders'}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-[#111111] border border-[#c9a96e]/10 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-[#c9a96e]">
            📖 How to Use
          </h2>
          <ol className="space-y-2 text-sm text-[#e8d5a3]/70">
            <li>1. Click <strong>"Create Test Order"</strong> to create a new order in Supabase</li>
            <li>2. Click <strong>"Refresh Orders"</strong> to see all orders from Supabase</li>
            <li>3. Check <a href="https://supabase.com/dashboard/project/gqmvyggenreowrpprpld/editor" target="_blank" className="text-[#c9a96e] hover:underline">Supabase Dashboard</a> to verify</li>
            <li>4. Compare with AdminPanel (which shows OLD mock data)</li>
          </ol>
        </div>

        {/* Orders List */}
        {orders.length > 0 && (
          <div className="bg-[#111111] border border-[#c9a96e]/10 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-[#c9a96e]/10">
              <h2 className="text-xl font-semibold text-[#c9a96e]">
                📦 Real Orders from Supabase ({orders.length})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0a0a0a]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#e8d5a3]/70 uppercase tracking-wider">
                      Order Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#e8d5a3]/70 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#e8d5a3]/70 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#e8d5a3]/70 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#e8d5a3]/70 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#e8d5a3]/70 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#e8d5a3]/70 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c9a96e]/10">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#c9a96e]/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-[#c9a96e]">
                          {order.order_number}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm">
                          {order.ime} {order.prezime}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-[#e8d5a3]/70">
                          {order.email}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'nova' ? 'bg-blue-500/20 text-blue-400' :
                          order.status === 'u_obradi' ? 'bg-yellow-500/20 text-yellow-400' :
                          order.status === 'poslano' ? 'bg-purple-500/20 text-purple-400' :
                          order.status === 'isporuceno' ? 'bg-green-500/20 text-green-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold">
                          {parseFloat(order.ukupno).toFixed(2)}€
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-[#e8d5a3]/70">
                          {order.order_items?.map((item: any, i: number) => (
                            <div key={i}>
                              {item.naziv_proizvoda} ({item.ml}ml) x{item.kolicina}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs text-[#e8d5a3]/50">
                          {new Date(order.created_at).toLocaleString('hr-HR')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {orders.length === 0 && !loading && (
          <div className="bg-[#111111] border border-[#c9a96e]/10 rounded-xl p-12 text-center">
            <p className="text-[#e8d5a3]/50 mb-4">
              No orders yet. Click "Create Test Order" to create one!
            </p>
          </div>
        )}

        {/* Comparison */}
        <div className="mt-8 bg-[#111111] border border-[#c9a96e]/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-[#c9a96e]">
            🔍 Comparison
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2 text-red-400">❌ Old AdminPanel (Mock Data)</h3>
              <ul className="text-sm text-[#e8d5a3]/70 space-y-1">
                <li>• HR-2024-000001 (Ivan Perić)</li>
                <li>• HR-2024-000002 (Maja Novak)</li>
                <li>• HR-2024-000003 (Tomislav Babić)</li>
                <li>• HR-2024-000004 (Petra Šimić)</li>
                <li className="text-red-400 mt-2">⚠️ These are FAKE/STATIC</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-green-400">✅ This Page (Real Supabase)</h3>
              <ul className="text-sm text-[#e8d5a3]/70 space-y-1">
                {orders.slice(0, 4).map(order => (
                  <li key={order.id}>• {order.order_number} ({order.ime} {order.prezime})</li>
                ))}
                {orders.length === 0 && <li className="text-[#e8d5a3]/50">No orders yet</li>}
                <li className="text-green-400 mt-2">✅ These are REAL from Supabase</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
