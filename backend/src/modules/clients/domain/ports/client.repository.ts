import { Client } from '../entities/client';

export interface IClientRepository {
  create(client: Client): Promise<Client>;
  findById(id: string): Promise<Client | null>;
  findByNationalIdentification(
    nationalIdentification: string,
  ): Promise<Client | null>;
  findByEmail(email: string): Promise<Client | null>;
  findAll(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ clients: Client[]; total: number }>;
  update(client: Client): Promise<Client>;
  delete(id: string): Promise<boolean>;
}
