# Angular E-Commerce Client - ABP Framework

## 📋 Overview

This is an Angular-based client application for the Distributed E-Commerce Platform microservices. The application is built using **ABP Framework** modules and connects to the Ocelot API Gateway.

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│     Angular Client (Port 4200)      │
│      with ABP Framework             │
└────────────────┬────────────────────┘
                 │
                 ↓
┌────────────────────────────────────┐
│   Ocelot API Gateway (Port 5000)   │
└────┬──────┬──────┬─────────┬───────┘
     │      │      │         │
     ↓      ↓      ↓         ↓
┌─────┐ ┌────┐ ┌────┐ ┌─────────┐
│Prod │ │Cust│ │Bask│ │Ordering │
│API  │ │API │ │API │ │  API    │
└─────┘ └────┘ └────┘ └─────────┘
```

## 🚀 Features

### Implemented Modules

1. **Product Management**
   - List all products
   - View product details
   - Create new products
   - Update existing products
   - Delete products
   - Search by product number

2. **Customer Management**
   - List all customers
   - Create new customers
   - Delete customers
   - View customer details

3. **Shopping Cart (Basket)**
   - View cart items
   - Add items to cart
   - Update item quantities
   - Remove items from cart
   - Calculate total price
   - Clear entire cart

4. **Order Management**
   - View order history
   - Filter orders by username
   - View order details

### ABP Framework Integration

- **@abp/ng.core**: Core ABP functionality
- **@abp/ng.theme.shared**: Shared theme components
- **@abp/ng.theme.basic**: Basic theme layout with navbar
- Environment-based configuration
- HTTP client with error handling
- Retry logic for failed requests

## 📦 Project Structure

```
src/
├── app/
│   ├── models/               # TypeScript interfaces
│   │   ├── product.model.ts
│   │   ├── customer.model.ts
│   │   ├── basket.model.ts
│   │   └── order.model.ts
│   ├── services/             # API services
│   │   ├── product.service.ts
│   │   ├── customer.service.ts
│   │   ├── basket.service.ts
│   │   └── order.service.ts
│   ├── pages/                # Feature components
│   │   ├── home/
│   │   ├── products/
│   │   │   ├── product-list/
│   │   │   └── product-detail/
│   │   ├── customers/
│   │   ├── basket/
│   │   └── orders/
│   ├── app.module.ts
│   ├── app-routing.module.ts
│   └── app.component.ts
├── environments/
│   ├── environment.ts        # Development config
│   └── environment.prod.ts   # Production config
├── styles.scss
└── index.html
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Angular CLI (optional)

### Step 1: Install Dependencies

```powershell
cd src/WebApps/Angular.Client
npm install
```

### Step 2: Configure Environment

Edit `src/environments/environment.ts` to match your API Gateway URL:

```typescript
export const environment = {
  production: false,
  apis: {
    default: {
      url: 'http://localhost:5000',  // Your API Gateway URL
    },
  },
};
```

### Step 3: Start Development Server

```powershell
npm start
```

The application will open at `http://localhost:4200`

## 🔧 Configuration

### API Endpoints

The application connects to these endpoints through the API Gateway:

| Service  | Endpoint                    | Port |
|----------|-----------------------------|------|
| Gateway  | http://localhost:5000       | 5000 |
| Products | /api/products               | -    |
| Customer | /api/customers              | -    |
| Basket   | /api/baskets                | -    |
| Orders   | /api/orders                 | -    |

### ABP Configuration

ABP modules are configured in `app.module.ts`:

```typescript
CoreModule.forRoot({
  environment,
}),
ThemeSharedModule.forRoot(),
ThemeBasicModule.forRoot(),
```

## 📖 Usage Examples

### 1. Products

Navigate to `/products` to:
- View all products in a card grid
- Click "Add Product" to create new products
- Click "View" to see product details
- Edit or delete products from detail page

### 2. Customers

