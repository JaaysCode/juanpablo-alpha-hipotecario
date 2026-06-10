import { EmploymentType } from '../../domain/entities/client';

export class CreateClientCommand {
  constructor(
    public readonly nationalIdentification: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly dateOfBirth: Date,
    public readonly email: string,
    public readonly phoneNumber: string,
    public readonly monthlyIncome: number,
    public readonly employmentType: EmploymentType,
    public readonly monthlyExpenses?: number,
    public readonly numberOfDependents?: number,
    public readonly currentAddress?: string,
    public readonly company?: string,
  ) {}
}
