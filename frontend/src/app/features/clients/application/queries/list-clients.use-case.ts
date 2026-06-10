import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ClientsResponse } from '../../domain/client.model';
import { CLIENT_REPOSITORY_PORT } from '../../ports/outbound/client-repository.port';

@Injectable({ providedIn: 'root' })
export class ListClientsUseCase {
  private readonly repo = inject(CLIENT_REPOSITORY_PORT);

  execute(page = 1, limit = 10, search?: string): Observable<ClientsResponse> {
    return this.repo.getAll(page, limit, search);
  }
}