Navigate to `/customers` to:
- View all customers in a table
- Add new customers with username, name, and email
- Delete existing customers

### 3. Shopping Cart

Navigate to `/basket` to:
- Enter username to load cart
- Add items with product details
- Modify quantities
- Remove items
- View total price

### 4. Orders

Navigate to `/orders` to:
- View order history by username
- See order details and totals

## 🔨 Development

### Build for Production

```powershell
npm run build
```

Output will be in `dist/angular-ecommerce-client/`

### Run Tests

```powershell
npm test
```

### Lint Code

```powershell
npm run lint
```

## 🐳 Docker Integration (Optional)

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist/angular-ecommerce-client /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:

```powershell
docker build -t angular-ecommerce-client .
docker run -p 80:80 angular-ecommerce-client
```

## 🔐 Security Considerations

### Development Mode
- CORS is enabled for localhost
- No authentication required
- HTTP connections allowed

### Production Mode
- Update `environment.prod.ts` with HTTPS URLs
- Implement authentication with ABP Identity
- Add authorization guards to routes
- Enable HTTPS only

## 🚦 Prerequisites for Running

### 1. Start Microservices Infrastructure

```powershell
cd d:\Github-Repo\Microservice\distributed-ecommerce-platform\src
docker-compose up -d
```

This will start:
- All databases (SQL Server, MySQL, PostgreSQL, MongoDB, Redis)
- RabbitMQ
- Elasticsearch & Kibana
- All microservices APIs
- Ocelot API Gateway on port 5000

### 2. Verify Services

Check that the API Gateway is running:
```
http://localhost:5000
```

### 3. Start Angular Client

```powershell
cd src/WebApps/Angular.Client
npm start
```

Access the application at:
```
http://localhost:4200
```

## 📝 API Service Methods

### ProductService
- `getProducts()`: Get all products
- `getProductById(id)`: Get product by ID
- `getProductByNo(productNo)`: Get product by number
- `createProduct(dto)`: Create new product
- `updateProduct(id, dto)`: Update product
- `deleteProduct(id)`: Delete product

### CustomerService
- `getCustomers()`: Get all customers
- `getCustomerByUsername(username)`: Get customer
- `createCustomer(dto)`: Create customer
- `deleteCustomer(username)`: Delete customer

### BasketService
- `getBasket(username)`: Get user's cart
- `updateBasket(cart)`: Update cart
- `deleteBasket(username)`: Clear cart
- `checkout(basketCheckout)`: Checkout cart

### OrderService
- `getOrders(username)`: Get user's orders

## 🎨 Customization

### Theme Customization

Edit `src/styles.scss` to customize colors:

```scss
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  // Add your colors
}
```

### ABP Theme

The ABP Basic Theme provides:
- Responsive navbar
- Bootstrap 5 styling
- Built-in layouts
- Localization support

## 📚 Learning Resources

### ABP Framework
- [ABP Angular Documentation](https://docs.abp.io/en/abp/latest/UI/Angular/Quick-Start)
- [ABP Angular Tutorials](https://docs.abp.io/en/abp/latest/Tutorials/Angular)

### Microservices
- Backend API Documentation: See `README.md` in root folder
- Ocelot Gateway: See `src/APIGateWays/OcelotApiGw/README.md`

## 🐛 Troubleshooting

### CORS Issues
- Ensure API Gateway has CORS enabled
- Check `docker-compose.override.yml` for CORS settings

### Connection Refused
- Verify API Gateway is running on port 5000
- Check Docker containers: `docker ps`
- Verify network connectivity

### Module Not Found
- Run `npm install` again
- Clear node_modules: `rm -rf node_modules && npm install`

## 📄 License

This project is part of the Distributed E-Commerce Platform.

## 👥 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📞 Support

For issues and questions:
- Check the documentation
- Review API logs in Kibana: `http://localhost:5601`
- Check service health in Portainer: `http://localhost:9000`
