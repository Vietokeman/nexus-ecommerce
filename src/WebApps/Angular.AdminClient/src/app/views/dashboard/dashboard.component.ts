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

interface IOperationPulse {
  label: string;
  value: string;
  note: string;
  tone: 'success' | 'warning' | 'danger' | 'info';
}

interface IBoardItem {
  title: string;
  amount: string;
  hint: string;
}

@Component({
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss'],
})
export class DashboardComponent {
  public readonly overviewCards: IOverviewCard[] = [
    {
      title: 'Revenue (7d)',
      value: '$124K',
      description: 'Tet campaign revenue from premium and luxury segments.',
      color: 'primary',
    },
    {
      title: 'Open Orders',
      value: '46',
      description: 'Orders currently in Pending/Paid/Shipping states.',
      color: 'info',
    },
    {
      title: 'Live Campaigns',
      value: '9',
      description: 'FlashSale and GroupBuy campaigns active this week.',
      color: 'warning',
    },
    {
      title: 'Low Stock SKUs',
      value: '12',
      description: 'Products under safety threshold and needing replenishment.',
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
      summary:
        'Manage admin identities, passwords, emails, and role assignment.',
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
      summary:
        'Create, review, return, approve, and categorize editorial posts.',
      status: 'Active',
    },
    {
      name: 'Content / Series',
      route: '/content/series',
      summary: 'Group posts into ordered series for longer content journeys.',
      status: 'Active',
    },
  ];

  public readonly operationPulse: IOperationPulse[] = [
    {
      label: 'Catalog moderation queue',
      value: '7 pending',
      note: 'High-value Tet bundles waiting approval',
      tone: 'warning',
    },
    {
      label: 'Payment disputes',
      value: '2 open',
      note: 'Requires refund workflow confirmation',
      tone: 'danger',
    },
    {
      label: 'Campaign SLA',
      value: '98.4%',
      note: 'Countdown and inventory sync stable',
      tone: 'success',
    },
  ];

  public readonly catalogBoard: IBoardItem[] = [
    { title: 'Premium Gift Hampers', amount: '30 SKUs', hint: '8 categories with complete media and attributes' },
    { title: 'Out-of-stock Risk', amount: '4 SKUs', hint: 'Recommend immediate restock in HCM warehouse' },
    { title: 'Bulk Edit Ready', amount: '11 SKUs', hint: 'Prices and SEO copy pending final review' },
  ];

  public readonly orderBoard: IBoardItem[] = [
    { title: 'Awaiting Payment', amount: '18', hint: 'Follow-up in 2-hour cadence' },
    { title: 'Ready to Ship', amount: '21', hint: 'Warehouse split routing available' },
    { title: 'Refund / Dispute', amount: '7', hint: 'Escalated cases monitored by finance ops' },
  ];

  public readonly campaignBoard: IBoardItem[] = [
    { title: 'Flash Sale Hot Slots', amount: '3 slots', hint: 'Peak traffic expected in evening window' },
    { title: 'GroupBuy Near Success', amount: '5 sessions', hint: 'Within 1-2 participants from target' },
    { title: 'CRM Nudges Today', amount: '24 sends', hint: 'Automated notifications to revive abandoned joins' },
  ];
}
