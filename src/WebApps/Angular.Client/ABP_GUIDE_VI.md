# ABP Framework với Angular - Tổng Quan

## 🎯 ABP Framework là gì?

**ABP (ASP.NET Boilerplate)** là một framework mã nguồn mở để xây dựng ứng dụng web hiện đại với:
- Architecture chuẩn mực
- Best practices built-in
- Modularity (tính mô-đun hóa)
- Multi-tenancy support
- Authentication & Authorization

## 🌟 Tại sao dùng ABP với Angular?

### 1. **Tích hợp sẵn**
```typescript
import { CoreModule } from '@abp/ng.core';
import { ThemeBasicModule } from '@abp/ng.theme.basic';
```

ABP cung cấp:
- HTTP client đã cấu hình
- Error handling tự động
- Loading indicators
- Permission system
- Localization (đa ngôn ngữ)

### 2. **Theme System**
```html
<abp-navbar></abp-navbar>  <!-- Navigation bar có sẵn -->
<router-outlet></router-outlet>
```

Có sẵn:
- Responsive navbar
- Footer
- Sidebar
- Layout templates

### 3. **Configuration Management**
```typescript
CoreModule.forRoot({
  environment: {
    apis: {
      default: { url: 'http://localhost:5000' }
    }
  }
})
```

### 4. **Service Proxies**
ABP tự động tạo TypeScript services từ backend APIs

## 📦 Cấu trúc Project này

### Modules
```
app.module.ts
├── BrowserModule
├── HttpClientModule
├── FormsModule
├── CoreModule.forRoot()          ← ABP Core
├── ThemeSharedModule.forRoot()   ← ABP Shared
└── ThemeBasicModule.forRoot()    ← ABP Theme
```

### Services Layer
```
services/
├── product.service.ts    → Product API
├── customer.service.ts   → Customer API
├── basket.service.ts     → Basket API
└── order.service.ts      → Order API
```

Mỗi service:
- Kết nối với API Gateway
- Retry logic (thử lại khi lỗi)
- Error handling
- TypeScript types

### Models
```typescript
// product.model.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  // ...
}

export interface CreateProductDto {
  name: string;
  price: number;
  // ...
}
```

### Components
```
pages/
├── home/              → Trang chủ
├── products/
│   ├── product-list/  → Danh sách sản phẩm
│   └── product-detail/→ Chi tiết sản phẩm
├── customers/         → Quản lý khách hàng
├── basket/            → Giỏ hàng
└── orders/            → Đơn hàng
```

## 🔄 Data Flow

```
Component
   ↓ (gọi service)
Service
   ↓ (HTTP request)
API Gateway (Ocelot) - Port 5000
   ↓ (routing)
Microservice API
   ↓ (truy vấn)
Database
   ↓ (trả data)
Service ← API ← Gateway
   ↓ (Observable)
Component (hiển thị)
```

## 💡 Ví dụ thực tế

### 1. Lấy danh sách Products

**Component:**
```typescript
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  
  constructor(private productService: ProductService) {}
  
  ngOnInit(): void {
    this.loadProducts();
  }
  
  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => this.products = data,
      error: (err) => console.error(err)
    });
  }
}
```

**Service:**
```typescript
@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = 'http://localhost:5000/api/products';
  
  constructor(private http: HttpClient) {}
  
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl).pipe(
      retry(2),  // Thử lại 2 lần nếu lỗi
      catchError(this.handleError)
    );
  }
}
```

**Template:**
```html
<div *ngFor="let product of products">
  <h3>{{ product.name }}</h3>
  <p>{{ product.price | currency }}</p>
</div>
```

### 2. Tạo Product mới

**Component:**
```typescript
createProduct(): void {
  this.productService.createProduct(this.newProduct).subscribe({
    next: () => {
      this.loadProducts();  // Reload danh sách
      this.resetForm();
    },
    error: (err) => this.error = err.message
  });
}
```

**Form:**
```html
<form (ngSubmit)="createProduct()">
  <input [(ngModel)]="newProduct.name" name="name" required>
  <input [(ngModel)]="newProduct.price" name="price" type="number">
  <button type="submit">Create</button>
</form>
```

