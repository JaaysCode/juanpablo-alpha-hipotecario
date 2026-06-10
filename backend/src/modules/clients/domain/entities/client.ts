import { Entity } from '../../../../shared/domain/entity.base';

export enum EmploymentType {
  DEPENDENT = 'DEPENDENT',
  INDEPENDENT = 'INDEPENDENT',
}

export interface ClientProps {
  id?: string;
  nationalIdentification: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  email: string;
  phoneNumber: string;
  monthlyIncome: number;
  monthlyExpenses?: number;
  numberOfDependents?: number;
  currentAddress?: string;
  employmentType: EmploymentType;
  company?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ClientReconstituteData {
  id: string;
  nationalIdentification: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  email: string;
  phoneNumber: string;
  monthlyIncome: number;
  monthlyExpenses: number | null;
  numberOfDependents: number | null;
  currentAddress: string | null;
  employmentType: EmploymentType;
  company: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Client extends Entity<ClientProps> {
  private constructor(props: ClientProps) {
    super(props);
  }

  static create(
    props: Omit<ClientProps, 'id' | 'createdAt' | 'updatedAt'>,
  ): Client {
    return new Client({
      ...props,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(data: ClientReconstituteData): Client {
    return new Client({
      id: data.id,
      nationalIdentification: data.nationalIdentification,
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth,
      email: data.email,
      phoneNumber: data.phoneNumber,
      monthlyIncome: data.monthlyIncome,
      monthlyExpenses: data.monthlyExpenses ?? undefined,
      numberOfDependents: data.numberOfDependents ?? undefined,
      currentAddress: data.currentAddress ?? undefined,
      employmentType: data.employmentType,
      company: data.company ?? undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  get id(): string {
    return this.props.id!;
  }

  get nationalIdentification(): string {
    return this.props.nationalIdentification;
  }

  get firstName(): string {
    return this.props.firstName;
  }

  get lastName(): string {
    return this.props.lastName;
  }

  get dateOfBirth(): Date {
    return this.props.dateOfBirth;
  }

  get email(): string {
    return this.props.email;
  }

  get phoneNumber(): string {
    return this.props.phoneNumber;
  }

  get monthlyIncome(): number {
    return this.props.monthlyIncome;
  }

  get monthlyExpenses(): number | undefined {
    return this.props.monthlyExpenses;
  }

  get numberOfDependents(): number | undefined {
    return this.props.numberOfDependents;
  }

  get currentAddress(): string | undefined {
    return this.props.currentAddress;
  }

  get employmentType(): EmploymentType {
    return this.props.employmentType;
  }

  get company(): string | undefined {
    return this.props.company;
  }

  get createdAt(): Date {
    return this.props.createdAt!;
  }

  get updatedAt(): Date {
    return this.props.updatedAt!;
  }

  update(props: Partial<Omit<ClientProps, 'id' | 'createdAt'>>): void {
    this.props = { ...this.props, ...props, updatedAt: new Date() };
  }
}
