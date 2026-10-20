import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';
import { DepositDialogComponent } from '@/features/deposit';

/** Route-driven modal: /deposit opens the dialog, closing it returns to the parent route. */
@Component({
  selector: 'app-deposit-page',
  template: ``,
})
export class DepositPageComponent implements OnInit, OnDestroy {
  private readonly modalService = inject(NzModalService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private modalRef?: NzModalRef<DepositDialogComponent>;
  private closeSubscription?: Subscription;

  ngOnInit(): void {
    this.modalRef = this.modalService.create<DepositDialogComponent>({
      nzTitle: 'Deposit',
      nzContent: DepositDialogComponent,
      nzMaskClosable: true,
      nzOkText: 'Add',
      nzOnOk: (dialog) => dialog.addDeposit(),
    });

    this.closeSubscription = this.modalRef.afterClose.subscribe(() => this.leaveRoute());
  }

  ngOnDestroy(): void {
    // Unsubscribe first: destroying the modal must not trigger another navigation.
    this.closeSubscription?.unsubscribe();
    this.modalRef?.destroy();
  }

  private leaveRoute(): void {
    this.router.navigate(['../'], {
      relativeTo: this.route,
      queryParamsHandling: 'merge',
    });
  }
}
