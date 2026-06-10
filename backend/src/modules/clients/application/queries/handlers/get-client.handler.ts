import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetClientQuery } from '../get-client.query';
import type { Client } from '../../../domain/entities/client';
import type { IClientRepository } from '../../../domain/ports/client.repository';
import { CLIENT_REPOSITORY } from '../../commands/handlers/create-client.handler';

@QueryHandler(GetClientQuery)
export class GetClientHandler implements IQueryHandler<GetClientQuery> {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: IClientRepository,
  ) {}

  async execute(query: GetClientQuery): Promise<Client> {
    const client = await this.clientRepository.findById(query.id);

    if (!client) {
      throw new NotFoundException(`Client ${query.id} not found`);
    }

    return client;
  }
}
