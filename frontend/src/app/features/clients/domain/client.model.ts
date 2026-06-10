export enum EmploymentType {
  DEPENDENT = 'DEPENDENT',
  INDEPENDENT = 'INDEPENDENT',
  PENSIONER = 'PENSIONER',
  OTHER = 'OTHER',
}

export interface Client {
  id: string;
  nationalIdentification: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phoneNumber: string;
  monthlyIncome: number;
  monthlyExpenses: number | null;
  numberOfDependents: number | null;
  currentAddress: string | null;
  employmentType: EmploymentType;
  company: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClientsResponse {
  data: Client[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateClientPayload {
  nationalIdentification: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phoneNumber: string;
  monthlyIncome: number;
  monthlyExpenses?: number;
  numberOfDependents?: number;
  currentAddress?: string;
  employmentType: EmploymentType;
  company?: string;
}
