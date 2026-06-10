import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Client, ClientsResponse, CreateClientPayload } from '../../domain/client.model';
import { LoanSummary } from '../../../loans/domain/loan.model';

export interface IClientRepository {
  getAll(page: number, limit: number, search?: string): Observable<ClientsResponse>;
  getById(id: string): Observable<Client>;
  getByNationalId(nationalId: string): Observable<Client>;
  create(payload: CreateClientPayload): Observable<Client>;
  getLoans(clientId: string): Observable<LoanSummary[]>;
}

export const CLIENT_REPOSITORY_PORT = new InjectionToken<IClientRepository>('IClientRepository');
