import { Component, OnInit } from '@angular/core';
import { SellersGatewayService } from '../../shared/services/gateway/sellers-gateway.service';

@Component({
  selector: 'app-sellers',
  templateUrl: './sellers.component.html',
  styleUrls: ['./sellers.component.scss'],
})
export class SellersComponent implements OnInit {
  public blockedPanel = false;
  public sellerUserName = '';
  public items: any[] = [];
  public dashboard: any = null;

  constructor(private sellersService: SellersGatewayService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.toggleBlockUI(true);
    this.sellersService.getSellerProducts().subscribe({
      next: (response) => {
        this.items = Array.isArray(response) ? response : [];
        this.toggleBlockUI(false);
      },
      error: () => {
        this.toggleBlockUI(false);
      },
    });
  }

  loadBySeller(): void {
    if (!this.sellerUserName) {
      return;
    }

    this.toggleBlockUI(true);
    this.sellersService.getBySeller(this.sellerUserName).subscribe({
      next: (response) => {
        this.items = Array.isArray(response) ? response : [];
        this.toggleBlockUI(false);
      },
      error: () => {
        this.toggleBlockUI(false);
      },
    });
  }

  loadDashboard(): void {
    if (!this.sellerUserName) {
      return;
    }

    this.toggleBlockUI(true);
    this.sellersService.getDashboard(this.sellerUserName).subscribe({
      next: (response) => {
        this.dashboard = response;
        this.toggleBlockUI(false);
      },
      error: () => {
        this.toggleBlockUI(false);
      },
    });
  }

  private toggleBlockUI(enabled: boolean): void {
    this.blockedPanel = enabled;
  }
}
