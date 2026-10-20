import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { DEPOSIT_LIMITS, DepositMethod } from '@/entities/deposit';
import { MakeDepositService } from '../model/make-deposit.service';

@Component({
  selector: 'app-deposit-dialog',
  templateUrl: './deposit-dialog.component.html',
  imports: [NzFormModule, NzInputModule, NzRadioModule, ReactiveFormsModule],
})
export class DepositDialogComponent {
  private readonly modalRef = inject(NzModalRef);
  private readonly makeDepositService = inject(MakeDepositService);
  private readonly fb = inject(FormBuilder);

  protected readonly limits = DEPOSIT_LIMITS;

  protected readonly depositForm = this.fb.group({
    amount: this.fb.nonNullable.control<number>(this.limits.amount.min, {
      validators: [
        Validators.required,
        Validators.min(this.limits.amount.min),
        Validators.max(this.limits.amount.max),
      ],
    }),
    depositMethod: this.fb.nonNullable.control<DepositMethod>('card'),
    notes: this.fb.nonNullable.control('', {
      validators: [Validators.maxLength(this.limits.notesMaxLength)],
    }),
  });

  /** Called by the modal's OK button; always returns false so the modal is closed only on success. */
  addDeposit(): false {
    if (this.depositForm.invalid) return false;

    this.depositForm.disable();

    this.makeDepositService.makeDeposit(this.depositForm.getRawValue()).subscribe({
      next: () => this.modalRef.close({ success: true }),
      error: () => this.depositForm.enable(),
    });

    return false;
  }
}
