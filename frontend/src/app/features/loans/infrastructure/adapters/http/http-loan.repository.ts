import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Loan, SimulateLoanPayload } from '../../../domain/loan.model';
import { ILoanRepository } from '../../../ports/outbound/loan-repository.port';

const API_URL = '/api';

@Injectable()
export class HttpLoanRepository implements ILoanRepository {
  private readonly http = inject(HttpClient);

  simulate(payload: SimulateLoanPayload): Observable<Loan> {
    return this.http.post<Loan>(`${API_URL}/loans/simulate`, payload);
  }

  getById(id: string): Observable<Loan> {
    return this.http.get<Loan>(`${API_URL}/loans/${id}`);
  }

  explain(id: string): Observable<{ explanation: string }> {
    return this.http.post<{ explanation: string }>(`${API_URL}/loans/${id}/explain`, {});
  }
}
