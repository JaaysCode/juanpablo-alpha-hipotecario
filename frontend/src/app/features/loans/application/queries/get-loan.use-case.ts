import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Loan } from '../../domain/loan.model';
import { LOAN_REPOSITORY_PORT } from '../../ports/outbound/loan-repository.port';

@Injectable({ providedIn: 'root' })
export class GetLoanUseCase {
  private readonly repo = inject(LOAN_REPOSITORY_PORT);

  execute(id: string): Observable<Loan> {
    return this.repo.getById(id);
  }
}
