import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaymentsComponent } from './payments.component';

const routes: Routes = [
  {
    path: '',
    component: PaymentsComponent,
    data: {
      title: 'Payments',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentsRoutingModule {}
