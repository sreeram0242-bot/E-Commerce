'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/categories?flat=true`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      } else {
        setError(data.error || 'Failed to load categories');
      }
    } catch (err) {
      console.error('Failed to fetch categories', err);
      setError('Network error loading categories');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-brand-text-primary">Categories</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover transition-colors font-medium text-sm shadow-sm">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {error && (
        <div className="p-4 bg-brand-error/10 border border-brand-error/20 text-brand-error rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-brand-surface rounded-xl border border-brand-border shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-brand-border flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary" />
            <input
              type="text"
              placeholder="Search categories..."
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
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Products</th>
                <th className="px-6 py-4">Visibility</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-brand-text-secondary">Loading categories...</td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-brand-text-secondary">No categories found.</td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-brand-bg/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-brand-text-primary">
                      {category.name}
                    </td>
                    <td className="px-6 py-4 text-brand-text-secondary">{category.slug}</td>
                    <td className="px-6 py-4 text-brand-text-secondary">{category._count?.products || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        category.isVisible ? 'bg-brand-success/10 text-brand-success' : 'bg-brand-text-secondary/10 text-brand-text-secondary'
                      }`}>
                        {category.isVisible ? 'Visible' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-1.5 text-brand-text-secondary hover:text-brand-primary rounded hover:bg-brand-primary/10 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-brand-text-secondary hover:text-brand-error rounded hover:bg-brand-error/10 transition-colors">
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
