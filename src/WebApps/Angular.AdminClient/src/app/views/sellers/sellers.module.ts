import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { BlockUIModule } from 'primeng/blockui';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SellersComponent } from './sellers.component';
import { SellersRoutingModule } from './sellers-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SellersRoutingModule,
    TableModule,
    PanelModule,
    ButtonModule,
    InputTextModule,
    BlockUIModule,
    ProgressSpinnerModule,
  ],
  declarations: [SellersComponent],
})
export class SellersModule {}
