import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetClientByNationalIdQuery } from '../get-client-by-national-id.query';
import type { Client } from '../../../domain/entities/client';
import type { IClientRepository } from '../../../domain/ports/client.repository';
import { CLIENT_REPOSITORY } from '../../commands/handlers/create-client.handler';

@QueryHandler(GetClientByNationalIdQuery)
export class GetClientByNationalIdHandler
  implements IQueryHandler<GetClientByNationalIdQuery>
{
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: IClientRepository,
  ) {}

  async execute(query: GetClientByNationalIdQuery): Promise<Client> {
    const client = await this.clientRepository.findByNationalIdentification(
      query.nationalIdentification,
    );

    if (!client) {
      throw new NotFoundException(
        `Client with CC ${query.nationalIdentification} not found`,
      );
    }

    return client;
  }
}
