'use client';

import { useEffect, useState } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const ORDER_STATUSES = ['PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('luxecart_token');
      const res = await fetch(`${API_URL}/orders/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setOrders(data.data);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    setUpdatingStatus(true);
    try {
      const token = localStorage.getItem('luxecart_token');
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
        setSelectedOrder((prev: any) => prev ? { ...prev, status } : null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'bg-brand-success/10 text-brand-success';
      case 'SHIPPED': return 'bg-brand-accent/10 text-brand-accent';
      case 'CANCELLED': return 'bg-brand-error/10 text-brand-error';
      case 'CONFIRMED': return 'bg-brand-primary/10 text-brand-primary';
      case 'PROCESSING': return 'bg-blue-500/10 text-blue-400';
      default: return 'bg-brand-warning/10 text-brand-warning';
    }
  };

  const filtered = orders.filter(o =>
    o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
    o.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-brand-text-primary">Orders</h1>

      <div className="bg-brand-surface rounded-xl border border-brand-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-brand-border flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary" />
            <input
              type="text"
              placeholder="Search by order # or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-brand-bg border border-brand-border rounded-lg text-sm focus:outline-none focus:border-brand-primary text-brand-text-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-bg border-b border-brand-border text-brand-text-secondary font-medium">
              <tr>
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-brand-text-secondary">Loading orders...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-brand-text-secondary">No orders found.</td></tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-brand-bg/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-brand-text-primary">{order.orderNumber}</td>
                    <td className="px-6 py-4 text-brand-text-secondary">
                      <p>{order.user?.firstName} {order.user?.lastName}</p>
                      <p className="text-xs">{order.user?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-brand-text-secondary">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-brand-text-primary">₹{order.total?.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-brand-text-secondary text-xs">{order.paymentMethod}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center gap-1 ml-auto px-3 py-1.5 text-xs font-medium text-brand-primary bg-brand-primary/10 hover:bg-brand-primary hover:text-white rounded-lg transition-colors"
                      >
                        Manage <ChevronDown className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Status Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-brand-surface border border-brand-border rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-brand-border">
              <h2 className="text-lg font-semibold text-brand-text-primary">Order {selectedOrder.orderNumber}</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-1.5 hover:bg-brand-bg rounded-lg text-brand-text-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Order info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-brand-text-secondary">Customer</p>
                  <p className="font-medium text-brand-text-primary">{selectedOrder.user?.firstName} {selectedOrder.user?.lastName}</p>
                </div>
                <div>
                  <p className="text-brand-text-secondary">Total</p>
                  <p className="font-medium text-brand-text-primary">₹{selectedOrder.total?.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-brand-text-secondary">Payment</p>
                  <p className="font-medium text-brand-text-primary">{selectedOrder.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-brand-text-secondary">Date</p>
                  <p className="font-medium text-brand-text-primary">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Status updater */}
              <div>
                <p className="text-sm font-medium text-brand-text-secondary mb-2">Update Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {ORDER_STATUSES.map(status => (
                    <button
                      key={status}
                      disabled={updatingStatus || selectedOrder.status === status}
                      onClick={() => updateOrderStatus(selectedOrder.id, status)}
                      className={`py-2 px-3 text-xs font-medium rounded-lg transition-all border ${
                        selectedOrder.status === status
                          ? 'border-brand-primary bg-brand-primary/10 text-brand-primary cursor-default'
                          : 'border-brand-border text-brand-text-secondary hover:border-brand-primary hover:text-brand-primary disabled:opacity-50'
                      }`}
                    >
                      {selectedOrder.status === status && '✓ '}{status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
