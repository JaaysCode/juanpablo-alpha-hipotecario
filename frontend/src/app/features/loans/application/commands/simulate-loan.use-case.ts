import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Loan, SimulateLoanPayload } from '../../domain/loan.model';
import { LOAN_REPOSITORY_PORT } from '../../ports/outbound/loan-repository.port';

@Injectable({ providedIn: 'root' })
export class SimulateLoanUseCase {
  private readonly repo = inject(LOAN_REPOSITORY_PORT);

  execute(payload: SimulateLoanPayload): Observable<Loan> {
    return this.repo.simulate(payload);
  }
}
