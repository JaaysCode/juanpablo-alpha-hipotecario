import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SimulateLoanUseCase } from '../../application/commands/simulate-loan.use-case';
import { GetClientUseCase } from '../../../clients/application/queries/get-client.use-case';
import { Loan, LoanStatus } from '../../domain/loan.model';
import { Client } from '../../../clients/domain/client.model';

@Component({
  selector: 'app-loan-simulate',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './loan-simulate.html',
  styleUrl: './loan-simulate.css',
})
export class LoanSimulateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly simulateLoan = inject(SimulateLoanUseCase);
  private readonly getClient = inject(GetClientUseCase);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly termOptions = [5, 10, 15, 20, 25, 30];
  readonly LoanStatus = LoanStatus;

  loading = signal(false);
  clientLoading = signal(false);
  serverError = signal<string | null>(null);
  result = signal<Loan | null>(null);
  client = signal<Client | null>(null);

  form = this.fb.group({
    nationalIdentification: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]],
    propertyValue: [null as number | null, [Validators.required, Validators.min(1)]],
    downPayment: [null as number | null, [Validators.required, Validators.min(0)]],
    termInYears: [20, [Validators.required]],
    annualInterestRate: [null as number | null, [Validators.required, Validators.min(0.001), Validators.max(1)]],
  });

  ngOnInit(): void {
    const nationalId = this.route.snapshot.queryParamMap.get('nationalId');
    if (nationalId) {
      this.form.patchValue({ nationalIdentification: nationalId });
      this.loadClient(nationalId);
    }
  }

  loadClient(nationalId: string): void {
    if (!nationalId) { this.client.set(null); return; }
    this.clientLoading.set(true);
    this.getClient.executeByNationalId(nationalId).subscribe({
      next: (c) => { this.client.set(c); this.clientLoading.set(false); },
      error: () => { this.client.set(null); this.clientLoading.set(false); },
    });
  }

  onNationalIdBlur(): void {
    const nationalId = this.form.value.nationalIdentification?.trim();
    if (nationalId) this.loadClient(nationalId);
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  getError(field: string): string {
    const c = this.form.get(field);
    if (!c || !c.errors) return '';
    if (c.errors['required']) return 'Campo requerido.';
    if (c.errors['min']) return `Debe ser mayor a ${c.errors['min'].min}.`;
    if (c.errors['max']) return `Debe ser menor o igual a ${c.errors['max'].max}.`;
    return 'Valor inválido.';
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.serverError.set(null);
    this.result.set(null);

    const v = this.form.value;
    this.simulateLoan.execute({
      nationalIdentification: v.nationalIdentification!,
      propertyValue: Number(v.propertyValue),
      downPayment: Number(v.downPayment),
      termInYears: Number(v.termInYears),
      annualInterestRate: Number(v.annualInterestRate),
    }).subscribe({
      next: (loan) => {
        this.result.set(loan);
        this.loading.set(false);
      },
      error: (err) => {
        const msg = err?.error?.message;
        this.serverError.set(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Error al simular el crédito.'));
        this.loading.set(false);
      },
    });
  }

  goToDetail(): void {
    const loan = this.result();
    if (loan) this.router.navigate(['/loans', loan.id]);
  }

  statusLabel(s: LoanStatus): string {
    const labels: Record<LoanStatus, string> = {
      [LoanStatus.PRE_APPROVED]: 'Pre-aprobado',
      [LoanStatus.PRE_APPROVED_WITH_OBSERVATIONS]: 'Pre-aprobado con observaciones',
      [LoanStatus.REJECTED]: 'Rechazado',
    };
    return labels[s] ?? s;
  }

  statusClass(s: LoanStatus): string {
    const map: Record<LoanStatus, string> = {
      [LoanStatus.PRE_APPROVED]: 'badge-success',
      [LoanStatus.PRE_APPROVED_WITH_OBSERVATIONS]: 'badge-warning',
      [LoanStatus.REJECTED]: 'badge-danger',
    };
    return map[s] ?? 'badge-neutral';
  }

  formatCurrency(v: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(v);
  }

  formatPercent(v: number): string {
    return `${(v * 100).toFixed(2)}% EA`;
  }

  clientFullName(): string {
    const c = this.client();
    return c ? `${c.firstName} ${c.lastName}` : '';
  }
}
