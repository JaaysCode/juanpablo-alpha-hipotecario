import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientDbEntity } from './infrastructure/persistence/entities/client.db.entity';
import { TypeOrmClientRepository } from './infrastructure/adapters/persistence/typeorm-client.repository';
import { ClientsController } from './infrastructure/adapters/http/clients.controller';
import { CreateClientHandler } from './application/commands/handlers/create-client.handler';
import { GetClientHandler } from './application/queries/handlers/get-client.handler';
import { ListClientsHandler } from './application/queries/handlers/list-clients.handler';
import { GetClientByNationalIdHandler } from './application/queries/handlers/get-client-by-national-id.handler';
import { CLIENT_REPOSITORY } from './application/commands/handlers/create-client.handler';

const commandHandlers = [CreateClientHandler];
const queryHandlers = [GetClientHandler, ListClientsHandler, GetClientByNationalIdHandler];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([ClientDbEntity])],
  controllers: [ClientsController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    {
      provide: CLIENT_REPOSITORY,
      useClass: TypeOrmClientRepository,
    },
  ],
})
export class ClientsModule {}
