'use client';

import { useEffect, useState } from 'react';
import { Search, Plus, Trash2, Edit2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/coupons`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('luxecart_token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setCoupons(data.data);
      } else {
        setError(data.error || 'Failed to load coupons');
      }
    } catch (err) {
      console.error(err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const res = await fetch(`${API_URL}/coupons/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('luxecart_token')}` }
      });
      if (res.ok) {
        setCoupons(coupons.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCoupons = coupons.filter(c => c.code.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-brand-text-primary">Coupons</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover transition-colors font-medium text-sm shadow-sm">
          <Plus className="w-4 h-4" /> Add Coupon
        </button>
      </div>

      {error && (
        <div className="p-4 bg-brand-error/10 border border-brand-error/20 text-brand-error rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-brand-surface rounded-xl border border-brand-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-brand-border flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary" />
            <input
              type="text"
              placeholder="Search by code..."
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
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Value</th>
                <th className="px-6 py-4">Usage</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-brand-text-secondary">Loading coupons...</td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-brand-text-secondary">No coupons found.</td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-brand-bg/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-brand-text-primary">
                      {coupon.code}
                    </td>
                    <td className="px-6 py-4 text-brand-text-secondary">{coupon.type}</td>
                    <td className="px-6 py-4 text-brand-text-primary font-medium">
                      {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : `₹${coupon.value}`}
                    </td>
                    <td className="px-6 py-4 text-brand-text-secondary">
                      {coupon.usedCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : ''}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        coupon.isActive ? 'bg-brand-success/10 text-brand-success' : 'bg-brand-text-secondary/10 text-brand-text-secondary'
                      }`}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-1.5 text-brand-text-secondary hover:text-brand-primary rounded hover:bg-brand-primary/10 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteCoupon(coupon.id)} className="p-1.5 text-brand-text-secondary hover:text-brand-error rounded hover:bg-brand-error/10 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
