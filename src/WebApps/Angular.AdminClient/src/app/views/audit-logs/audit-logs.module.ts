import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { BlockUIModule } from 'primeng/blockui';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AuditLogsComponent } from './audit-logs.component';
import { AuditLogsRoutingModule } from './audit-logs-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    AuditLogsRoutingModule,
    TableModule,
    PanelModule,
    ButtonModule,
    InputTextModule,
    PaginatorModule,
    BlockUIModule,
    ProgressSpinnerModule,
  ],
  declarations: [AuditLogsComponent],
})
export class AuditLogsModule {}
