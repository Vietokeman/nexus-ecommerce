import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-product-detail',
  template: `
    <div class="container">
      <button class="btn btn-secondary mb-3" (click)="goBack()">
        <i class="bi bi-arrow-left"></i> Back to Products
      </button>

      <div *ngIf="loading" class="loading-spinner">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div *ngIf="error" class="error-message">
        {{ error }}
      </div>

      <div *ngIf="product && !loading" class="card">
        <div class="row g-0">
          <div class="col-md-4">
            <img
              [src]="product.imageFile || 'https://via.placeholder.com/400'"
              class="img-fluid rounded-start"
              [alt]="product.name"
            />
          </div>
          <div class="col-md-8">
            <div class="card-body">
              <h2 class="card-title">{{ product.name }}</h2>
              <p class="text-muted">Product No: {{ product.no }}</p>
              <h4 class="text-primary">\${{ product.price }}</h4>
              <p class="badge bg-secondary">{{ product.category }}</p>
              <hr />
              <h5>Summary</h5>
              <p>{{ product.summary }}</p>
              <h5>Description</h5>
              <p>{{ product.description }}</p>
              <hr />
              <div class="d-flex justify-content-between">
                <div>
                  <small class="text-muted">Created: {{ product.createdDate | date }}</small>
                </div>
                <div>
                  <button class="btn btn-warning me-2" (click)="editMode = !editMode">
                    <i class="bi bi-pencil"></i> Edit
                  </button>
                  <button class="btn btn-danger" (click)="deleteProduct()">
                    <i class="bi bi-trash"></i> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="editMode && product" class="card mt-3">
        <div class="card-body">
          <h5 class="card-title">Edit Product</h5>
          <form (ngSubmit)="updateProduct()">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Name</label>
                <input type="text" class="form-control" [(ngModel)]="product.name" name="name" required />
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Category</label>
                <input type="text" class="form-control" [(ngModel)]="product.category" name="category" required />
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Price</label>
                <input type="number" class="form-control" [(ngModel)]="product.price" name="price" required />
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Image URL</label>
                <input type="text" class="form-control" [(ngModel)]="product.imageFile" name="imageFile" />
              </div>
              <div class="col-md-12 mb-3">
                <label class="form-label">Summary</label>
                <input type="text" class="form-control" [(ngModel)]="product.summary" name="summary" required />
              </div>
              <div class="col-md-12 mb-3">
                <label class="form-label">Description</label>
                <textarea class="form-control" [(ngModel)]="product.description" name="description" rows="3"></textarea>
              </div>
            </div>
            <button type="submit" class="btn btn-primary me-2">Save Changes</button>
            <button type="button" class="btn btn-secondary" (click)="editMode = false">Cancel</button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading = false;
  error: string | null = null;
  editMode = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(id);
    }
  }

  loadProduct(id: string): void {
    this.loading = true;
    this.error = null;

    this.productService.getProductById(id).subscribe({
      next: (data) => {
        this.product = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      },
    });
  }

  updateProduct(): void {
    if (this.product) {
      const updateDto = {
        name: this.product.name,
        summary: this.product.summary,
        description: this.product.description,
        imageFile: this.product.imageFile,
        price: this.product.price,
        category: this.product.category,
      };

      this.productService.updateProduct(this.product.id, updateDto).subscribe({
        next: () => {
          this.editMode = false;
          this.loadProduct(this.product!.id);
        },
        error: (err) => {
          this.error = err.message;
        },
      });
    }
  }

  deleteProduct(): void {
    if (this.product && confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(this.product.id).subscribe({
        next: () => {
          this.router.navigate(['/products']);
        },
        error: (err) => {
          this.error = err.message;
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }
}
