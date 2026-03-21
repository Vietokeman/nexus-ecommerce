import { Component, OnInit } from '@angular/core';
import { ProductsGatewayService } from '../../shared/services/gateway/products-gateway.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit {
  public blockedPanel = false;
  public keyword = '';
  public productNo = '';
  public items: any[] = [];
  public selectedProduct: any = null;

  constructor(private productsService: ProductsGatewayService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.toggleBlockUI(true);
    this.productsService.getProducts(this.keyword).subscribe({
      next: (response) => {
        this.items = Array.isArray(response) ? response : [];
        this.toggleBlockUI(false);
      },
      error: () => {
        this.toggleBlockUI(false);
      },
    });
  }

  findByProductNo(): void {
    if (!this.productNo) {
      return;
    }

    this.toggleBlockUI(true);
    this.productsService.getByProductNo(this.productNo).subscribe({
      next: (response) => {
        this.selectedProduct = response;
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
