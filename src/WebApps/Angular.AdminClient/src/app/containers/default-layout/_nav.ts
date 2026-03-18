import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-speedometer' },
    attributes: {
      policyName: 'Permissions.Dashboard.View',
    },
  },
  {
    name: 'Nội dung',
    url: '/content',
    iconComponent: { name: 'cil-puzzle' },
    children: [
      {
        name: 'Danh mục',
        url: '/content/post-categories',
        attributes: {
          policyName: 'Permissions.PostCategories.View',
        },
      },
      {
        name: 'Bài viết',
        url: '/content/posts',
        attributes: {
          policyName: 'Permissions.Posts.View',
        },
      },
      {
        name: 'Loạt bài',
        url: '/content/series',
        attributes: {
          policyName: 'Permissions.Series.View',
        },
      },
    ],
  },
  {
    name: 'Hệ thống',
    url: '/system',
    iconComponent: { name: 'cil-notes' },
    children: [
      {
        name: 'Quyền',
        url: '/system/roles',
        attributes: {
          policyName: 'Permissions.Roles.View',
        },
      },
      {
        name: 'Người dùng',
        url: '/system/users',
        attributes: {
          policyName: 'Permissions.Users.View',
        },
      },
    ],
  },
];
