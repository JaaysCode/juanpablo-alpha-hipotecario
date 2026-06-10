import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Loan, SimulateLoanPayload } from '../../domain/loan.model';

export interface ILoanRepository {
  simulate(payload: SimulateLoanPayload): Observable<Loan>;
  getById(id: string): Observable<Loan>;
  explain(id: string): Observable<{ explanation: string }>;
}

export const LOAN_REPOSITORY_PORT = new InjectionToken<ILoanRepository>('ILoanRepository');
