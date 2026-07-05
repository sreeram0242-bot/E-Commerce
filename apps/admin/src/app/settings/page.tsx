'use client';

import { useEffect, useState } from 'react';
import { Save, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    storeName: '',
    contactEmail: '',
    supportPhone: '',
    currency: 'INR',
    taxRate: '0',
    freeShippingThreshold: '0',
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/settings`);
      const data = await res.json();
      if (data.success) {
        setSettings(prev => ({ ...prev, ...data.data }));
      }
    } catch (err) {
      console.error(err);
      setError('Network error loading settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const saveSettings = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('luxecart_token')}`
        },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Settings updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to update settings');
      }
    } catch (err) {
      console.error(err);
      setError('Network error while saving');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-brand-text-secondary">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-brand-text-primary">Store Settings</h1>
        <button 
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover transition-colors font-medium text-sm shadow-sm disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-brand-error/10 border border-brand-error/20 text-brand-error rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-brand-success/10 border border-brand-success/20 text-brand-success rounded-lg text-sm">
          {success}
        </div>
      )}

      <div className="bg-brand-surface rounded-xl border border-brand-border shadow-sm overflow-hidden">
        <div className="p-6 space-y-8">
          
          {/* General Information */}
          <section>
            <h2 className="text-lg font-medium text-brand-text-primary mb-4 pb-2 border-b border-brand-border">General Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-brand-text-secondary mb-1.5">Store Name</label>
                <input
                  type="text"
                  name="storeName"
                  value={settings.storeName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-brand-bg border border-brand-border rounded-lg text-sm focus:outline-none focus:border-brand-primary text-brand-text-primary"
                  placeholder="e.g., LuxeCart"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text-secondary mb-1.5">Contact Email</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={settings.contactEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-brand-bg border border-brand-border rounded-lg text-sm focus:outline-none focus:border-brand-primary text-brand-text-primary"
                  placeholder="support@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text-secondary mb-1.5">Support Phone</label>
                <input
                  type="text"
                  name="supportPhone"
                  value={settings.supportPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-brand-bg border border-brand-border rounded-lg text-sm focus:outline-none focus:border-brand-primary text-brand-text-primary"
                />
              </div>
            </div>
          </section>

          {/* Commerce & Taxes */}
          <section>
            <h2 className="text-lg font-medium text-brand-text-primary mb-4 pb-2 border-b border-brand-border">Commerce & Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-brand-text-secondary mb-1.5">Currency</label>
                <select
                  name="currency"
                  value={settings.currency}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-brand-bg border border-brand-border rounded-lg text-sm focus:outline-none focus:border-brand-primary text-brand-text-primary"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text-secondary mb-1.5">Default Tax Rate (%)</label>
                <input
                  type="number"
                  name="taxRate"
                  value={settings.taxRate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-brand-bg border border-brand-border rounded-lg text-sm focus:outline-none focus:border-brand-primary text-brand-text-primary"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text-secondary mb-1.5">Free Shipping Threshold</label>
                <input
                  type="number"
                  name="freeShippingThreshold"
                  value={settings.freeShippingThreshold}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-brand-bg border border-brand-border rounded-lg text-sm focus:outline-none focus:border-brand-primary text-brand-text-primary"
                  min="0"
                />
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
