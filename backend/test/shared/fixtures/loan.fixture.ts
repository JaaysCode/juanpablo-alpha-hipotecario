import { Loan, LoanStatus } from '@/modules/loans/domain/entities/loan';

export const LOAN_FIXTURE_DEFAULTS = {
  clientId: 'client-uuid-001',
  propertyValue: 200_000_000,
  downPayment: 40_000_000,
  termInYears: 20,
  annualInterestRate: 0.12,
  monthlyIncome: {
    preApproved: 7_200_000,
    preApprovedWithObservations: 6_000_000,
    rejected: 5_000_000,
  },
};

export function makeLoan(overrides: Partial<{
  clientId: string;
  propertyValue: number;
  downPayment: number;
  termInYears: number;
  annualInterestRate: number;
  status: LoanStatus;
}> = {}): Loan {
  const loan = Loan.create({
    clientId: overrides.clientId ?? LOAN_FIXTURE_DEFAULTS.clientId,
    propertyValue: overrides.propertyValue ?? LOAN_FIXTURE_DEFAULTS.propertyValue,
    downPayment: overrides.downPayment ?? LOAN_FIXTURE_DEFAULTS.downPayment,
    termInYears: overrides.termInYears ?? LOAN_FIXTURE_DEFAULTS.termInYears,
    annualInterestRate: overrides.annualInterestRate ?? LOAN_FIXTURE_DEFAULTS.annualInterestRate,
    status: overrides.status ?? LoanStatus.PENDING,
  });

  loan.setCalculatedValues(1_761_760, 222_822_400);
  return loan;
}
