import { Routes } from '@angular/router';
import { UserComponent } from './users/user.component';
import { RoleComponent } from './roles/role.component';

export const SYSTEM_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full',
  },
  {
    path: 'users',
    component: UserComponent,
    data: {
      title: 'Người dùng',
      requiredPolicy: 'Permissions.Users.View',
    },
  },
  {
    path: 'roles',
    component: RoleComponent,
    data: {
      title: 'Quyền',
      requiredPolicy: 'Permissions.Roles.View',
    },
  },
];
