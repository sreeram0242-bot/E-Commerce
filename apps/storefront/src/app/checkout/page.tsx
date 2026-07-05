'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore, useAuthStore } from '@/store';
import { api } from '@/lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    fullName: user?.firstName ? `${user.firstName} ${user.lastName}` : '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
  });

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-brand-text-primary mb-4">Your cart is empty</h1>
        <button onClick={() => router.push('/shop')} className="text-brand-primary hover:underline">
          Return to Shop
        </button>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const tax = subtotal * 0.18; // 18% GST for demo
  const shipping = subtotal > 1499 ? 0 : 99;
  const total = subtotal + tax + shipping;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please log in to place an order');
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post<any>('/orders', {
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
        shippingAddress: address,
        paymentMethod: 'COD', // Defaulting to COD for Phase 2
      });

      if (response.success) {
        clearCart();
        router.push(`/account/orders/${response.data.orderNumber}`);
      }
    } catch (e: any) {
      alert(e.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-display font-bold text-brand-text-primary mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Form */}
        <div className="lg:col-span-7 space-y-8">
          <section className="bg-brand-surface p-6 sm:p-8 rounded-3xl border border-brand-border">
            <h2 className="text-xl font-bold text-brand-text-primary mb-6">Shipping Address</h2>
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input required value={address.fullName} onChange={e => setAddress({...address, fullName: e.target.value})} className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl outline-none focus:ring-2 focus:ring-brand-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input required value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl outline-none focus:ring-2 focus:ring-brand-primary/50" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address Line 1</label>
                <input required value={address.addressLine1} onChange={e => setAddress({...address, addressLine1: e.target.value})} className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl outline-none focus:ring-2 focus:ring-brand-primary/50" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input required value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl outline-none focus:ring-2 focus:ring-brand-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  <input required value={address.state} onChange={e => setAddress({...address, state: e.target.value})} className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl outline-none focus:ring-2 focus:ring-brand-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">PIN Code</label>
                  <input required value={address.pincode} onChange={e => setAddress({...address, pincode: e.target.value})} className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl outline-none focus:ring-2 focus:ring-brand-primary/50" />
                </div>
              </div>
            </form>
          </section>

          <section className="bg-brand-surface p-6 sm:p-8 rounded-3xl border border-brand-border">
            <h2 className="text-xl font-bold text-brand-text-primary mb-6">Payment Method</h2>
            <div className="p-4 border border-brand-primary bg-brand-primary/5 rounded-xl flex items-center gap-3">
              <input type="radio" checked readOnly className="text-brand-primary focus:ring-brand-primary w-5 h-5" />
              <span className="font-medium">Cash on Delivery (COD)</span>
            </div>
          </section>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-brand-surface p-6 sm:p-8 rounded-3xl border border-brand-border sticky top-24">
            <h2 className="text-xl font-bold text-brand-text-primary mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-brand-text-secondary flex-1 pr-4">{item.quantity}x {item.name}</span>
                  <span className="font-medium text-brand-text-primary">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-brand-border pt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-text-secondary">Subtotal</span>
                <span className="font-medium text-brand-text-primary">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-text-secondary">Shipping</span>
                <span className="font-medium text-brand-text-primary">{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-text-secondary">Tax (18%)</span>
                <span className="font-medium text-brand-text-primary">{formatPrice(tax)}</span>
              </div>
            </div>

            <div className="border-t border-brand-border mt-4 pt-4 flex justify-between items-center mb-8">
              <span className="font-bold text-brand-text-primary">Total</span>
              <span className="text-xl font-bold text-brand-text-primary">{formatPrice(total)}</span>
            </div>

            <button
              form="checkout-form"
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary-hover transition-colors shadow-lg disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Place Order (COD)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
