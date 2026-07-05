'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('luxecart_token');
      const res = await fetch(`${API_URL}/orders/my-orders`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) setOrders(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(price);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'bg-green-500/10 text-green-500';
      case 'SHIPPED': return 'bg-blue-500/10 text-blue-400';
      case 'CANCELLED': return 'bg-red-500/10 text-red-400';
      default: return 'bg-yellow-500/10 text-yellow-400';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-display font-bold text-brand-text-primary mb-8">My Orders</h1>

      {loading ? (
        <div className="text-brand-text-secondary">Loading your orders...</div>
      ) : orders.length === 0 ? (
        <div className="bg-brand-surface border border-brand-border rounded-xl p-12 text-center">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-brand-text-secondary mb-4 text-lg">You haven't placed any orders yet.</p>
          <Link href="/shop" className="inline-flex px-6 py-2.5 bg-brand-primary text-white rounded-xl font-medium hover:bg-brand-primary-hover transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden">
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center p-6 border-b border-brand-border gap-4 bg-brand-bg/30">
                <div className="flex gap-8">
                  <div>
                    <p className="text-xs text-brand-text-secondary uppercase tracking-wider mb-1">Order #</p>
                    <p className="font-semibold text-brand-text-primary">{order.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-brand-text-secondary uppercase tracking-wider mb-1">Date</p>
                    <p className="font-medium text-brand-text-primary">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-brand-text-secondary uppercase tracking-wider mb-1">Total</p>
                    <p className="font-semibold text-brand-text-primary">{formatPrice(order.total)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <Link
                    href={`/account/orders/${order.orderNumber}`}
                    className="px-4 py-1.5 bg-brand-primary/10 text-brand-primary rounded-lg text-sm font-medium hover:bg-brand-primary hover:text-white transition-colors"
                  >
                    Details
                  </Link>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6 space-y-4">
                {order.items?.slice(0, 3).map((item: any) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover border border-brand-border" />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-brand-bg border border-brand-border flex items-center justify-center text-2xl">📦</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-brand-text-primary truncate">{item.name}</p>
                      <p className="text-sm text-brand-text-secondary">Qty: {item.quantity} · {formatPrice(item.price)}</p>
                    </div>
                  </div>
                ))}
                {order.items?.length > 3 && (
                  <p className="text-xs text-brand-text-secondary">+{order.items.length - 3} more item(s)</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
