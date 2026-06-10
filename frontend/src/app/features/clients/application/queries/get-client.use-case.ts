import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Client } from '../../domain/client.model';
import { CLIENT_REPOSITORY_PORT } from '../../ports/outbound/client-repository.port';

@Injectable({ providedIn: 'root' })
export class GetClientUseCase {
  private readonly repo = inject(CLIENT_REPOSITORY_PORT);

  execute(id: string): Observable<Client> {
    return this.repo.getById(id);
  }

  executeByNationalId(nationalId: string): Observable<Client> {
    return this.repo.getByNationalId(nationalId);
  }
}
