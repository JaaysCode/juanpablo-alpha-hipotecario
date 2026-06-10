import { Client } from '../../../domain/entities/client';
import { ClientDbEntity } from '../entities/client.db.entity';

export class ClientMapper {
  static toDomain(raw: ClientDbEntity): Client {
    return Client.reconstitute({
      id: raw.id,
      nationalIdentification: raw.nationalIdentification,
      firstName: raw.firstName,
      lastName: raw.lastName,
      dateOfBirth: raw.dateOfBirth,
      email: raw.email,
      phoneNumber: raw.phoneNumber,
      monthlyIncome: raw.monthlyIncome,
      monthlyExpenses: raw.monthlyExpenses,
      numberOfDependents: raw.numberOfDependents,
      currentAddress: raw.currentAddress,
      employmentType: raw.employmentType,
      company: raw.company,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(client: Client): ClientDbEntity {
    const entity = new ClientDbEntity();
    entity.id = client.id;
    entity.nationalIdentification = client.nationalIdentification;
    entity.firstName = client.firstName;
    entity.lastName = client.lastName;
    entity.dateOfBirth = client.dateOfBirth;
    entity.email = client.email;
    entity.phoneNumber = client.phoneNumber;
    entity.monthlyIncome = client.monthlyIncome;
    entity.monthlyExpenses = client.monthlyExpenses ?? null;
    entity.numberOfDependents = client.numberOfDependents ?? null;
    entity.currentAddress = client.currentAddress ?? null;
    entity.employmentType = client.employmentType;
    entity.company = client.company ?? null;
    return entity;
  }

  static toDTO(client: Client) {
    return {
      id: client.id,
      nationalIdentification: client.nationalIdentification,
      firstName: client.firstName,
      lastName: client.lastName,
      dateOfBirth: client.dateOfBirth,
      email: client.email,
      phoneNumber: client.phoneNumber,
      monthlyIncome: client.monthlyIncome,
      monthlyExpenses: client.monthlyExpenses ?? null,
      numberOfDependents: client.numberOfDependents ?? null,
      currentAddress: client.currentAddress ?? null,
      employmentType: client.employmentType,
      company: client.company ?? null,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    };
  }
}
