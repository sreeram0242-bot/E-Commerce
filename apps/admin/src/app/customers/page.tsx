'use client';

import { useEffect, useState } from 'react';
import { Search, Ban, CheckCircle, ShieldAlert } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/customers?role=CUSTOMER`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('luxecart_token')}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data);
      } else {
        setError(data.error || 'Failed to load customers');
      }
    } catch (err) {
      console.error('Failed to fetch customers', err);
      setError('Network error loading customers');
    } finally {
      setLoading(false);
    }
  };

  const toggleCustomerStatus = async (id: string, currentBlocked: boolean) => {
    try {
      const res = await fetch(`${API_URL}/customers/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('luxecart_token')}`
        },
        body: JSON.stringify({ isBlocked: !currentBlocked })
      });
      
      const data = await res.json();
      if (data.success) {
        setCustomers(customers.map(c => c.id === id ? { ...c, isBlocked: !currentBlocked } : c));
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.email.toLowerCase().includes(search.toLowerCase()) || 
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-brand-text-primary">Customers</h1>
      </div>

      {error && (
        <div className="p-4 bg-brand-error/10 border border-brand-error/20 text-brand-error rounded-lg text-sm flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" /> {error}
        </div>
      )}

      <div className="bg-brand-surface rounded-xl border border-brand-border shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-brand-border flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-brand-bg border border-brand-border rounded-lg text-sm focus:outline-none focus:border-brand-primary text-brand-text-primary"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-bg border-b border-brand-border text-brand-text-secondary font-medium">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Orders</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-brand-text-secondary">Loading customers...</td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-brand-text-secondary">No customers found.</td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-brand-bg/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold">
                          {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-brand-text-primary">{customer.firstName} {customer.lastName}</p>
                          <p className="text-xs text-brand-text-secondary">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        customer.isBlocked ? 'bg-brand-error/10 text-brand-error' : 'bg-brand-success/10 text-brand-success'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${customer.isBlocked ? 'bg-brand-error' : 'bg-brand-success'}`} />
                        {customer.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-brand-text-secondary font-medium">
                      {customer._count?.orders || 0}
                    </td>
                    <td className="px-6 py-4 text-brand-text-secondary">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => toggleCustomerStatus(customer.id, customer.isBlocked)}
                          title={customer.isBlocked ? "Unblock User" : "Block User"}
                          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            customer.isBlocked 
                              ? 'bg-brand-success/10 text-brand-success hover:bg-brand-success hover:text-white' 
                              : 'bg-brand-error/10 text-brand-error hover:bg-brand-error hover:text-white'
                          }`}
                        >
                          {customer.isBlocked ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                          {customer.isBlocked ? 'Unblock' : 'Block'}
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
