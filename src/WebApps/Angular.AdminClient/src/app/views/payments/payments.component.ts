import { Component } from '@angular/core';
import { PaymentsGatewayService } from '../../shared/services/gateway/payments-gateway.service';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss'],
})
export class PaymentsComponent {
  public blockedPanel = false;
  public userId = '';
  public orderNo = '';
  public items: any[] = [];
  public status: any = null;

  constructor(private paymentsService: PaymentsGatewayService) {}

  loadUserHistory(): void {
    if (!this.userId) {
      return;
    }

    this.toggleBlockUI(true);
    this.paymentsService.getUserPaymentHistory(this.userId).subscribe({
      next: (response) => {
        this.items = Array.isArray(response) ? response : [];
        this.toggleBlockUI(false);
      },
      error: () => {
        this.toggleBlockUI(false);
      },
    });
  }

  checkOrderStatus(): void {
    if (!this.orderNo) {
      return;
    }

    this.toggleBlockUI(true);
    this.paymentsService.getOrderStatus(this.orderNo).subscribe({
      next: (response) => {
        this.status = response;
        this.toggleBlockUI(false);
      },
      error: () => {
        this.toggleBlockUI(false);
      },
    });
  }

  cancelOrder(): void {
    if (!this.orderNo) {
      return;
    }

    this.toggleBlockUI(true);
    this.paymentsService.cancelOrder(this.orderNo).subscribe({
      next: () => {
        this.checkOrderStatus();
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
