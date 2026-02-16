# 🎨 UI DESIGN REFERENCE - MERN Ecommerce to React + Tailwind + Zustand

**Hướng dẫn sao chép 100% UI/UX từ mern-ecommerce nhưng sử dụng stack mới**

---

## 📋 Stack Conversion

| Aspect | MERN Ecommerce (Original) | Distributed Ecommerce (New) |
|--------|---------------------------|------------------------------|
| **State Management** | Redux Toolkit | Zustand |
| **UI Framework** | Material-UI (MUI) | Tailwind CSS |
| **Forms** | react-hook-form | react-hook-form (giữ nguyên) |
| **Animations** | Framer Motion | Framer Motion (giữ nguyên) |
| **Notifications** | react-toastify | react-toastify (giữ nguyên) |
| **Routing** | react-router-dom v6 | react-router-dom v7 |
| **HTTP Client** | axios | axios (giữ nguyên) |
| **Icons** | MUI Icons | Lucide React / Heroicons |

---

## 🏗️ Project Structure Mapping

### MERN Ecommerce Structure
```
src/
├── features/
│   ├── products/
│   │   ├── components/
│   │   │   ├── ProductCard.jsx
│   │   │   ├── ProductList.jsx
│   │   │   ├── ProductDetails.jsx
│   │   │   └── ProductBanner.jsx
│   │   ├── ProductSlice.jsx
│   │   └── ProductApi.jsx
│   ├── cart/
│   │   ├── components/
│   │   ├── CartSlice.jsx
│   │   └── CartApi.jsx
│   ├── auth/
│   ├── navigation/
│   ├── wishlist/
│   └── ...
├── pages/
│   ├── HomePage.jsx
│   ├── ProductDetailsPage.jsx
│   ├── CartPage.jsx
│   └── ...
├── layout/
│   └── RootLayout.js
└── App.js
```

### Distributed Ecommerce Structure (Zustand + Tailwind)
```
src/
├── components/      # Reusable UI components
│   ├── products/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductDetails.tsx
│   │   └── ProductBanner.tsx
│   ├── cart/
│   │   ├── CartItem.tsx
│   │   ├── CartSummary.tsx
│   │   └── CartDrawer.tsx
│   ├── navigation/
│   │   ├── Navbar.tsx  
│   │   ├── Sidebar.tsx
│   │   └── CategoryMenu.tsx
│   ├── ui/          # Generic UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── ...
│   └── ...
├── store/           # Zustand stores
│   ├── product-store.ts
│   ├── cart-store.ts
│   ├── wishlist-store.ts
│   ├── auth-store.ts
│   └── ui-store.ts
├── pages/
│   ├── products/
│   │   ├── HomePage.tsx
│   │   └── ProductDetailsPage.tsx
│   ├── cart/
│   │   ├── CartPage.tsx
│   │   └── CheckoutPage.tsx
│   └── ...
├── layouts/
│   └── RootLayout.tsx
├── lib/             # Utilities
│   ├── api.ts
│   ├── endpoints.ts
│   └── react-query.ts
└── App.tsx
```

---

## 🎨 Component Conversion Guide

### 1. ProductCard Component

#### Original (MUI + Redux):
```jsx
// features/products/components/ProductCard.jsx
import { Paper, Stack, Typography, Checkbox } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { selectWishlistItems } from '../../wishlist/WishlistSlice';
import { addToCartAsync } from '../../cart/CartSlice';
import { motion } from 'framer-motion';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Favorite from '@mui/icons-material/Favorite';

export const ProductCard = ({ id, title, price, thumbnail, brand }) => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector(selectWishlistItems);
  const isInWishlist = wishlistItems.some(item => item.product._id === id);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    dispatch(addToCartAsync({ product: id }));
  };

  return (
    <Stack component={Paper} elevation={1} p={2} width="340px">
      <Stack>
        <img src={thumbnail} alt={title} />
      </Stack>
      <Stack spacing={1}>
        <Stack flexDirection="row" justifyContent="space-between">
          <Typography variant="h6">{title}</Typography>
          <Checkbox 
            checked={isInWishlist}
            icon={<FavoriteBorder />} 
            checkedIcon={<Favorite sx={{ color: 'red' }} />} 
          />
        </Stack>
        <Typography color="text.secondary">{brand}</Typography>
        <Stack flexDirection="row" justifyContent="space-between">
          <Typography>${price}</Typography>
          <motion.button 
            whileHover={{ scale: 1.03 }}
            onClick={handleAddToCart}
          >
            Add To Cart
          </motion.button>
        </Stack>
      </Stack>
    </Stack>
  );
};
```

