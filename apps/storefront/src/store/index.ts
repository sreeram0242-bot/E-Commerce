// ============================================================
// ZUSTAND STORES — Client-side state management
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Cart Store ──────────────────────────────────────────────

interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  image?: string;
  price: number;
  compareAtPrice?: number;
  variant?: string;
  quantity: number;
  stock?: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.productId === item.productId && i.variantId === item.variantId
          );

          if (existingIndex > -1) {
            const items = [...state.items];
            items[existingIndex].quantity += item.quantity;
            return { items, isOpen: true };
          }

          const id = `${item.productId}-${item.variantId || 'default'}-${Date.now()}`;
          return { items: [...state.items, { ...item, id }], isOpen: true };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'luxecart-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// ── Wishlist Store ──────────────────────────────────────────

interface WishlistStore {
  items: string[]; // product IDs
  toggle: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      toggle: (productId) => {
        set((state) => ({
          items: state.items.includes(productId)
            ? state.items.filter((id) => id !== productId)
            : [...state.items, productId],
        }));
      },

      isWishlisted: (productId) => get().items.includes(productId),

      clear: () => set({ items: [] }),
    }),
    { name: 'luxecart-wishlist' }
  )
);

// ── Auth Store ──────────────────────────────────────────────

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
}

interface AuthStore {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),

      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
    }),
    {
      name: 'luxecart-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// ── Search Store ────────────────────────────────────────────

interface SearchStore {
  query: string;
  isOpen: boolean;
  recentSearches: string[];
  setQuery: (query: string) => void;
  toggleSearch: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

export const useSearchStore = create<SearchStore>()(
  persist(
    (set, get) => ({
      query: '',
      isOpen: false,
      recentSearches: [],

      setQuery: (query) => set({ query }),
      toggleSearch: () => set((state) => ({ isOpen: !state.isOpen })),
      openSearch: () => set({ isOpen: true }),
      closeSearch: () => set({ isOpen: false, query: '' }),

      addRecentSearch: (query) => {
        if (!query.trim()) return;
        set((state) => ({
          recentSearches: [
            query,
            ...state.recentSearches.filter((q) => q !== query),
          ].slice(0, 10),
        }));
      },

      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: 'luxecart-search',
      partialize: (state) => ({ recentSearches: state.recentSearches }),
    }
  )
);
