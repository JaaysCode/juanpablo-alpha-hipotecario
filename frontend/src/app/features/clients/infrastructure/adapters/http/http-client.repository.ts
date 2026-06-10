import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client, ClientsResponse, CreateClientPayload } from '../../../domain/client.model';
import { LoanSummary } from '../../../../loans/domain/loan.model';
import { IClientRepository } from '../../../ports/outbound/client-repository.port';

const API_URL = '/api';

@Injectable()
export class HttpClientRepository implements IClientRepository {
  private readonly http = inject(HttpClient);

  getAll(page = 1, limit = 10, search?: string): Observable<ClientsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    if (search) params = params.set('search', search);
    return this.http.get<ClientsResponse>(`${API_URL}/clients`, { params });
  }

  getById(id: string): Observable<Client> {
    return this.http.get<Client>(`${API_URL}/clients/${id}`);
  }

  getByNationalId(nationalId: string): Observable<Client> {
    return this.http.get<Client>(`${API_URL}/clients/by-national-id/${nationalId}`);
  }

  create(payload: CreateClientPayload): Observable<Client> {
    return this.http.post<Client>(`${API_URL}/clients`, payload);
  }

  getLoans(clientId: string): Observable<LoanSummary[]> {
    return this.http.get<LoanSummary[]>(`${API_URL}/clients/${clientId}/loans`);
  }
}
