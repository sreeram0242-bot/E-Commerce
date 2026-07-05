'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@luxecart.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.data.user.role === 'ADMIN') {
        localStorage.setItem('luxecart_token', data.data.accessToken);
        localStorage.setItem('luxecart_admin_user', JSON.stringify(data.data.user));
        router.push('/dashboard');
      } else if (data.success && data.data.user.role !== 'ADMIN') {
        setError('Access denied. Admin account required.');
      } else {
        setError(data.error || 'Invalid email or password.');
      }
    } catch {
      setError('Network error. Is the API server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-brand-primary font-bold text-2xl mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center text-white text-lg font-bold">L</div>
            LuxeCart
          </div>
          <p className="text-brand-text-secondary text-sm mt-2">Admin Control Panel</p>
        </div>

        <div className="bg-brand-surface border border-brand-border rounded-2xl p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-brand-text-primary mb-6">Sign in to Admin</h1>

          {error && (
            <div className="mb-4 p-3 bg-brand-error/10 border border-brand-error/20 text-brand-error text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-text-secondary mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-lg text-brand-text-primary focus:outline-none focus:border-brand-primary text-sm"
                placeholder="admin@luxecart.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-text-secondary mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-lg text-brand-text-primary focus:outline-none focus:border-brand-primary text-sm"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-primary-hover transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-brand-text-secondary mt-6">
          LuxeCart Admin · Restricted Access Only
        </p>
      </div>
    </div>
  );
}
