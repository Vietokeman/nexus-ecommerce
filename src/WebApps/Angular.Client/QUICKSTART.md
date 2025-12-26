# Quick Start Guide - Angular E-Commerce Client

## 🚀 5-Minute Setup

### Step 1: Navigate to Project Directory
```powershell
cd d:\Github-Repo\Microservice\distributed-ecommerce-platform\src\WebApps\Angular.Client
```

### Step 2: Install Dependencies
```powershell
npm install
```

This will install:
- Angular 17
- ABP Framework packages (@abp/ng.core, @abp/ng.theme.basic, @abp/ng.theme.shared)
- Bootstrap 5
- RxJS and other dependencies

### Step 3: Start Microservices (If Not Running)

Open a **new terminal** and run:
```powershell
cd d:\Github-Repo\Microservice\distributed-ecommerce-platform\src
docker-compose up -d
```

Wait for all services to start (about 30-60 seconds)

### Step 4: Verify API Gateway

Open browser and check:
```
http://localhost:5000
```

You should see the Ocelot API Gateway running.

### Step 5: Start Angular Application
```powershell
npm start
```

The application will:
- Compile TypeScript code
- Start development server on port 4200
- Automatically open browser at `http://localhost:4200`

### Step 6: Explore the Application

1. **Home Page** - Overview of all features
2. **Products** - Click to view product catalog
3. **Customers** - Manage customer data
4. **Basket** - Shopping cart functionality
5. **Orders** - View order history

## 📝 Test the Application

### Test Products
1. Go to `http://localhost:4200/products`
2. Click "Add Product"
3. Fill in the form:
   - Product No: PROD001
   - Name: Sample Product
   - Category: Electronics
   - Price: 99.99
   - Summary: A sample product
4. Click "Create"
5. View the product in the list

### Test Customers
1. Go to `http://localhost:4200/customers`
2. Click "Add Customer"
3. Fill in:
   - Username: john_doe
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com
4. Click "Create"

### Test Shopping Cart
1. Go to `http://localhost:4200/basket`
2. Enter username: customer1
3. Click "Load Cart"
4. Add items to cart
5. Update quantities
6. View total price

## 🔧 Common Issues

### Issue: npm install fails
**Solution:**
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# Reinstall
npm install
```

### Issue: Port 4200 already in use
**Solution:**
```powershell
# Run on different port
ng serve --port 4300
```

### Issue: Cannot connect to API
**Solution:**
1. Check if Docker containers are running:
```powershell
docker ps
```

2. Verify API Gateway:
```powershell
curl http://localhost:5000
```

3. Check logs:
```powershell
docker-compose logs ocelot.apigw
```

### Issue: CORS errors
**Solution:**
1. Ensure API Gateway CORS is enabled
2. Check `docker-compose.override.yml`
3. Restart containers:
```powershell
docker-compose restart
```

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server on port 4200 |
| `npm run build` | Build for production |
| `npm test` | Run unit tests |
| `npm run watch` | Build in watch mode |
| `npm run lint` | Lint TypeScript code |

## 🌐 URLs

| Service | URL |
|---------|-----|
| Angular App | http://localhost:4200 |
| API Gateway | http://localhost:5000 |
| Product API (direct) | http://localhost:6002 |
| Customer API (direct) | http://localhost:6003 |
| Basket API (direct) | http://localhost:6004 |
| Ordering API (direct) | http://localhost:6005 |
| Portainer | http://localhost:9000 |
| pgAdmin | http://localhost:5050 |
| RabbitMQ | http://localhost:15672 |
| Kibana | http://localhost:5601 |

## 🎯 Next Steps

1. **Explore the Code**
   - Check `src/app/services/` for API integration
   - Review `src/app/pages/` for UI components
   - See `src/app/models/` for TypeScript interfaces

2. **Customize the Theme**
   - Edit `src/styles.scss` for global styles
   - Modify ABP theme in component styles

3. **Add Features**
   - Implement authentication
   - Add product search
   - Create checkout flow
   - Add order tracking

4. **Learn More**
   - Read full README.md
   - Check ABP documentation
   - Explore microservices architecture

## 🎓 Understanding ABP Framework

### What is ABP?
ABP (ASP.NET Boilerplate) is a complete infrastructure to create modern web applications with:
- **Modular Architecture**: Reusable modules
- **Multi-tenancy**: Support for SaaS applications
- **Authentication & Authorization**: Built-in security
- **Localization**: Multi-language support
- **Theme Management**: Customizable UI themes

### ABP Modules Used in This Project

1. **@abp/ng.core**
   - HTTP client configuration
   - Environment settings
   - Configuration management
   - Utility functions

2. **@abp/ng.theme.shared**
   - Shared components
   - Common directives
   - Shared services

3. **@abp/ng.theme.basic**
   - Navigation bar component (`<abp-navbar>`)
   - Basic layout structure
   - Bootstrap integration

### Key ABP Concepts

#### Environment Configuration
```typescript
CoreModule.forRoot({
  environment,  // Loads API URLs and app config
})
```

#### Navbar Component
```html
<abp-navbar></abp-navbar>  <!-- ABP theme navbar -->
```

This provides:
- Responsive navigation
- Built-in menu system
- Theme integration

## 🔄 Development Workflow

### 1. Make Changes
Edit files in `src/app/`

### 2. Hot Reload
Angular CLI automatically recompiles and refreshes browser

### 3. Test Changes
Use browser DevTools to debug

### 4. Commit
```powershell
git add .
git commit -m "Your message"
```

## 📱 Mobile Testing

The application is responsive. Test on mobile:

1. Find your local IP:
```powershell
ipconfig
```

2. Start with host binding:
```powershell
ng serve --host 0.0.0.0
```

3. Access from mobile:
```
http://YOUR_IP:4200
```

## 🎉 Success!

You now have a fully functional Angular client with ABP Framework connected to your microservices!

Next: Explore the code and start building your features! 🚀
