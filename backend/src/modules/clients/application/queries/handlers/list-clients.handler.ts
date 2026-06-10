import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListClientsQuery } from '../list-clients.query';
import type { Client } from '../../../domain/entities/client';
import type { IClientRepository } from '../../../domain/ports/client.repository';
import { CLIENT_REPOSITORY } from '../../commands/handlers/create-client.handler';

@QueryHandler(ListClientsQuery)
export class ListClientsHandler implements IQueryHandler<ListClientsQuery> {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: IClientRepository,
  ) {}

  async execute(
    query: ListClientsQuery,
  ): Promise<{ clients: Client[]; total: number }> {
    return this.clientRepository.findAll(query.page, query.limit, query.search);
  }
}
