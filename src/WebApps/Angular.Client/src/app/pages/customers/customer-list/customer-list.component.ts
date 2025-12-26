import { Component, OnInit } from '@angular/core';
import { CustomerService } from '../../../services/customer.service';
import { Customer } from '../../../models/customer.model';

@Component({
  selector: 'app-customer-list',
  template: `
    <div class="container">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Customers</h2>
        <button class="btn btn-primary" (click)="showCreateForm = !showCreateForm">
          <i class="bi bi-plus-circle"></i> Add Customer
        </button>
      </div>

      <div *ngIf="showCreateForm" class="card mb-4">
        <div class="card-body">
          <h5 class="card-title">Create New Customer</h5>
          <form (ngSubmit)="createCustomer()">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Username</label>
                <input type="text" class="form-control" [(ngModel)]="newCustomer.username" name="username" required />
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Email</label>
                <input type="email" class="form-control" [(ngModel)]="newCustomer.emailAddress" name="email" required />
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">First Name</label>
                <input type="text" class="form-control" [(ngModel)]="newCustomer.firstName" name="firstName" required />
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Last Name</label>
                <input type="text" class="form-control" [(ngModel)]="newCustomer.lastName" name="lastName" required />
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

      <div *ngIf="!loading && !error" class="card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Created Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let customer of customers">
                  <td>{{ customer.username }}</td>
                  <td>{{ customer.firstName }} {{ customer.lastName }}</td>
                  <td>{{ customer.emailAddress }}</td>
                  <td>{{ customer.createdDate | date }}</td>
                  <td>
                    <button class="btn btn-sm btn-danger" (click)="deleteCustomer(customer.username)">
                      <i class="bi bi-trash"></i> Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && !error && customers.length === 0" class="alert alert-info">
        No customers found. Click "Add Customer" to create one.
      </div>
    </div>
  `,
  styles: [],
})
export class CustomerListComponent implements OnInit {
  customers: Customer[] = [];
  loading = false;
  error: string | null = null;
  showCreateForm = false;
  newCustomer: any = {
    username: '',
    firstName: '',
    lastName: '',
    emailAddress: '',
  };

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading = true;
    this.error = null;

    this.customerService.getCustomers().subscribe({
      next: (data) => {
        this.customers = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      },
    });
  }

  createCustomer(): void {
    this.customerService.createCustomer(this.newCustomer).subscribe({
      next: () => {
        this.showCreateForm = false;
        this.resetForm();
        this.loadCustomers();
      },
      error: (err) => {
        this.error = err.message;
      },
    });
  }

  deleteCustomer(username: string): void {
    if (confirm('Are you sure you want to delete this customer?')) {
      this.customerService.deleteCustomer(username).subscribe({
        next: () => {
          this.loadCustomers();
        },
        error: (err) => {
          this.error = err.message;
        },
      });
    }
  }

  resetForm(): void {
    this.newCustomer = {
      username: '',
      firstName: '',
      lastName: '',
      emailAddress: '',
    };
  }
}