## 🎨 ABP Theme Components

### Navbar
```html
<abp-navbar></abp-navbar>
```

Tự động có:
- Logo
- Menu items
- User menu
- Language selector
- Responsive mobile menu

### Configuration
```typescript
// environment.ts
export const environment = {
  application: {
    name: 'Ecommerce App',
    logoUrl: '/assets/logo.png'
  },
  oAuthConfig: {
    issuer: 'http://localhost:5000',
    clientId: 'Angular_App'
  },
  apis: {
    default: {
      url: 'http://localhost:5000'
    }
  }
};
```

## 🔐 Security với ABP

ABP hỗ trợ:
- OAuth 2.0
- OpenID Connect
- JWT tokens
- Permission system

**Ví dụ guard:**
```typescript
import { AuthGuard } from '@abp/ng.core';

const routes: Routes = [
  {
    path: 'admin',
    canActivate: [AuthGuard],
    component: AdminComponent
  }
];
```

## 📚 ABP Modules nâng cao

### 1. @abp/ng.account
- Login page
- Register page
- Forgot password
- Profile management

### 2. @abp/ng.identity
- User management
- Role management
- Permission management

### 3. @abp/ng.tenant-management
- Multi-tenancy support
- Tenant creation
- Tenant management

## 🚀 Mở rộng ứng dụng

### Thêm Authentication

```powershell
npm install @abp/ng.account @abp/ng.identity
```

```typescript
// app.module.ts
import { AccountConfigModule } from '@abp/ng.account/config';

@NgModule({
  imports: [
    // ...
    AccountConfigModule.forRoot(),
  ]
})
```

### Thêm Localization

```typescript
// environment.ts
localization: {
  defaultResourceName: 'Ecommerce',
  languages: [
    { cultureName: 'en', displayName: 'English' },
    { cultureName: 'vi', displayName: 'Tiếng Việt' }
  ]
}
```

## 🎓 Học thêm về ABP

### Official Documentation
- [ABP.IO Documentation](https://docs.abp.io)
- [ABP Angular Tutorial](https://docs.abp.io/en/abp/latest/Tutorials/Angular)
- [ABP Community](https://community.abp.io)

### Recommended Learning Path
1. Angular basics (Components, Services, Routing)
2. RxJS và Observables
3. ABP Core concepts
4. ABP Angular modules
5. Microservices architecture

## ⚡ Performance Tips

### 1. Lazy Loading
```typescript
const routes: Routes = [
  {
    path: 'products',
    loadChildren: () => import('./products/products.module')
      .then(m => m.ProductsModule)
  }
];
```

### 2. Caching
```typescript
getProducts(): Observable<Product[]> {
  return this.http.get<Product[]>(this.apiUrl).pipe(
    shareReplay(1)  // Cache kết quả
  );
}
```

### 3. Virtual Scrolling
```html
<cdk-virtual-scroll-viewport itemSize="50">
  <div *cdkVirtualFor="let product of products">
    {{ product.name }}
  </div>
</cdk-virtual-scroll-viewport>
```

## 🎯 Best Practices

1. **Separation of Concerns**
   - Components chỉ handle UI
   - Services handle business logic
   - Models định nghĩa types

2. **Error Handling**
   - Centralized error handling
   - User-friendly error messages
   - Logging errors

3. **Type Safety**
   - Dùng TypeScript interfaces
   - Avoid `any` type
   - Enable strict mode

4. **Code Organization**
   - Feature modules
   - Shared modules
   - Core module for singletons

## 📝 Summary

Project này demonstrate:
✅ Angular 17 + ABP Framework integration
✅ Microservices connectivity via API Gateway
✅ CRUD operations cho Products, Customers, Basket, Orders
✅ Responsive UI với Bootstrap 5
✅ TypeScript type safety
✅ RxJS for reactive programming
✅ Error handling và retry logic
✅ ABP theme components

**Next Steps:**
- Chạy ứng dụng theo QUICKSTART.md
- Explore code trong src/app/
- Thử modify và thêm features
- Đọc ABP documentation để hiểu sâu hơn
