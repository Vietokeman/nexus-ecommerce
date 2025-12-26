import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    template: `
    <app-navbar></app-navbar>
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
