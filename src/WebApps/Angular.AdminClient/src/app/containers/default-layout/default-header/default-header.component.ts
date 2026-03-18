import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ClassToggleService,
  HeaderComponent,
  HeaderModule,
  ContainerComponent,
  DropdownModule,
  AvatarModule,
  NavModule,
  BadgeModule,
  SidebarToggleDirective,
  BreadcrumbModule,
} from '@coreui/angular';
import { TokenStorageService } from '../../../shared/services/token-storage.service';
import { IconModule } from '@coreui/icons-angular';

@Component({
  selector: 'app-default-header',
  standalone: true,
  imports: [
    CommonModule,
    HeaderModule,
    ContainerComponent,
    DropdownModule,
    AvatarModule,
    NavModule,
    BadgeModule,
    IconModule,
    SidebarToggleDirective,
    BreadcrumbModule,
  ],
  templateUrl: './default-header.component.html',
  styleUrls: ['./default-header.component.scss'],
})
export class DefaultHeaderComponent extends HeaderComponent {
  @Input() sidebarId: string = 'sidebar';

  public newMessages = new Array(4);
  public newTasks = new Array(5);
  public newNotifications = new Array(5);

  constructor(
    private classToggler: ClassToggleService,
    private tokenService: TokenStorageService,
  ) {
    super();
  }

  logout() {
    this.tokenService.signOut();
    window.location.reload();
  }
}
