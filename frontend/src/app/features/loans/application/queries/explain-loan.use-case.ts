import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { LOAN_REPOSITORY_PORT } from '../../ports/outbound/loan-repository.port';

@Injectable({ providedIn: 'root' })
export class ExplainLoanUseCase {
  private readonly repo = inject(LOAN_REPOSITORY_PORT);

  execute(id: string): Observable<{ explanation: string }> {
    return this.repo.explain(id);
  }
}
