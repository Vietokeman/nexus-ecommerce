import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProductListComponent } from './pages/products/product-list/product-list.component';
import { ProductDetailComponent } from './pages/products/product-detail/product-detail.component';
import { CustomerListComponent } from './pages/customers/customer-list/customer-list.component';
import { BasketComponent } from './pages/basket/basket.component';
import { OrderListComponent } from './pages/orders/order-list/order-list.component';

const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'products', component: ProductListComponent },
    { path: 'products/:id', component: ProductDetailComponent },
    { path: 'customers', component: CustomerListComponent },
    { path: 'basket', component: BasketComponent },
    { path: 'orders', component: OrderListComponent },
    { path: '**', redirectTo: '' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule { }
