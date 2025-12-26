import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <abp-navbar></abp-navbar>
    <div class="container-fluid mt-4">
      <router-outlet></router-outlet>
    </div>
    <footer class="footer mt-5 py-3 bg-light">
      <div class="container text-center">
        <span class="text-muted">© 2025 Distributed E-Commerce Platform</span>
      </div>
    </footer>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }
      .container-fluid {
        flex: 1;
      }
      .footer {
        margin-top: auto;
      }
    `,
  ],
})
export class AppComponent {
  title = 'Distributed E-Commerce Platform';
}
