import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { BlockUIModule } from 'primeng/blockui';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ProductsComponent } from './products.component';
import { ProductsRoutingModule } from './products-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ProductsRoutingModule,
    TableModule,
    PanelModule,
    ButtonModule,
    InputTextModule,
    BlockUIModule,
    ProgressSpinnerModule,
  ],
  declarations: [ProductsComponent],
})
export class ProductsModule {}
