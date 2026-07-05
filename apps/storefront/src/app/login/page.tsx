'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post<any>('/auth/login', { email, password });
      if (response.success && response.data) {
        setAuth(response.data.user, response.data.accessToken, response.data.refreshToken);
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-brand-surface p-8 sm:p-10 rounded-3xl border border-brand-border shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-display font-bold text-brand-text-primary">Welcome back</h2>
          <p className="mt-2 text-sm text-brand-text-secondary">
            Sign in to your LuxeCart account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-4 bg-brand-error/10 border border-brand-error/20 rounded-xl text-brand-error text-sm text-center">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-text-primary mb-1">Email address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-text-primary mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-primary text-white rounded-xl font-semibold hover:bg-brand-primary-hover transition-colors shadow-lg disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-brand-text-secondary">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-brand-primary hover:text-brand-primary-hover">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
