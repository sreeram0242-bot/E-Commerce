'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    try {
      const response = await api.post<any>('/auth/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });

      if (response.success && response.data) {
        setAuth(response.data.user, response.data.accessToken, response.data.refreshToken);
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-brand-surface p-8 sm:p-10 rounded-3xl border border-brand-border shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-display font-bold text-brand-text-primary">Create Account</h2>
          <p className="mt-2 text-sm text-brand-text-secondary">
            Join LuxeCart for a premium experience
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-4 bg-brand-error/10 border border-brand-error/20 rounded-xl text-brand-error text-sm text-center">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-text-primary mb-1">First Name</label>
              <input name="firstName" type="text" required value={formData.firstName} onChange={handleChange} className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl text-brand-text-primary focus:ring-2 focus:ring-brand-primary/50 transition-all outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-text-primary mb-1">Last Name</label>
              <input name="lastName" type="text" required value={formData.lastName} onChange={handleChange} className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl text-brand-text-primary focus:ring-2 focus:ring-brand-primary/50 transition-all outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-text-primary mb-1">Email address</label>
            <input name="email" type="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl text-brand-text-primary focus:ring-2 focus:ring-brand-primary/50 transition-all outline-none" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-brand-text-primary mb-1">Password</label>
            <input name="password" type="password" required value={formData.password} onChange={handleChange} className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl text-brand-text-primary focus:ring-2 focus:ring-brand-primary/50 transition-all outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-text-primary mb-1">Confirm Password</label>
            <input name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl text-brand-text-primary focus:ring-2 focus:ring-brand-primary/50 transition-all outline-none" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-primary text-white rounded-xl font-semibold hover:bg-brand-primary-hover transition-colors shadow-lg disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-brand-text-secondary">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-brand-primary hover:text-brand-primary-hover">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
