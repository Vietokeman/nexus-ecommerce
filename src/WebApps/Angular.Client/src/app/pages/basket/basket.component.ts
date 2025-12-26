import { Component, OnInit } from '@angular/core';
import { BasketService } from '../../services/basket.service';
import { Cart, CartItem } from '../../models/basket.model';

@Component({
  selector: 'app-basket',
  template: `
    <div class="container">
      <h2 class="mb-4">Shopping Cart</h2>

      <div class="row mb-3">
        <div class="col-md-6">
          <label class="form-label">Username</label>
          <div class="input-group">
            <input type="text" class="form-control" [(ngModel)]="username" placeholder="Enter username" />
            <button class="btn btn-primary" (click)="loadBasket()">Load Cart</button>
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

      <div *ngIf="cart && !loading" class="row">
        <div class="col-md-8">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Cart Items</h5>
              <div *ngIf="cart.items && cart.items.length > 0">
                <div class="table-responsive">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Color</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Subtotal</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let item of cart.items; let i = index">
                        <td>{{ item.productName }}</td>
                        <td>{{ item.color }}</td>
                        <td>\${{ item.price }}</td>
                        <td>
                          <input
                            type="number"
                            class="form-control form-control-sm"
                            style="width: 80px"
                            [(ngModel)]="item.quantity"
                            min="1"
                            (change)="updateCart()"
                          />
                        </td>
                        <td>\${{ item.price * item.quantity }}</td>
                        <td>
                          <button class="btn btn-sm btn-danger" (click)="removeItem(i)">
                            <i class="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div *ngIf="!cart.items || cart.items.length === 0" class="alert alert-info">
                Your cart is empty
              </div>
            </div>
          </div>

          <div class="card mt-3">
            <div class="card-body">
              <h5 class="card-title">Add Item to Cart</h5>
              <form (ngSubmit)="addItem()">
                <div class="row">
                  <div class="col-md-4 mb-3">
                    <label class="form-label">Product ID</label>
                    <input type="text" class="form-control" [(ngModel)]="newItem.productId" name="productId" required />
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="form-label">Product Name</label>
                    <input
                      type="text"
                      class="form-control"
                      [(ngModel)]="newItem.productName"
                      name="productName"
                      required
                    />
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="form-label">Price</label>
                    <input type="number" class="form-control" [(ngModel)]="newItem.price" name="price" required />
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="form-label">Quantity</label>
                    <input type="number" class="form-control" [(ngModel)]="newItem.quantity" name="quantity" required />
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="form-label">Color</label>
                    <input type="text" class="form-control" [(ngModel)]="newItem.color" name="color" required />
                  </div>
                  <div class="col-md-4 mb-3 d-flex align-items-end">
                    <button type="submit" class="btn btn-success w-100">Add to Cart</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Order Summary</h5>
              <hr />
              <div class="d-flex justify-content-between mb-2">
                <span>Items:</span>
                <span>{{ getTotalItems() }}</span>
              </div>
              <div class="d-flex justify-content-between mb-3">
                <strong>Total:</strong>
                <strong>\${{ getTotalPrice() }}</strong>
              </div>
              <button class="btn btn-primary w-100 mb-2" (click)="updateCart()">Update Cart</button>
              <button class="btn btn-danger w-100" (click)="clearCart()">Clear Cart</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class BasketComponent implements OnInit {
  cart: Cart | null = null;
  username = 'customer1';
  loading = false;
  error: string | null = null;
  newItem: CartItem = {
    productId: '',
    productName: '',
    price: 0,
    quantity: 1,
    color: 'Black',
  };

  constructor(private basketService: BasketService) {}

  ngOnInit(): void {
    this.loadBasket();
  }

  loadBasket(): void {
    if (!this.username) {
      this.error = 'Please enter a username';
      return;
    }

    this.loading = true;
    this.error = null;

    this.basketService.getBasket(this.username).subscribe({
      next: (data) => {
        this.cart = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
        // Initialize empty cart if not found
        this.cart = {
          username: this.username,
          items: [],
        };
      },
    });
  }

  addItem(): void {
    if (!this.cart) {
      this.cart = {
        username: this.username,
        items: [],
      };
    }

    this.cart.items.push({ ...this.newItem });
    this.updateCart();
    this.resetNewItem();
  }

  removeItem(index: number): void {
    if (this.cart) {
      this.cart.items.splice(index, 1);
      this.updateCart();
    }
  }

  updateCart(): void {
    if (this.cart) {
      this.basketService.updateBasket(this.cart).subscribe({
        next: (data) => {
          this.cart = data;
        },
        error: (err) => {
          this.error = err.message;
        },
      });
    }
  }

  clearCart(): void {
    if (this.username && confirm('Are you sure you want to clear the cart?')) {
      this.basketService.deleteBasket(this.username).subscribe({
        next: () => {
          this.cart = {
            username: this.username,
            items: [],
          };
        },
        error: (err) => {
          this.error = err.message;
        },
      });
    }
  }

  getTotalItems(): number {
    return this.cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  }

  getTotalPrice(): number {
    return this.cart?.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
  }

  resetNewItem(): void {
    this.newItem = {
      productId: '',
      productName: '',
      price: 0,
      quantity: 1,
      color: 'Black',
    };
  }
}
