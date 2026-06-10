import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Client, CreateClientPayload } from '../../domain/client.model';
import { CLIENT_REPOSITORY_PORT } from '../../ports/outbound/client-repository.port';

@Injectable({ providedIn: 'root' })
export class CreateClientUseCase {
  private readonly repo = inject(CLIENT_REPOSITORY_PORT);

  execute(payload: CreateClientPayload): Observable<Client> {
    return this.repo.create(payload);
  }
}
