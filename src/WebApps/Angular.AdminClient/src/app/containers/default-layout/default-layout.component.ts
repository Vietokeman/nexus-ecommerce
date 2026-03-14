import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { navItems } from './_nav';
import { TokenStorageService } from '../../shared/services/token-storage.service';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { SidebarModule, ContainerComponent } from '@coreui/angular';
import { DefaultHeaderComponent } from './default-header.component';
import { DefaultFooterComponent } from './default-footer.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarModule,
    NgScrollbarModule,
    ContainerComponent,
    DefaultHeaderComponent,
    DefaultFooterComponent,
  ],
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss'],
})
export class DefaultLayoutComponent implements OnInit {
  public navItems = [];

  constructor(private tokenService: TokenStorageService) {}

  ngOnInit(): void {
    const user = this.tokenService.getUser();
    const permissions = Array.isArray(user?.permissions)
      ? user.permissions
      : [];

    this.navItems = navItems
      .map((item) => {
        if (!item.children?.length) {
          return item;
        }

        return {
          ...item,
          children: item.children.filter((child) => {
            const policyName = child.attributes?.['policyName'];
            return !policyName || permissions.includes(policyName);
          }),
        };
      })
      .filter((item) => !item.children || item.children.length > 0);
  }
}
