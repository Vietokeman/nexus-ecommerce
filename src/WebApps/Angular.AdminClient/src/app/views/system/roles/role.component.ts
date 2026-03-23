import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import {
  AdminApiRoleApiClient,
  RoleModel,
  RoleModelPageResult,
} from '../../../api/admin-api.service.generated';
import { DialogService } from 'primeng/dynamicdialog';
import { AlertService } from '../../../shared/services/alert.service';
import { ConfirmationService } from 'primeng/api';
import { RoleDetailComponent } from './role-detail.component';
import { MessageConstants } from '../../../shared/constants/messages.constant';
import { PermissionGrantComponent } from './permission-grant.component';

interface PagedEvent {
  page?: number;
  rows?: number;
}

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss'],
})
export class RoleComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  public blockedPanel: boolean = false;

  public pageIndex: number = 1;
  public pageSize: number = 10;
  public totalCount?: number;

  public items?: RoleModel[];
  public selectedItems: RoleModel[] = [];
  public keyword: string = '';

  constructor(
    private roleService: AdminApiRoleApiClient,
    public dialogService: DialogService,
    private alertService: AlertService,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.toggleBlockUI(true);

    this.roleService
      .paging(this.keyword, this.pageIndex, this.pageSize)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (response: RoleModelPageResult) => {
          this.items = response.results;
          this.totalCount = response.rowCount;
          this.toggleBlockUI(false);
        },
        error: () => {
          this.toggleBlockUI(false);
        },
      });
  }

  pageChanged(event: PagedEvent): void {
    this.pageIndex = (event.page ?? 0) + 1;
    this.pageSize = event.rows ?? this.pageSize;
    this.loadData();
  }

  private toggleBlockUI(enabled: boolean) {
    if (enabled) {
      this.blockedPanel = true;
    } else {
      setTimeout(() => {
        this.blockedPanel = false;
      }, 1000);
    }
  }

  showPermissionModal(id: string, name: string) {
    const ref = this.dialogService.open(PermissionGrantComponent, {
      data: { id: id },
      header: name,
      width: '70%',
    });
    ref.onClose.subscribe((data: RoleModel) => {
      if (data) {
        this.alertService.showSuccess(MessageConstants.UPDATED_OK_MSG);
        this.selectedItems = [];
        this.loadData();
      }
    });
  }

  showEditModal() {
    if (this.selectedItems.length === 0) {
      this.alertService.showError(MessageConstants.NOT_CHOOSE_ANY_RECORD);
      return;
    }
    const id = this.selectedItems[0].id;
    const ref = this.dialogService.open(RoleDetailComponent, {
      data: { id: id },
      header: 'Cập nhật quyền',
      width: '70%',
    });
    ref.onClose.subscribe((data: RoleModel) => {
      if (data) {
        this.alertService.showSuccess(MessageConstants.UPDATED_OK_MSG);
        this.selectedItems = [];
        this.loadData();
      }
    });
  }

  showAddModal() {
    const ref = this.dialogService.open(RoleDetailComponent, {
      header: 'Thêm mới quyền',
      width: '70%',
    });
    ref.onClose.subscribe((data: RoleModel) => {
      if (data) {
        this.alertService.showSuccess(MessageConstants.CREATED_OK_MSG);
        this.selectedItems = [];
        this.loadData();
      }
    });
  }

  deleteItems() {
    if (this.selectedItems.length === 0) {
      this.alertService.showError(MessageConstants.NOT_CHOOSE_ANY_RECORD);
      return;
    }
    const ids = this.selectedItems.map((element) => element.id);
    this.confirmationService.confirm({
      message: MessageConstants.CONFIRM_DELETE_MSG,
      accept: () => {
        this.deleteItemsConfirm(ids);
      },
    });
  }

  deleteItemsConfirm(ids: string[]) {
    this.toggleBlockUI(true);
    this.roleService.roleDELETE(ids).subscribe({
      next: () => {
        this.alertService.showSuccess(MessageConstants.DELETED_OK_MSG);
        this.loadData();
        this.selectedItems = [];
        this.toggleBlockUI(false);
      },
      error: () => {
        this.toggleBlockUI(false);
      },
    });
  }
}
