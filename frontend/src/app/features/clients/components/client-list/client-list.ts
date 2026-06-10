import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ListClientsUseCase } from '../../application/queries/list-clients.use-case';
import { Client, ClientsResponse } from '../../domain/client.model';
import { slideDown } from '../../../../shared/animations';

@Component({
  selector: 'app-client-list',
  imports: [RouterLink, FormsModule],
  templateUrl: './client-list.html',
  styleUrl: './client-list.css',
  animations: [slideDown],
})
export class ClientListComponent implements OnInit {
  private readonly listClients = inject(ListClientsUseCase);
  private readonly router = inject(Router);
  private readonly searchSubject = new Subject<string>();

  clients = signal<Client[]>([]);
  total = signal(0);
  page = signal(1);
  limit = signal(10);
  search = signal('');
  loading = signal(false);
  error = signal<string | null>(null);

  readonly skeletonRows = Array(5).fill(null);

  totalPages = computed(() => Math.ceil(this.total() / this.limit()));
  pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  constructor() {
    this.searchSubject
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        switchMap((term) => {
          this.loading.set(true);
          this.error.set(null);
          this.page.set(1);
          return this.listClients.execute(1, this.limit(), term || undefined);
        }),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: (res: ClientsResponse) => {
          this.clients.set(res.data);
          this.total.set(res.meta.total);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Error al cargar los clientes. Intenta de nuevo.');
          this.loading.set(false);
        },
      });
  }

  ngOnInit(): void {
    this.loadPage(1);
  }

  loadPage(p: number): void {
    if (p < 1 || (p > this.totalPages() && this.totalPages() > 0)) return;
    this.page.set(p);
    this.loading.set(true);
    this.error.set(null);
    this.listClients.execute(p, this.limit(), this.search() || undefined).subscribe({
      next: (res: ClientsResponse) => {
        this.clients.set(res.data);
        this.total.set(res.meta.total);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar los clientes. Intenta de nuevo.');
        this.loading.set(false);
      },
    });
  }

  onSearchChange(value: string): void {
    this.search.set(value);
    this.searchSubject.next(value);
  }

  clearSearch(): void {
    this.onSearchChange('');
  }

  goToDetail(id: string): void {
    this.router.navigate(['/clients', id]);
  }

  fullName(c: Client): string {
    return `${c.firstName} ${c.lastName}`;
  }

  formatCurrency(v: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(v);
  }
}
