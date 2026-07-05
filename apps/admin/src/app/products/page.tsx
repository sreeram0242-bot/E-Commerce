'use client';

import { useEffect, useState, KeyboardEvent } from 'react';
import { Plus, Search, Edit2, Trash2, X, Tag } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// ── Variant Prompt Input ───────────────────────────────────────
// Type a size like "S", "M", "XL" and press Enter or comma to add it as a tag
function VariantPromptInput({
  groupName,
  variants,
  onChange,
}: {
  groupName: string;
  variants: { name: string; value: string; stock: number; price: string }[];
  onChange: (variants: { name: string; value: string; stock: number; price: string }[]) => void;
}) {
  const [inputVal, setInputVal] = useState('');

  const addVariant = (raw: string) => {
    const val = raw.trim();
    if (!val) return;
    if (variants.find(v => v.value.toLowerCase() === val.toLowerCase())) return; // no duplicates
    onChange([...variants, { name: groupName, value: val, stock: 10, price: '' }]);
    setInputVal('');
  };

  const removeVariant = (idx: number) => {
    onChange(variants.filter((_, i) => i !== idx));
  };

  const updateVariant = (idx: number, field: 'stock' | 'price', val: string) => {
    const updated = [...variants];
    if (field === 'stock') updated[idx].stock = parseInt(val) || 0;
    if (field === 'price') updated[idx].price = val;
    onChange(updated);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addVariant(inputVal);
    } else if (e.key === 'Backspace' && !inputVal && variants.length > 0) {
      removeVariant(variants.length - 1);
    }
  };

  return (
    <div className="space-y-3">
      {/* Prompt-style tag input */}
      <div className="flex flex-wrap gap-2 min-h-[44px] p-2 bg-brand-bg border border-brand-border rounded-lg focus-within:border-brand-primary transition-colors">
        {variants.map((v, i) => (
          <span key={i} className="flex items-center gap-1 px-2.5 py-1 bg-brand-primary/10 text-brand-primary text-sm font-medium rounded-lg border border-brand-primary/20">
            {v.value}
            <button type="button" onClick={() => removeVariant(i)} className="ml-0.5 hover:text-brand-error text-xs">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addVariant(inputVal)}
          placeholder={variants.length === 0 ? `Type ${groupName} (e.g. S, M, L, XL) and press Enter...` : 'Add more...'}
          className="flex-1 min-w-[140px] bg-transparent text-sm text-brand-text-primary outline-none placeholder:text-brand-text-secondary"
        />
      </div>

      {/* Per-variant stock & price overrides */}
      {variants.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-brand-text-secondary font-medium">Set stock & price per option:</p>
          {variants.map((v, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-16 px-2 py-1.5 bg-brand-primary/10 text-brand-primary text-xs font-bold rounded-lg text-center shrink-0">
                {v.value}
              </span>
              <div className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-brand-text-secondary">Qty</span>
                  <input
                    type="number"
                    min="0"
                    value={v.stock}
                    onChange={e => updateVariant(i, 'stock', e.target.value)}
                    className="w-full pl-8 pr-2 py-1.5 bg-brand-bg border border-brand-border rounded-lg text-sm text-brand-text-primary focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div className="relative flex-1">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-brand-text-secondary">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={v.price}
                    placeholder="Base"
                    onChange={e => updateVariant(i, 'price', e.target.value)}
                    className="w-full pl-6 pr-2 py-1.5 bg-brand-bg border border-brand-border rounded-lg text-sm text-brand-text-primary focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Product Modal ──────────────────────────────────────────────
function ProductModal({
  product,
  categories,
  onClose,
  onSave,
}: {
  product: any;
  categories: any[];
  onClose: () => void;
  onSave: () => void;
}) {
  const isEdit = !!product?.id;

  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    categoryId: product?.categoryId || '',
    basePrice: product?.basePrice?.toString() || '',
    compareAtPrice: product?.compareAtPrice?.toString() || '',
    stock: product?.stock?.toString() || '0',
    sku: product?.sku || '',
    status: product?.status || 'DRAFT',
    isFeatured: product?.isFeatured || false,
    isNewArrival: product?.isNewArrival || false,
    isBestSeller: product?.isBestSeller || false,
    isOnSale: product?.isOnSale || false,
    imageUrl: product?.images?.[0]?.url || '',
    tags: product?.tags || '',
  });

  // Variant groups: each group has a name (Size, Color, etc.) and array of tag values
  const [variantGroups, setVariantGroups] = useState<{
    name: string;
    variants: { name: string; value: string; stock: number; price: string }[];
  }[]>(() => {
    if (!product?.variants?.length) return [];
    const groups: Record<string, any[]> = {};
    product.variants.forEach((v: any) => {
      if (!groups[v.name]) groups[v.name] = [];
      groups[v.name].push({ name: v.name, value: v.value, stock: v.stock, price: v.price?.toString() || '' });
    });
    return Object.entries(groups).map(([name, variants]) => ({ name, variants }));
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const addVariantGroup = (name: string) => {
    if (variantGroups.find(g => g.name.toLowerCase() === name.toLowerCase())) return;
    setVariantGroups([...variantGroups, { name, variants: [] }]);
  };

  const removeVariantGroup = (idx: number) => {
    setVariantGroups(variantGroups.filter((_, i) => i !== idx));
  };

  const updateGroup = (idx: number, variants: any[]) => {
    const updated = [...variantGroups];
    updated[idx].variants = variants;
    setVariantGroups(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('luxecart_token');
      const payload: any = {
        name: form.name,
        description: form.description,
        categoryId: form.categoryId || null,
        basePrice: parseFloat(form.basePrice),
        compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : null,
        stock: parseInt(form.stock),
        sku: form.sku || null,
        status: form.status,
        isFeatured: form.isFeatured,
        isNewArrival: form.isNewArrival,
        isBestSeller: form.isBestSeller,
        isOnSale: form.isOnSale,
        tags: form.tags,
      };

      let savedProduct: any;

      if (isEdit) {
        const res = await fetch(`${API_URL}/products/${product.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to update product');
        savedProduct = data.data;
      } else {
        const res = await fetch(`${API_URL}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to create product');
        savedProduct = data.data;

        // Add image if provided
        if (form.imageUrl) {
          await fetch(`${API_URL}/products/${savedProduct.id}/images`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ images: [{ url: form.imageUrl, isPrimary: true, sortOrder: 0 }] }),
          });
        }
      }

      // Save variants — send all groups flattened
      const allVariants = variantGroups.flatMap(g => g.variants);
      await fetch(`${API_URL}/products/${savedProduct.id}/variants`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ variants: allVariants }),
      });

      onSave();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const PRESET_GROUPS = [
    { label: '👕 Size (S/M/L/XL)', name: 'Size' },
    { label: '🎨 Color', name: 'Color' },
    { label: '📏 UK Size', name: 'UK Size' },
    { label: '🔢 Number Size', name: 'Number' },
    { label: '+ Custom', name: '' },
  ];

  const [customGroupName, setCustomGroupName] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-brand-surface border border-brand-border rounded-2xl shadow-2xl w-full max-w-2xl my-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-brand-border">
          <h2 className="text-xl font-bold text-brand-text-primary">
            {isEdit ? `Edit: ${product.name}` : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-brand-bg rounded-lg transition-colors text-brand-text-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[80vh]">
          <div className="p-6 space-y-6">
            {error && (
              <div className="p-3 bg-brand-error/10 border border-brand-error/20 text-brand-error text-sm rounded-lg">
                {error}
              </div>
            )}

            {/* Basic Info */}
            <section>
              <h3 className="text-sm font-semibold text-brand-text-secondary uppercase tracking-wider mb-4">Basic Info</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-text-secondary mb-1.5">Product Name *</label>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-lg text-sm text-brand-text-primary focus:outline-none focus:border-brand-primary"
                    placeholder="e.g. Premium Cotton Slim Fit Shirt"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-text-secondary mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-lg text-sm text-brand-text-primary focus:outline-none focus:border-brand-primary resize-none"
                    placeholder="Describe the product..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-text-secondary mb-1.5">Category</label>
                    <select
                      value={form.categoryId}
                      onChange={e => setForm({ ...form, categoryId: e.target.value })}
                      className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-lg text-sm text-brand-text-primary focus:outline-none focus:border-brand-primary"
                    >
                      <option value="">No Category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-text-secondary mb-1.5">Status</label>
                    <select
                      value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value })}
                      className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-lg text-sm text-brand-text-primary focus:outline-none focus:border-brand-primary"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                </div>
                {!isEdit && (
                  <div>
                    <label className="block text-sm font-medium text-brand-text-secondary mb-1.5">Image URL</label>
                    <input
                      type="url"
                      value={form.imageUrl}
                      onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-lg text-sm text-brand-text-primary focus:outline-none focus:border-brand-primary"
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                )}
              </div>
            </section>

            {/* Pricing & Stock */}
            <section>
              <h3 className="text-sm font-semibold text-brand-text-secondary uppercase tracking-wider mb-4">Pricing & Stock</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-text-secondary mb-1.5">Base Price (₹) *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.basePrice}
                    onChange={e => setForm({ ...form, basePrice: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-lg text-sm text-brand-text-primary focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-text-secondary mb-1.5">Compare At (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.compareAtPrice}
                    onChange={e => setForm({ ...form, compareAtPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-lg text-sm text-brand-text-primary focus:outline-none focus:border-brand-primary"
                    placeholder="0 = no MRP"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-text-secondary mb-1.5">Base Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={e => setForm({ ...form, stock: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-lg text-sm text-brand-text-primary focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>
            </section>

            {/* ── VARIANT / SIZE SECTION ─────────────────────────────── */}
            <section>
              <div className="flex items-center gap-2 mb-1">
                <Tag className="w-4 h-4 text-brand-primary" />
                <h3 className="text-sm font-semibold text-brand-text-secondary uppercase tracking-wider">Sizes & Variants</h3>
              </div>
              <p className="text-xs text-brand-text-secondary mb-4">
                Add variant groups like Size or Color. Type a value and press <kbd className="px-1 py-0.5 bg-brand-bg border border-brand-border rounded text-[10px]">Enter</kbd> or <kbd className="px-1 py-0.5 bg-brand-bg border border-brand-border rounded text-[10px]">,</kbd> to tag it.
              </p>

              {/* Quick-add preset buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                {PRESET_GROUPS.map(preset => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      if (preset.name) {
                        addVariantGroup(preset.name);
                      }
                    }}
                    disabled={!!variantGroups.find(g => g.name === preset.name) && !!preset.name}
                    className="px-3 py-1.5 text-xs border border-brand-border rounded-lg text-brand-text-secondary hover:border-brand-primary hover:text-brand-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {preset.label}
                  </button>
                ))}
                {/* Custom group name input */}
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={customGroupName}
                    onChange={e => setCustomGroupName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (customGroupName.trim()) { addVariantGroup(customGroupName.trim()); setCustomGroupName(''); }
                      }
                    }}
                    placeholder="Custom group name..."
                    className="px-3 py-1.5 bg-brand-bg border border-brand-border rounded-lg text-xs text-brand-text-primary focus:outline-none focus:border-brand-primary w-36"
                  />
                  <button
                    type="button"
                    onClick={() => { if (customGroupName.trim()) { addVariantGroup(customGroupName.trim()); setCustomGroupName(''); } }}
                    className="px-2 py-1.5 bg-brand-primary text-white rounded-lg text-xs font-medium hover:bg-brand-primary-hover transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Variant Groups */}
              {variantGroups.length === 0 && (
                <div className="p-4 bg-brand-bg border border-dashed border-brand-border rounded-xl text-center text-brand-text-secondary text-sm">
                  Click a preset or type a custom group name above to add variants (e.g. Sizes: S, M, L, XL)
                </div>
              )}

              <div className="space-y-5">
                {variantGroups.map((group, idx) => (
                  <div key={idx} className="p-4 bg-brand-bg border border-brand-border rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-brand-text-primary text-sm">{group.name}</span>
                      <button
                        type="button"
                        onClick={() => removeVariantGroup(idx)}
                        className="p-1 text-brand-text-secondary hover:text-brand-error rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <VariantPromptInput
                      groupName={group.name}
                      variants={group.variants}
                      onChange={variants => updateGroup(idx, variants)}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Flags */}
            <section>
              <h3 className="text-sm font-semibold text-brand-text-secondary uppercase tracking-wider mb-3">Product Labels</h3>
              <div className="flex flex-wrap gap-3">
                {[
                  { key: 'isFeatured', label: '⭐ Featured' },
                  { key: 'isNewArrival', label: '✨ New Arrival' },
                  { key: 'isBestSeller', label: '🔥 Best Seller' },
                  { key: 'isOnSale', label: '🏷️ On Sale' },
                ].map(flag => (
                  <label key={flag.key} className="flex items-center gap-2 cursor-pointer px-3 py-2 bg-brand-bg border border-brand-border rounded-lg hover:border-brand-primary transition-colors">
                    <input
                      type="checkbox"
                      checked={(form as any)[flag.key]}
                      onChange={e => setForm({ ...form, [flag.key]: e.target.checked })}
                      className="accent-brand-primary"
                    />
                    <span className="text-sm text-brand-text-primary">{flag.label}</span>
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-brand-border">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm text-brand-text-secondary hover:bg-brand-bg rounded-lg transition-colors border border-brand-border font-medium">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-brand-primary text-white rounded-lg text-sm font-semibold hover:bg-brand-primary-hover transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Products Page ─────────────────────────────────────────
export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalProduct, setModalProduct] = useState<any>(null); // null = closed, {} = new, product = edit
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('luxecart_token');
      const res = await fetch(`${API_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setProducts(data.data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories?flat=true`);
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch { /* ignore */ }
  };

  const openAddModal = () => { setModalProduct({}); setModalOpen(true); };
  const openEditModal = async (product: any) => {
    // Fetch full product with variants
    const res = await fetch(`${API_URL}/products/${product.slug}`);
    const data = await res.json();
    setModalProduct(data.success ? data.data : product);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product permanently?')) return;
    setDeleting(id);
    try {
      const token = localStorage.getItem('luxecart_token');
      await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(products.filter(p => p.id !== id));
    } finally { setDeleting(null); }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {modalOpen && modalProduct !== null && (
        <ProductModal
          product={modalProduct}
          categories={categories}
          onClose={() => { setModalOpen(false); setModalProduct(null); }}
          onSave={() => { setModalOpen(false); setModalProduct(null); fetchProducts(); }}
        />
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-brand-text-primary">Products</h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover transition-colors font-medium text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="bg-brand-surface rounded-xl border border-brand-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-brand-border flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary" />
            <input
              type="text"
              placeholder="Search products..."
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
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Variants</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-brand-text-secondary">Loading products...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-brand-text-secondary">No products found.</td></tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-brand-bg/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-brand-bg shrink-0 overflow-hidden border border-brand-border">
                          {product.images?.[0]?.url && (
                            <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-brand-text-primary line-clamp-1">{product.name}</p>
                          <p className="text-xs text-brand-text-secondary">{product.sku || product.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-brand-text-secondary">{product.category?.name || '—'}</td>
                    <td className="px-6 py-4 text-brand-text-primary font-medium">₹{product.basePrice?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-brand-text-secondary">{product.stock}</td>
                    <td className="px-6 py-4">
                      {product.variants?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {product.variants.slice(0, 3).map((v: any) => (
                            <span key={v.id} className="px-1.5 py-0.5 bg-brand-primary/10 text-brand-primary text-xs rounded font-medium">
                              {v.value}
                            </span>
                          ))}
                          {product.variants.length > 3 && (
                            <span className="text-xs text-brand-text-secondary">+{product.variants.length - 3}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-brand-text-secondary">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        product.status === 'PUBLISHED' ? 'bg-brand-success/10 text-brand-success' :
                        product.status === 'ARCHIVED' ? 'bg-brand-text-secondary/10 text-brand-text-secondary' :
                        'bg-brand-warning/10 text-brand-warning'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-1.5 text-brand-text-secondary hover:text-brand-primary rounded hover:bg-brand-primary/10 transition-colors"
                          title="Edit product & variants"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deleting === product.id}
                          className="p-1.5 text-brand-text-secondary hover:text-brand-error rounded hover:bg-brand-error/10 transition-colors disabled:opacity-50"
                          title="Delete product"
                        >
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
