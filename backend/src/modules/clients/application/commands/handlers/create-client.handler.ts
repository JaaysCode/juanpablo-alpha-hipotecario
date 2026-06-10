import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ConflictException } from '@nestjs/common';
import { CreateClientCommand } from '../create-client.command';
import { Client } from '../../../domain/entities/client';
import type { IClientRepository } from '../../../domain/ports/client.repository';

export const CLIENT_REPOSITORY = 'CLIENT_REPOSITORY';

@CommandHandler(CreateClientCommand)
export class CreateClientHandler implements ICommandHandler<CreateClientCommand> {
  constructor(
    @Inject(CLIENT_REPOSITORY)
    private readonly clientRepository: IClientRepository,
  ) {}

  async execute(command: CreateClientCommand): Promise<Client> {
    const [existingByCc, existingByEmail] = await Promise.all([
      this.clientRepository.findByNationalIdentification(
        command.nationalIdentification,
      ),
      this.clientRepository.findByEmail(command.email),
    ]);

    if (existingByCc) {
      throw new ConflictException(
        `Client with ID ${command.nationalIdentification} already exists`,
      );
    }

    if (existingByEmail) {
      throw new ConflictException(
        `Client with email ${command.email} already exists`,
      );
    }

    const client = Client.create({
      nationalIdentification: command.nationalIdentification,
      firstName: command.firstName,
      lastName: command.lastName,
      dateOfBirth: command.dateOfBirth,
      email: command.email,
      phoneNumber: command.phoneNumber,
      monthlyIncome: command.monthlyIncome,
      employmentType: command.employmentType,
      monthlyExpenses: command.monthlyExpenses,
      numberOfDependents: command.numberOfDependents,
      currentAddress: command.currentAddress,
      company: command.company,
    });

    return this.clientRepository.create(client);
  }
}
