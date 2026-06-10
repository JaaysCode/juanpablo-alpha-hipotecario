import { Loan } from '../entities/loan';
import { AmortizationEntry } from '../entities/amortization-entry';

export interface ILoanRepository {
  create(loan: Loan, amortizationEntries: AmortizationEntry[]): Promise<Loan>;
  findById(id: string): Promise<Loan | null>;
  findByClientId(clientId: string, page: number, limit: number): Promise<{ loans: Loan[]; total: number }>;
  findAll(page: number, limit: number): Promise<{ loans: Loan[]; total: number }>;
  update(loan: Loan): Promise<Loan>;
  delete(id: string): Promise<boolean>;
}

export interface IAmortizationEntryRepository {
  createMany(entries: AmortizationEntry[]): Promise<AmortizationEntry[]>;
  findByLoanId(loanId: string): Promise<AmortizationEntry[]>;
  deleteByLoanId(loanId: string): Promise<boolean>;
}
