'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingBag, Users, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('luxecart_token');
        const res = await fetch(`${API_URL}/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        } else {
          setError('Failed to load dashboard data');
        }
      } catch {
        setError('Network error. Is the API running?');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="text-brand-text-secondary animate-pulse">Loading dashboard...</div>;
  if (error) return <div className="p-4 bg-brand-error/10 text-brand-error rounded-lg">{error}</div>;
  if (!stats) return null;

  const statCards = [
    { title: 'Total Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-brand-success', bg: 'bg-brand-success/10' },
    { title: 'Total Orders', value: stats.totalOrders || 0, icon: ShoppingBag, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
    { title: 'Total Customers', value: stats.totalCustomers || 0, icon: Users, color: 'text-brand-accent', bg: 'bg-brand-accent/10' },
    { title: 'Pending Orders', value: stats.pendingOrders || 0, icon: AlertCircle, color: 'text-brand-warning', bg: 'bg-brand-warning/10' },
  ];

  const salesData = stats.salesByDay || [];
  const recentOrders = stats.recentOrders || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'bg-brand-success/10 text-brand-success';
      case 'SHIPPED': return 'bg-brand-accent/10 text-brand-accent';
      case 'CANCELLED': return 'bg-brand-error/10 text-brand-error';
      default: return 'bg-brand-warning/10 text-brand-warning';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-brand-text-secondary">{stat.title}</h3>
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-brand-text-primary">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-brand-surface border border-brand-border rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-semibold text-brand-text-primary mb-6">Revenue Overview (Last 7 Days)</h3>
          {salesData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--color-text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                    itemStyle={{ color: 'var(--color-primary)' }}
                    formatter={(val: number) => [`₹${val.toLocaleString('en-IN')}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-brand-text-secondary text-sm">
              No sales data yet. Place some orders first!
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-brand-text-primary">Recent Orders</h3>
            <Link href="/orders" className="text-xs text-brand-primary hover:underline font-medium">View all</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-brand-text-secondary text-sm">No orders yet.</p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between pb-4 border-b border-brand-border last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-brand-text-primary">{order.orderNumber}</p>
                    <p className="text-xs text-brand-text-secondary mt-0.5">₹{order.total?.toLocaleString('en-IN')}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Low Stock Alert */}
      {stats.lowStockProducts > 0 && (
        <div className="p-4 bg-brand-warning/10 border border-brand-warning/20 rounded-xl flex items-center justify-between">
          <p className="text-sm text-brand-warning font-medium">
            ⚠️ {stats.lowStockProducts} product(s) are running low on stock.
          </p>
          <Link href="/products" className="text-sm text-brand-warning font-bold underline">
            View Products
          </Link>
        </div>
      )}
    </div>
  );
}
