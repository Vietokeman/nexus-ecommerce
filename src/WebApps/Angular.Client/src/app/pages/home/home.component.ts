import { Component } from '@angular/core';

@Component({
    selector: 'app-home',
    template: `
    <div class="hero-section text-center py-5">
      <div class="container">
        <h1 class="display-4 mb-4">Welcome to Distributed E-Commerce Platform</h1>
        <p class="lead mb-4">
          A modern microservices-based e-commerce solution built with Angular and ABP Framework
        </p>
        <div class="row mt-5">
          <div class="col-md-3 mb-4">
            <div class="card h-100 shadow-sm">
              <div class="card-body text-center">
                <i class="bi bi-box-seam display-4 text-primary mb-3"></i>
                <h5 class="card-title">Products</h5>
                <p class="card-text">Browse and manage product catalog</p>
                <a routerLink="/products" class="btn btn-primary">View Products</a>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-4">
            <div class="card h-100 shadow-sm">
              <div class="card-body text-center">
                <i class="bi bi-people display-4 text-success mb-3"></i>
                <h5 class="card-title">Customers</h5>
                <p class="card-text">Manage customer information</p>
                <a routerLink="/customers" class="btn btn-success">View Customers</a>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-4">
            <div class="card h-100 shadow-sm">
              <div class="card-body text-center">
                <i class="bi bi-cart display-4 text-warning mb-3"></i>
                <h5 class="card-title">Shopping Cart</h5>
                <p class="card-text">View and manage shopping cart</p>
                <a routerLink="/basket" class="btn btn-warning">View Cart</a>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-4">
            <div class="card h-100 shadow-sm">
              <div class="card-body text-center">
                <i class="bi bi-receipt display-4 text-info mb-3"></i>
                <h5 class="card-title">Orders</h5>
                <p class="card-text">Track and manage orders</p>
                <a routerLink="/orders" class="btn btn-info">View Orders</a>
              </div>
            </div>
          </div>
        </div>

        <div class="row mt-5">
          <div class="col-md-12">
            <h3 class="mb-4">Architecture Overview</h3>
            <div class="card">
              <div class="card-body">
                <ul class="list-unstyled text-start">
                  <li class="mb-2">
                    <strong>🚪 API Gateway (Ocelot):</strong> Single entry point on port 5000
                  </li>
                  <li class="mb-2">
                    <strong>🛍️ Product API:</strong> Product catalog management
                  </li>
                  <li class="mb-2">
                    <strong>👤 Customer API:</strong> Customer information management
                  </li>
                  <li class="mb-2">
                    <strong>🛒 Basket API:</strong> Shopping cart operations
                  </li>
                  <li class="mb-2">
                    <strong>📦 Ordering API:</strong> Order processing and tracking
                  </li>
                  <li class="mb-2">
                    <strong>💾 Databases:</strong> SQL Server, MySQL, PostgreSQL, MongoDB, Redis
                  </li>
                  <li class="mb-2">
                    <strong>📨 Message Broker:</strong> RabbitMQ for async communication
                  </li>
                  <li class="mb-2">
                    <strong>🔍 Monitoring:</strong> Elasticsearch & Kibana for logging
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [
        `
      .hero-section {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        min-height: 300px;
        border-radius: 10px;
        margin-bottom: 30px;
      }

      .card {
        transition: transform 0.3s ease;
      }

      .card:hover {
        transform: translateY(-5px);
      }

      .bi {
        font-size: 3rem;
      }
    `,
    ],
})
export class HomeComponent { }