#### New (Tailwind + Zustand):
```tsx
// src/components/products/ProductCard.tsx
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCartStore();
  const { wishlistItems, toggleWishlist } = useWishlistStore();
  const isInWishlist = wishlistItems.some(item => item.id === product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-sm p-4 w-full max-w-[340px] hover:shadow-md transition-shadow cursor-pointer"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      {/* Image */}
      <div className="aspect-square w-full overflow-hidden rounded-md mb-4">
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        {/* Title & Wishlist */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-normal line-clamp-1">
            {product.name}
          </h3>
          <motion.button
            whileHover={{ scale: 1.3, y: -10 }}
            whileTap={{ scale: 1 }}
            transition={{ duration: 0.4, type: 'spring' }}
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className="flex-shrink-0"
          >
            <Heart 
              className={`w-5 h-5 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
            />
          </motion.button>
        </div>

        {/* Brand */}
        <p className="text-sm text-gray-500">
          {product.attributes?.brand || 'Unknown Brand'}
        </p>

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-lg font-medium">
            ${product.price.toFixed(2)}
          </span>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 1 }}
            onClick={handleAddToCart}
            className="px-4 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800 transition-colors"
          >
            Add To Cart
          </motion.button>
        </div>

        {/* Stock Warning */}
        {product.attributes?.stockQuantity && product.attributes.stockQuantity <= 20 && (
          <p className="text-sm text-red-500">
            {product.attributes.stockQuantity === 1 
              ? 'Only 1 stock is left' 
              : 'Only few are left'}
          </p>
        )}
      </div>
    </motion.div>
  );
};
```

---

### 2. Zustand Store Setup

#### Redux Slice (Original):
```javascript
// features/cart/CartSlice.jsx
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { addToCart, fetchCartItems } from './CartApi';

export const addToCartAsync = createAsyncThunk(
  'cart/addToCart',
  async (data) => {
    const response = await addToCart(data);
    return response.data;
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    status: 'idle'
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addToCartAsync.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.status = 'fulfilled';
      });
  }
});

export const selectCartItems = (state) => state.cart.items;
export default cartSlice.reducer;
```

#### Zustand Store (New):
```typescript
// src/store/cart-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types/product';
import { apiClient } from '@/lib/api';
import { toast } from 'react-toastify';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => void;
  fetchCartItems: () => Promise<void>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,

      addToCart: async (product, quantity = 1) => {
        set({ isLoading: true, error: null });
        try {
          // Call API
          await apiClient.post('/api/v1/baskets', {
            productId: product.id,
            quantity
          });

          // Update local state
          const existingItem = get().items.find(
            item => item.product.id === product.id
          );

          if (existingItem) {
            set({
              items: get().items.map(item =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
              isLoading: false
            });
          } else {
            set({
              items: [...get().items, { product, quantity }],
              isLoading: false
            });
          }

          toast.success('Added to cart successfully!');
        } catch (error) {
          set({ 
            error: 'Failed to add to cart', 
            isLoading: false 
          });
          toast.error('Failed to add to cart');
        }
      },

      removeFromCart: async (productId) => {
        set({ isLoading: true });
        try {
          await apiClient.delete(`/api/v1/baskets/${productId}`);
          set({
            items: get().items.filter(item => item.product.id !== productId),
            isLoading: false
          });
          toast.success('Removed from cart');
        } catch (error) {
          set({ error: 'Failed to remove from cart', isLoading: false });
          toast.error('Failed to remove from cart');
        }
      },

      updateQuantity: async (productId, quantity) => {
        set({ isLoading: true });
        try {
          await apiClient.put('/api/v1/baskets', { productId, quantity });
          set({
            items: get().items.map(item =>
              item.product.id === productId
                ? { ...item, quantity }
                : item
            ),
            isLoading: false
          });
        } catch (error) {
          set({ error: 'Failed to update quantity', isLoading: false });
        }
      },

      clearCart: () => set({ items: [] }),

      fetchCartItems: async () => {
        set({ isLoading: true });
        try {
          const response = await apiClient.get('/api/v1/baskets');
          set({ items: response.data, isLoading: false });
        } catch (error) {
          set({ error: 'Failed to fetch cart', isLoading: false });
        }
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items })
    }
  )
);
```

---

### 3. Navbar Component

#### Original (MUI):
```jsx
// features/navigation/components/Navbar.jsx
import { AppBar, Toolbar, IconButton, Badge, Avatar } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useSelector } from 'react-redux';
import { selectCartItems } from '../../cart/CartSlice';

