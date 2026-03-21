import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuditLogsComponent } from './audit-logs.component';

const routes: Routes = [
  {
    path: '',
    component: AuditLogsComponent,
    data: {
      title: 'Audit Logs',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuditLogsRoutingModule {}
