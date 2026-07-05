'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function OrderDetailsPage({ params }: { params: { orderNumber: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [params.orderNumber]);

  const fetchOrder = async () => {
    try {
      const res = await api.get<any>(`/orders/${params.orderNumber}`);
      if (res.success) {
        setOrder(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(price);
  };

  if (loading) return <div className="max-w-4xl mx-auto py-12 px-4">Loading order details...</div>;
  if (!order) return <div className="max-w-4xl mx-auto py-12 px-4 text-brand-error">Order not found</div>;

  const address = JSON.parse(order.shippingAddress || '{}');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold text-brand-text-primary">Order #{order.orderNumber}</h1>
        <Link href="/account/orders" className="text-brand-primary hover:underline text-sm font-medium">
          &larr; Back to Orders
        </Link>
      </div>

      <div className="bg-brand-success/10 border border-brand-success/20 rounded-xl p-6 mb-8 text-center">
        <h2 className="text-xl font-bold text-brand-success mb-2">Order Confirmed!</h2>
        <p className="text-brand-text-primary">Thank you for shopping with LuxeCart.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-brand-surface border border-brand-border rounded-xl p-6">
          <h3 className="font-bold text-brand-text-primary mb-4 border-b border-brand-border pb-2">Shipping Details</h3>
          <p className="font-medium">{address.fullName}</p>
          <p className="text-brand-text-secondary mt-1">{address.addressLine1}</p>
          <p className="text-brand-text-secondary">{address.city}, {address.state} {address.pincode}</p>
          <p className="text-brand-text-secondary mt-2">Phone: {address.phone}</p>
        </div>
        <div className="bg-brand-surface border border-brand-border rounded-xl p-6">
          <h3 className="font-bold text-brand-text-primary mb-4 border-b border-brand-border pb-2">Order Summary</h3>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between"><span className="text-brand-text-secondary">Status</span><span className="font-medium bg-brand-bg px-2 py-0.5 rounded">{order.status}</span></div>
            <div className="flex justify-between"><span className="text-brand-text-secondary">Payment Method</span><span className="font-medium">{order.paymentMethod}</span></div>
            <div className="flex justify-between"><span className="text-brand-text-secondary">Date</span><span className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</span></div>
          </div>
          <div className="space-y-2 text-sm pt-4 border-t border-brand-border">
            <div className="flex justify-between"><span className="text-brand-text-secondary">Subtotal</span><span className="font-medium">{formatPrice(order.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-brand-text-secondary">Shipping</span><span className="font-medium">{order.shippingFee === 0 ? 'Free' : formatPrice(order.shippingFee)}</span></div>
            <div className="flex justify-between"><span className="text-brand-text-secondary">Tax</span><span className="font-medium">{formatPrice(order.tax)}</span></div>
            <div className="flex justify-between pt-2 border-t border-brand-border font-bold text-base mt-2">
              <span>Total</span><span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-brand-surface border border-brand-border rounded-xl p-6">
        <h3 className="font-bold text-brand-text-primary mb-4 border-b border-brand-border pb-2">Items Ordered</h3>
        <div className="space-y-4">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex gap-4">
              <div className="w-16 h-16 rounded bg-brand-bg shrink-0 border border-brand-border"></div>
              <div className="flex-1">
                <p className="font-medium text-brand-text-primary">{item.name}</p>
                <p className="text-sm text-brand-text-secondary">Qty: {item.quantity}</p>
              </div>
              <div className="font-medium">
                {formatPrice(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