export const Navbar = () => {
  const cartItem = useSelector(selectCartItems);
  
  return (
    <AppBar position="sticky" sx={{ backgroundColor: 'black' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6">E-Commerce</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <IconButton color="inherit">
            <Badge badgeContent={cartItems.length} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
          <Avatar />
        </Box>
      </Toolbar>
    </AppBar>
  );
};
```

#### New (Tailwind):
```tsx
// src/components/navigation/Navbar.tsx
import { ShoppingCart, User, Search } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  const { items: cartItems } = useCartStore();
  const { user } = useAuthStore();

  return (
    <nav className="sticky top-0 z-50 bg-black text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-xl font-semibold">
            E-Commerce
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-4 py-2 pl-10 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <Link to="/cart" className="relative p-2 hover:bg-gray-800 rounded-full transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {/* User Avatar */}
            <Link to="/profile" className="p-1">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
```

---

## 🎨 Tailwind CSS Theme Configuration

### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        secondary: {
          500: '#8b5cf6',
          600: '#7c3aed',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      }
    },
  },
  plugins: [],
}
```

---

## 📝 Page Implementation Example

### HomePage

```tsx
// src/pages/products/HomePage.tsx
import { useEffect } from 'react';
import { Navbar } from '@/components/navigation/Navbar';
import { ProductGrid } from '@/components/products/ProductGrid';
import { Footer } from '@/components/Footer';
import { useProductStore } from '@/store/product-store';
import { Spinner } from '@/components/ui/Spinner';

export const HomePage = () => {
  const { products, isLoading, fetchProducts } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <ProductGrid products={products} />
      </main>
      <Footer />
    </div>
  );
};
```

---

## Icon Library - Migration Map

### MUI Icons → Lucide React

```typescript
// Icon mapping reference
import {
  ShoppingCart,        // ShoppingCartIcon
  Heart,               // FavoriteIcon / FavoriteBorderIcon
  User,                // PersonIcon / AccountCircleIcon
  Search,              // SearchIcon
  Menu,                // MenuIcon
  X,                   // CloseIcon
  ChevronRight,        // ChevronRightIcon
  ChevronLeft,         // ChevronLeftIcon
  Star,                // StarIcon / StarBorderIcon
  Trash2,              // DeleteIcon
  Edit,                // EditIcon
  Plus,                // AddIcon
  Minus,               // RemoveIcon
  Home,                // HomeIcon
  Package,             // InventoryIcon
  CreditCard,          // PaymentIcon
  Truck,               // LocalShippingIcon
} from 'lucide-react';
```

---

## 🚀 Next Steps

1. **Setup Project Dependencies**
   ```bash
   npm install zustand lucide-react clsx tailwind-merge
   npm install framer-motion react-toastify axios react-hook-form
   ```

2. **Create Base Components**
   - Button, Input, Card, Badge
   - Spinner, EmptyState, ErrorFallback

3. **Implement Stores**
   - auth-store.ts
   - cart-store.ts
   - product-store.ts
   - wishlist-store.ts

4. **Build Feature Components**
   - ProductCard, ProductGrid, ProductDetails
   - CartItem, CartSummary
   - Navbar, Footer

5. **Create Pages**
   - HomePage
   - ProductDetailsPage
   - CartPage
   - CheckoutPage
   - etc.

---

## 📚 Resources

- **Tailwind CSS Docs**: https://tailwindcss.com/docs
- **Zustand Docs**: https://docs.pmnd.rs/zustand
- **Lucide Icons**: https://lucide.dev/icons
- **Framer Motion**: https://www.framer.com/motion/

---

**Note**: Tài liệu này cung cấp pattern và examples. Bạn cần implement từng component theo pattern này để đạt được 100% UI/UX giống mern-ecommerce nhưng với stack mới.
