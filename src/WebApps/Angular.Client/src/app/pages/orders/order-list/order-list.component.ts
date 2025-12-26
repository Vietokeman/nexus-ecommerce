import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../../services/order.service';
import { Order } from '../../../models/order.model';

@Component({
  selector: 'app-order-list',
  template: `
    <div class="container">
      <h2 class="mb-4">Orders</h2>

      <div class="row mb-3">
        <div class="col-md-6">
          <label class="form-label">Username</label>
          <div class="input-group">
            <input type="text" class="form-control" [(ngModel)]="username" placeholder="Enter username" />
            <button class="btn btn-primary" (click)="loadOrders()">Load Orders</button>
          </div>
        </div>
      </div>

      <div *ngIf="loading" class="loading-spinner">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div *ngIf="error" class="error-message">
        {{ error }}
      </div>

      <div *ngIf="!loading && !error && orders.length > 0">
        <div class="card mb-3" *ngFor="let order of orders">
          <div class="card-body">
            <div class="row">
              <div class="col-md-8">
                <h5 class="card-title">Order #{{ order.id }}</h5>
                <p class="mb-1">
                  <strong>Customer:</strong> {{ order.firstName }} {{ order.lastName }} ({{ order.username }})
                </p>
                <p class="mb-1"><strong>Email:</strong> {{ order.emailAddress }}</p>
                <p class="mb-1">
                  <strong>Address:</strong> {{ order.addressLine }}, {{ order.state }}, {{ order.country }} -
                  {{ order.zipCode }}
                </p>
                <p class="mb-1">
                  <small class="text-muted">Ordered on: {{ order.createdDate | date : 'medium' }}</small>
                </p>
              </div>
              <div class="col-md-4 text-end">
                <h3 class="text-primary">\${{ order.totalPrice }}</h3>
                <span class="badge bg-success">Completed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && !error && orders.length === 0" class="alert alert-info">
        No orders found for this username.
      </div>
    </div>
  `,
  styles: [],
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  username = 'customer1';
  loading = false;
  error: string | null = null;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    if (!this.username) {
      this.error = 'Please enter a username';
      return;
    }

    this.loading = true;
    this.error = null;

    this.orderService.getOrders(this.username).subscribe({
      next: (data) => {
        this.orders = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      },
    });
  }
}
