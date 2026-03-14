import { Component } from '@angular/core';

interface IOverviewCard {
  title: string;
  value: string;
  description: string;
  color: string;
}

interface IAdminArea {
  name: string;
  route: string;
  summary: string;
  status: string;
}

@Component({
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss']
})
export class DashboardComponent {
  public readonly overviewCards: IOverviewCard[] = [
    {
      title: 'Users',
      value: '1+',
      description: 'Seeded admin users ready for role assignment.',
      color: 'primary',
    },
    {
      title: 'Roles',
      value: '2',
      description: 'Administrator and content editor permissions are available.',
      color: 'info',
    },
    {
      title: 'Content Types',
      value: '3',
      description: 'Post categories, posts, and series are managed centrally.',
      color: 'warning',
    },
    {
      title: 'Media',
      value: 'Ready',
      description: 'Image uploads are stored under the Admin.API static files root.',
      color: 'success',
    },
  ];

  public readonly areas: IAdminArea[] = [
    {
      name: 'Dashboard',
      route: '/dashboard',
      summary: 'Entry point for operational overview and admin navigation.',
      status: 'Active',
    },
    {
      name: 'System / Users',
      route: '/system/users',
      summary: 'Manage admin identities, passwords, emails, and role assignment.',
      status: 'Active',
    },
    {
      name: 'System / Roles',
      route: '/system/roles',
      summary: 'Control permission bundles used by the admin shell.',
      status: 'Active',
    },
    {
      name: 'Content / Categories',
      route: '/content/post-categories',
      summary: 'Maintain post taxonomy for admin-managed publishing flows.',
      status: 'Active',
    },
    {
      name: 'Content / Posts',
      route: '/content/posts',
      summary: 'Create, review, return, approve, and categorize editorial posts.',
      status: 'Active',
    },
    {
      name: 'Content / Series',
      route: '/content/series',
      summary: 'Group posts into ordered series for longer content journeys.',
      status: 'Active',
    },
  ];
}
