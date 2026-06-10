import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { GetClientUseCase } from '../../application/queries/get-client.use-case';
import { CLIENT_REPOSITORY_PORT } from '../../ports/outbound/client-repository.port';
import { Client, EmploymentType } from '../../domain/client.model';
import { LoanSummary, LoanStatus } from '../../../loans/domain/loan.model';

@Component({
  selector: 'app-client-detail',
  imports: [RouterLink],
  templateUrl: './client-detail.html',
  styleUrl: './client-detail.css',
})
export class ClientDetailComponent implements OnInit {
  private readonly getClient = inject(GetClientUseCase);
  private readonly repo = inject(CLIENT_REPOSITORY_PORT);
  private readonly route = inject(ActivatedRoute);

  client = signal<Client | null>(null);
  loans = signal<LoanSummary[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    forkJoin({
      client: this.getClient.execute(id),
      loans: this.repo.getLoans(id),
    }).subscribe({
      next: ({ client, loans }) => {
        this.client.set(client);
        this.loans.set(loans);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la información del cliente.');
        this.loading.set(false);
      },
    });
  }

  fullName(c: Client): string {
    return `${c.firstName} ${c.lastName}`;
  }

  age(dob: string): number {
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  employmentLabel(e: EmploymentType): string {
    const map: Record<EmploymentType, string> = {
      [EmploymentType.DEPENDENT]: 'Empleado dependiente',
      [EmploymentType.INDEPENDENT]: 'Independiente',
      [EmploymentType.PENSIONER]: 'Pensionado',
      [EmploymentType.OTHER]: 'Otro',
    };
    return map[e] ?? e;
  }

  loanStatusLabel(s: LoanStatus): string {
    const labels: Record<LoanStatus, string> = {
      [LoanStatus.PRE_APPROVED]: 'Pre-aprobado',
      [LoanStatus.PRE_APPROVED_WITH_OBSERVATIONS]: 'Pre-aprobado con observaciones',
      [LoanStatus.REJECTED]: 'Rechazado',
    };
    return labels[s] ?? s;
  }

  loanStatusClass(s: LoanStatus): string {
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
}
