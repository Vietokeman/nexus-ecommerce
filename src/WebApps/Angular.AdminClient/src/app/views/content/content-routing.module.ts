import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostComponent } from './posts/post.component';
import { PostCategoryComponent } from './post-categories/post-category.component';
import { SeriesComponent } from './series/series.component';
const routes: Routes = [
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

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContentRoutingModule {}
