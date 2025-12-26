import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { environment } from '../environments/environment';

// Components
import { HomeComponent } from './pages/home/home.component';
import { ProductListComponent } from './pages/products/product-list/product-list.component';
import { ProductDetailComponent } from './pages/products/product-detail/product-detail.component';
import { CustomerListComponent } from './pages/customers/customer-list/customer-list.component';
import { BasketComponent } from './pages/basket/basket.component';
import { OrderListComponent } from './pages/orders/order-list/order-list.component';
import { NavbarComponent } from './shared/navbar/navbar.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ProductListComponent,
    ProductDetailComponent,
    CustomerListComponent,
    BasketComponent,
    OrderListComponent,
    NavbarComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
