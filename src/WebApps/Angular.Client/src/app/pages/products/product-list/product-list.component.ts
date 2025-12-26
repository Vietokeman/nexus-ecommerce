import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';

@Component({
    selector: 'app-product-list',
    template: `
    <div class="container">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Products</h2>
        <button class="btn btn-primary" (click)="showCreateForm = !showCreateForm">
          <i class="bi bi-plus-circle"></i> Add Product
        </button>
      </div>

      <div *ngIf="showCreateForm" class="card mb-4">
        <div class="card-body">
          <h5 class="card-title">Create New Product</h5>
          <form (ngSubmit)="createProduct()">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Product No</label>
                <input type="text" class="form-control" [(ngModel)]="newProduct.no" name="no" required />
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Name</label>
                <input type="text" class="form-control" [(ngModel)]="newProduct.name" name="name" required />
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Category</label>
                <input type="text" class="form-control" [(ngModel)]="newProduct.category" name="category" required />
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Price</label>
                <input type="number" class="form-control" [(ngModel)]="newProduct.price" name="price" required />
              </div>
              <div class="col-md-12 mb-3">
                <label class="form-label">Summary</label>
                <input type="text" class="form-control" [(ngModel)]="newProduct.summary" name="summary" required />
              </div>
              <div class="col-md-12 mb-3">
                <label class="form-label">Description</label>
                <textarea class="form-control" [(ngModel)]="newProduct.description" name="description" rows="3"></textarea>
              </div>
              <div class="col-md-12 mb-3">
                <label class="form-label">Image URL</label>
                <input type="text" class="form-control" [(ngModel)]="newProduct.imageFile" name="imageFile" />
              </div>
            </div>
            <button type="submit" class="btn btn-primary me-2">Create</button>
            <button type="button" class="btn btn-secondary" (click)="showCreateForm = false">Cancel</button>
          </form>
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

      <div class="row" *ngIf="!loading && !error">
        <div class="col-md-4 mb-4" *ngFor="let product of products">
          <div class="card h-100">
            <img
              [src]="product.imageFile || 'https://via.placeholder.com/300'"
              class="card-img-top"
              [alt]="product.name"
              style="height: 200px; object-fit: cover"
            />
            <div class="card-body">
              <h5 class="card-title">{{ product.name }}</h5>
              <p class="card-text">
                <small class="text-muted">{{ product.category }}</small>
              </p>
              <p class="card-text">{{ product.summary }}</p>
              <p class="card-text">
                <strong>\${{ product.price }}</strong>
              </p>
              <div class="btn-group" role="group">
                <a [routerLink]="['/products', product.id]" class="btn btn-sm btn-info">View</a>
                <button class="btn btn-sm btn-danger" (click)="deleteProduct(product.id)">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && !error && products.length === 0" class="alert alert-info">
        No products found. Click "Add Product" to create one.
      </div>
    </div>
  `,
    styles: [
        `
      .card {
        transition: transform 0.3s ease;
      }
      .card:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      }
    `,
    ],
})
export class ProductListComponent implements OnInit {
    products: Product[] = [];
    loading = false;
    error: string | null = null;
    showCreateForm = false;
    newProduct: any = {
        no: '',
        name: '',
        summary: '',
        description: '',
        imageFile: '',
        price: 0,
        category: '',
    };

    constructor(private productService: ProductService) { }

    ngOnInit(): void {
        this.loadProducts();
    }

    loadProducts(): void {
        this.loading = true;
        this.error = null;

        this.productService.getProducts().subscribe({
            next: (data) => {
                this.products = data;
                this.loading = false;
            },
            error: (err) => {
                this.error = err.message;
                this.loading = false;
            },
        });
    }

    createProduct(): void {
        this.productService.createProduct(this.newProduct).subscribe({
            next: () => {
                this.showCreateForm = false;
                this.resetForm();
                this.loadProducts();
            },
            error: (err) => {
                this.error = err.message;
            },
        });
    }

    deleteProduct(id: string): void {
        if (confirm('Are you sure you want to delete this product?')) {
            this.productService.deleteProduct(id).subscribe({
                next: () => {
                    this.loadProducts();
                },
                error: (err) => {
                    this.error = err.message;
                },
            });
        }
    }

    resetForm(): void {
        this.newProduct = {
            no: '',
            name: '',
            summary: '',
            description: '',
            imageFile: '',
            price: 0,
            category: '',
        };
    }
}
