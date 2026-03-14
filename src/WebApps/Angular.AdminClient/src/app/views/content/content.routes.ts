import { Routes } from '@angular/router';
import { PostComponent } from './posts/post.component';
import { PostCategoryComponent } from './post-categories/post-category.component';
import { SeriesComponent } from './series/series.component';

export const CONTENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'posts',
    pathMatch: 'full',
  },
  {
    path: 'posts',
    component: PostComponent,
    data: {
      title: 'Bài viết',
      requiredPolicy: 'Permissions.Posts.View',
    },
  },
  {
    path: 'post-categories',
    component: PostCategoryComponent,
    data: {
      title: 'Danh mục',
      requiredPolicy: 'Permissions.PostCategories.View',
    },
  },
  {
    path: 'series',
    component: SeriesComponent,
    data: {
      requiredPolicy: 'Permissions.Series.View',
    },
  },
];
