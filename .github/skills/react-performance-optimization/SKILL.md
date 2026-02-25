---
name: react-performance-optimization
description: React 19 + Vite 6 performance optimization patterns. Use when building SPAs, optimizing bundle size, improving rendering performance, or implementing data fetching strategies.
license: MIT
metadata:
  author: Nexus Commerce Team
  version: "1.0.0"
  based_on: Vercel React Best Practices
---

# React Performance Optimization Skills

Performance optimization guide for React 19 applications with Vite 6, TailwindCSS v4, React Query (TanStack Query), and Material-UI. Focused on bundle size reduction, eliminating waterfalls, and optimizing re-renders.

## When to Apply

Reference these guidelines when:

- Building new React components or pages
- Optimizing bundle size and load times
- Implementing data fetching logic
- Reducing unnecessary re-renders
- Lazy loading components or routes
- Configuring Vite build optimization
- Implementing caching strategies

## Technology Stack

| Technology     | Purpose           | Version |
| -------------- | ----------------- | ------- |
| React          | UI Framework      | 19.x    |
| Vite           | Build Tool        | 6.x     |
| TailwindCSS    | Styling           | 4.x     |
| React Router   | Routing           | 7.x     |
| TanStack Query | Data Fetching     | Latest  |
| Material-UI    | Component Library | Latest  |

## Project Structure

```
src/
├── components/
│   ├── layouts/              # Layout components
│   └── ui/                   # Reusable UI components
│
├── features/                 # Feature-based organization
│   ├── auth/
│   ├── products/
│   └── orders/
│
├── hooks/                    # Custom React hooks
├── lib/                      # Utilities and configs
│   ├── api.ts               # API client
│   ├── react-query.ts       # React Query config
│   └── axios.ts             # Axios config
│
├── routes/                   # Route configuration
│   ├── index.tsx            # Route definitions
│   ├── private-route.tsx    # Protected routes
│   └── public-route.tsx     # Public routes
│
├── store/                    # State management (Zustand)
│   ├── auth-store.ts
│   └── global-store.ts
│
└── types/                    # TypeScript types
```

## Rule Categories by Priority

| Priority | Category               | Impact   | Rules   |
| -------- | ---------------------- | -------- | ------- |
| 1        | Bundle Size            | CRITICAL | 8 rules |
| 2        | Data Fetching          | CRITICAL | 6 rules |
| 3        | Re-render Optimization | HIGH     | 7 rules |
| 4        | Component Performance  | MEDIUM   | 5 rules |
| 5        | JavaScript Performance | LOW      | 4 rules |

## Quick Reference

### 1. Bundle Size Optimization (CRITICAL)

**Rule: Avoid barrel file imports**

```typescript
// ❌ Imports entire library
import { Button, TextField, Dialog } from "@mui/material";

// ✅ Direct imports
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
```

**Rule: Dynamic imports for heavy components**

```typescript
// ❌ Static import
import HeavyChart from '@/components/HeavyChart'

// ✅ Dynamic import with code splitting
const HeavyChart = lazy(() => import('@/components/HeavyChart'))

function Dashboard() {
  return (
    <Suspense fallback={<Spinner />}>
      <HeavyChart />
    </Suspense>
  )
}
```

**Rule: Conditional module loading**

```typescript
// ❌ Loads library unconditionally
import html2canvas from "html2canvas";

function ExportButton() {
  const handleExport = () => {
    html2canvas(element).then(/* ... */);
  };
}

// ✅ Load only when needed
function ExportButton() {
  const handleExport = async () => {
    const html2canvas = (await import("html2canvas")).default;
    html2canvas(element).then(/* ... */);
  };
}
```

**Rule: Defer non-critical libraries**

```typescript
// ✅ Load analytics after app loads
useEffect(() => {
  import("react-ga4").then((ReactGA) => {
    ReactGA.initialize("G-XXXXXXXXXX");
  });
}, []);
```

### 2. Data Fetching (CRITICAL)

**Rule: Use React Query for automatic deduplication**

```typescript
// ❌ Multiple components fetch same data
function ProductList() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts);
  }, []);
}

// ✅ React Query deduplicates requests
function ProductList() {
  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.get("/products"),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

**Rule: Parallel data fetching**

```typescript
// ❌ Waterfall requests
const user = await fetch("/api/user").then((r) => r.json());
const orders = await fetch(`/api/orders?userId=${user.id}`).then((r) =>
  r.json(),
);

// ✅ Parallel fetching
const [user, products] = await Promise.all([
  fetch("/api/user").then((r) => r.json()),
  fetch("/api/products").then((r) => r.json()),
]);

// Then fetch dependent data
const orders = await fetch(`/api/orders?userId=${user.id}`).then((r) =>
  r.json(),
);
```

**Rule: Optimistic updates**

```typescript
const addToCartMutation = useMutation({
  mutationFn: (productId: string) => api.post("/cart", { productId }),
  onMutate: async (productId) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ["cart"] });

    // Snapshot previous value
    const previousCart = queryClient.getQueryData(["cart"]);

    // Optimistically update
    queryClient.setQueryData(["cart"], (old: any) => ({
      ...old,
      items: [...old.items, { productId, quantity: 1 }],
    }));

    return { previousCart };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(["cart"], context?.previousCart);
  },
});
```

**Rule: Prefetch on user intent**

```typescript
function ProductCard({ product }: Props) {
  const queryClient = useQueryClient()

  const handleMouseEnter = () => {
    // Prefetch product details when user hovers
    queryClient.prefetchQuery({
      queryKey: ['product', product.id],
      queryFn: () => api.get(`/products/${product.id}`)
    })
  }

  return (
    <Link to={`/products/${product.id}`} onMouseEnter={handleMouseEnter}>
      {product.name}
    </Link>
  )
}
```

### 3. Re-render Optimization (HIGH)

**Rule: Use memo for expensive computations**

```typescript
// ❌ Recalculates on every render
function ProductList({ products }: Props) {
  const sortedProducts = products.sort((a, b) => b.price - a.price);
  const total = products.reduce((sum, p) => sum + p.price, 0);
}

