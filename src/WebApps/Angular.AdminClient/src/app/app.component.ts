import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IconSetService } from '@coreui/icons-angular';
import { iconSubset } from './icons/icon-subset';
import { Title } from '@angular/platform-browser';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastModule, ConfirmDialogModule],
  template: ` <p-toast position="top-center"></p-toast>
    <p-confirmDialog
      header="Xác nhận"
      acceptLabel="Có"
      rejectLabel="Không"
      icon="pi pi-exclamation-triangle"
    ></p-confirmDialog>
    <router-outlet></router-outlet>`,
})
export class AppComponent {
  title = 'Vietokeman Admin UI';

  constructor(
    private titleService: Title,
    private iconSetService: IconSetService,
  ) {
    titleService.setTitle(this.title);
    // iconSet singleton
    iconSetService.icons = { ...iconSubset };
  }
}
