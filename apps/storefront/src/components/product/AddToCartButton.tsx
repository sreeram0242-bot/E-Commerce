'use client';

import { useState, useMemo } from 'react';
import { useCartStore } from '@/store';

export function AddToCartButton({ product }: { product: any }) {
  const addItem = useCartStore(s => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  const primaryImage = product.images?.find((i: any) => i.isPrimary) || product.images?.[0];

  // Group variants by their "name" (e.g. "Size", "Color")
  const variantGroups = useMemo(() => {
    if (!product.variants?.length) return {};
    const groups: Record<string, any[]> = {};
    product.variants.forEach((v: any) => {
      if (!groups[v.name]) groups[v.name] = [];
      groups[v.name].push(v);
    });
    return groups;
  }, [product.variants]);

  const hasVariants = Object.keys(variantGroups).length > 0;

  // Find the selected variant object (matching all selections)
  const selectedVariant = useMemo(() => {
    if (!hasVariants) return null;
    const groupNames = Object.keys(variantGroups);
    if (groupNames.length === 1) {
      const groupName = groupNames[0];
      return product.variants.find((v: any) => v.name === groupName && v.value === selected[groupName]) || null;
    }
    // Multi-group: find variant matching ALL selected values (by convention: comma-joined slug)
    return product.variants.find((v: any) =>
      Object.entries(selected).every(([name, value]) => {
        if (v.name === name && v.value === value) return true;
        return false;
      })
    ) || null;
  }, [selected, product.variants, variantGroups, hasVariants]);

  const effectivePrice = selectedVariant?.price || product.basePrice;
  const effectiveStock = selectedVariant ? selectedVariant.stock : (hasVariants ? 0 : product.stock);
  const isOutOfStock = effectiveStock <= 0 && !(!hasVariants && product.stock > 0);
  const allSelected = !hasVariants || Object.keys(variantGroups).every(name => !!selected[name]);

  const handleAdd = () => {
    setError('');
    if (hasVariants && !allSelected) {
      setError(`Please select: ${Object.keys(variantGroups).filter(n => !selected[n]).join(', ')}`);
      return;
    }
    if (isOutOfStock) return;

    const variantLabel = Object.entries(selected).map(([k, v]) => `${k}: ${v}`).join(', ');

    addItem({
      productId: product.id,
      variantId: selectedVariant?.id,
      name: product.name,
      price: effectivePrice,
      compareAtPrice: product.compareAtPrice,
      image: primaryImage?.url,
      quantity,
      variant: variantLabel || undefined,
      stock: effectiveStock || product.stock,
    });
  };

  return (
    <div className="space-y-5">
      {/* Variant Selectors */}
      {hasVariants && Object.entries(variantGroups).map(([groupName, options]) => (
        <div key={groupName}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-brand-text-primary">{groupName}</p>
            {selected[groupName] && (
              <p className="text-sm text-brand-primary font-medium">{selected[groupName]}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {options.map((variant: any) => {
              const isSelected = selected[groupName] === variant.value;
              const isOos = variant.stock <= 0;
              return (
                <button
                  key={variant.id}
                  type="button"
                  disabled={isOos}
                  onClick={() => setSelected(prev => ({ ...prev, [groupName]: variant.value }))}
                  className={`
                    relative min-w-[48px] px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border-2
                    ${isSelected
                      ? 'text-white'
                      : isOos
                        ? 'border-transparent text-brand-text-secondary line-through cursor-not-allowed opacity-50 bg-brand-bg'
                        : 'border-transparent text-brand-text-primary hover:border-blue-500 bg-brand-bg hover:text-blue-400'
                    }
                  `}
                  style={isSelected ? {
                    background: 'linear-gradient(180deg,#4F8DFF 0%,#2563EB 100%)',
                    border: '2px solid #3B82F6',
                    boxShadow: '0 0 16px rgba(59,130,246,0.35)',
                  } : { background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.08)' }}
                >
                  {variant.value}
                  {isOos && !isSelected && (
                    <span className="absolute -top-1.5 -right-1.5 text-[9px] bg-brand-error text-white px-1 rounded-full">OOS</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Stock indicator */}
      {effectiveStock > 0 && effectiveStock <= 10 && (
        <p className="text-xs font-medium text-brand-warning">
          ⚠️ Only {effectiveStock} left in stock!
        </p>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-brand-error bg-brand-error/10 border border-brand-error/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Price display (updates when variant selected) */}
      {selectedVariant?.price && selectedVariant.price !== product.basePrice && (
        <p className="text-lg font-bold text-brand-primary">
          ₹{effectivePrice.toLocaleString('en-IN')}
          <span className="text-sm text-brand-text-secondary font-normal ml-2">(price for {selectedVariant.value})</span>
        </p>
      )}

      {/* Quantity + Add to Cart */}
      {isOutOfStock && !allSelected ? (
        <button
          onClick={handleAdd}
          className="w-full py-4 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary-hover transition-colors shadow-lg shadow-brand-primary/30"
        >
          Select Options
        </button>
      ) : isOutOfStock ? (
        <button disabled className="w-full py-4 bg-brand-bg text-brand-text-secondary font-bold rounded-xl border border-brand-border cursor-not-allowed">
          Out of Stock
        </button>
      ) : (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center justify-between border-2 border-brand-border rounded-xl px-4 py-3 sm:w-36 bg-brand-surface">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="text-brand-text-secondary hover:text-brand-primary transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <span className="font-bold text-brand-text-primary text-lg w-8 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(effectiveStock || product.stock, quantity + 1))}
              className="text-brand-text-secondary hover:text-brand-primary transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>

          <button
            onClick={handleAdd}
            className="flex-1 py-3.5 text-white font-bold rounded-2xl transition-all active:scale-[0.98]"
            style={{
              background: 'linear-gradient(180deg,#4F8DFF 0%,#2563EB 100%)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 12px 28px rgba(37,99,235,0.35)',
            }}
          >
            Add to Cart
          </button>
        </div>
      )}
    </div>
  );
}
