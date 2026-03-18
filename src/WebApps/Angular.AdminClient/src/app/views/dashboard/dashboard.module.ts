import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  BadgeModule,
  CardModule,
  GridModule,
  ProgressModule,
  TableModule,
} from '@coreui/angular';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';

@NgModule({
  imports: [
    DashboardRoutingModule,
    CommonModule,
    CardModule,
    GridModule,
    ProgressModule,
    BadgeModule,
    TableModule,
  ],
  declarations: [DashboardComponent],
})
export class DashboardModule {}
