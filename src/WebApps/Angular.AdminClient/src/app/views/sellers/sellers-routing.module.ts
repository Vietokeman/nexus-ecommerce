import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SellersComponent } from './sellers.component';

const routes: Routes = [
  {
    path: '',
    component: SellersComponent,
    data: {
      title: 'Sellers',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SellersRoutingModule {}
