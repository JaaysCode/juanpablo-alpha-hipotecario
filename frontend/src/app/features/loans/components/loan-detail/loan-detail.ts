import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GetLoanUseCase } from '../../application/queries/get-loan.use-case';
import { ExplainLoanUseCase } from '../../application/queries/explain-loan.use-case';
import { Loan, LoanStatus, AmortizationEntry } from '../../domain/loan.model';
import { MarkdownPipe } from '../../../../shared/pipes/markdown.pipe';

const PAGE_SIZE = 12;

@Component({
  selector: 'app-loan-detail',
  imports: [RouterLink, MarkdownPipe],
  templateUrl: './loan-detail.html',
  styleUrl: './loan-detail.css',
})
export class LoanDetailComponent implements OnInit {
  private readonly getLoan = inject(GetLoanUseCase);
  private readonly explainLoan = inject(ExplainLoanUseCase);
  private readonly route = inject(ActivatedRoute);

  readonly LoanStatus = LoanStatus;

  loan = signal<Loan | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  page = signal(1);

  explanation = signal<string | null>(null);
  explainLoading = signal(false);
  explainError = signal<string | null>(null);

  totalPages = computed(() => {
    const l = this.loan();
    if (!l) return 1;
    return Math.ceil(l.amortizationSchedule.length / PAGE_SIZE);
  });

  pagedEntries = computed((): AmortizationEntry[] => {
    const l = this.loan();
    if (!l) return [];
    const start = (this.page() - 1) * PAGE_SIZE;
    return l.amortizationSchedule.slice(start, start + PAGE_SIZE);
  });

  pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.getLoan.execute(id).subscribe({
      next: (loan) => { this.loan.set(loan); this.loading.set(false); },
      error: () => { this.error.set('No se pudo cargar la simulación.'); this.loading.set(false); },
    });
  }

  requestExplanation(): void {
    const loan = this.loan();
    if (!loan || this.explainLoading()) return;
    this.explainLoading.set(true);
    this.explainError.set(null);
    this.explainLoan.execute(loan.id).subscribe({
      next: (res) => { this.explanation.set(res.explanation); this.explainLoading.set(false); },
      error: () => { this.explainError.set('No se pudo generar la explicación. Intenta de nuevo.'); this.explainLoading.set(false); },
    });
  }

  setPage(p: number): void {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
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
}