// ✅ Only recalculates when products change
function ProductList({ products }: Props) {
  const sortedProducts = useMemo(
    () => products.sort((a, b) => b.price - a.price),
    [products],
  );

  const total = useMemo(
    () => products.reduce((sum, p) => sum + p.price, 0),
    [products],
  );
}
```

**Rule: Extract to memoized components**

```typescript
// ❌ ProductItem re-renders when parent updates
function ProductList({ products, searchQuery }: Props) {
  return (
    <>
      <SearchBox value={searchQuery} /> {/* Updates frequently */}
      {products.map(p => (
        <ProductItem key={p.id} product={p} />
      ))}
    </>
  )
}

// ✅ Memoize ProductItem to prevent re-renders
const ProductItem = memo(({ product }: Props) => {
  return <div>{product.name}</div>
})
```

**Rule: Use functional setState**

```typescript
// ❌ Depends on current state (closure)
const incrementCount = () => {
  setCount(count + 1);
};

// ✅ Functional update (no dependencies)
const incrementCount = () => {
  setCount((c) => c + 1);
};
```

**Rule: Lazy state initialization**

```typescript
// ❌ Expensive calculation runs on every render
const [cart, setCart] = useState(JSON.parse(localStorage.getItem("cart")));

// ✅ Function only runs once
const [cart, setCart] = useState(() =>
  JSON.parse(localStorage.getItem("cart")),
);
```

### 4. Component Performance (MEDIUM)

**Rule: Virtualize long lists**

```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

function ProductList({ products }: Props) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: products.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5
  })

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div key={virtualItem.key} style={{ height: `${virtualItem.size}px` }}>
            <ProductItem product={products[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Rule: Use transitions for non-urgent updates**

```typescript
import { useTransition } from 'react'

function SearchProducts() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredProducts, setFilteredProducts] = useState(products)
  const [isPending, startTransition] = useTransition()

  const handleSearch = (value: string) => {
    setSearchQuery(value) // Urgent: update input immediately

    // Non-urgent: filter can wait
    startTransition(() => {
      const filtered = products.filter(p =>
        p.name.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredProducts(filtered)
    })
  }

  return (
    <>
      <input value={searchQuery} onChange={e => handleSearch(e.target.value)} />
      {isPending && <Spinner />}
      <ProductList products={filteredProducts} />
    </>
  )
}
```

**Rule: Hoist static JSX elements**

```typescript
// ❌ Creates new object on every render
function ProductPage() {
  return (
    <Layout>
      <Header>
        <Logo /> {/* Recreated on every render */}
      </Header>
      <ProductDetails />
    </Layout>
  )
}

// ✅ Hoist static content
const HEADER = (
  <Header>
    <Logo />
  </Header>
)

function ProductPage() {
  return (
    <Layout>
      {HEADER}
      <ProductDetails />
    </Layout>
  )
}
```

### 5. Vite Configuration (CRITICAL)

**Rule: Optimize build configuration**

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: ["@mui/material", "@mui/icons-material"],
          data: ["@tanstack/react-query", "axios"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false, // Disable in production
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs
        drop_debugger: true,
      },
    },
  },
  server: {
    host: "0.0.0.0", // For Docker
    port: 3000,
    proxy: {
      "/api": {
        target: process.env.DOCKER_ENV
          ? "http://ocelot.apigw"
          : "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
```

**Rule: Configure PWA caching**

```typescript
// vite.config.ts
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.nexus-commerce\.com\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
            },
          },
        ],
      },
    }),
  ],
});
```

## Anti-Patterns to Avoid

| ❌ Anti-Pattern                      | ✅ Correct Pattern            |
| ------------------------------------ | ----------------------------- |
| Importing entire Material-UI         | Direct component imports      |
| Fetching data on component mount     | React Query with caching      |
| Not memoizing expensive calculations | useMemo for computations      |
| Re-rendering entire list             | Memoized list items           |
| Large bundle (>1MB)                  | Code splitting + lazy loading |
| Nested async waterfalls              | Parallel Promise.all()        |
| Using index as key                   | Stable unique IDs             |

## Performance Checklist

- [ ] Bundle size is under 500KB (gzipped)
- [ ] First Contentful Paint (FCP) < 1.8s
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] Time to Interactive (TTI) < 3.5s
- [ ] React Query is configured for all API calls
- [ ] Heavy components use lazy loading
- [ ] Lists over 100 items use virtualization
- [ ] Material-UI uses direct imports (not barrel files)
- [ ] Images use lazy loading and modern formats
- [ ] Critical CSS is inlined

## Debugging Performance

```typescript
// Detect slow renders
import { Profiler } from 'react'

function onRenderCallback(
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number
) {
  if (actualDuration > 16) { // Slower than 60fps
    console.warn(`Slow render in ${id}: ${actualDuration}ms`)
  }
}

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <YourComponents />
    </Profiler>
  )
}
```

## Resources

- [React DevTools Profiler](https://react.dev/learn/react-developer-tools)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Vite Performance Guide](https://vitejs.dev/guide/performance.html)
- [Web Vitals](https://web.dev/vitals/)

---

**Last Updated:** February 2026  
**Maintainer:** Nexus Commerce Team
