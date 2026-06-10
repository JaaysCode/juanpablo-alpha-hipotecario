export enum LoanStatus {
  PRE_APPROVED = 'PRE_APPROVED',
  PRE_APPROVED_WITH_OBSERVATIONS = 'PRE_APPROVED_WITH_OBSERVATIONS',
  REJECTED = 'REJECTED',
}

export interface AmortizationEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface Loan {
  id: string;
  clientId: string;
  propertyValue: number;
  downPayment: number;
  loanAmount: number;
  termInYears: number;
  annualInterestRate: number;
  monthlyPayment: number;
  status: LoanStatus;
  rejectionReason: string | null;
  totalInterest: number;
  totalPayment: number;
  amortizationSchedule: AmortizationEntry[];
  createdAt: string;
}

export interface SimulateLoanPayload {
  nationalIdentification: string;
  propertyValue: number;
  downPayment: number;
  termInYears: number;
  annualInterestRate: number;
}

export interface LoanSummary {
  id: string;
  clientId: string;
  propertyValue: number;
  downPayment: number;
  loanAmount: number;
  termInYears: number;
  annualInterestRate: number;
  monthlyPayment: number;
  status: LoanStatus;
  rejectionReason: string | null;
  totalInterest: number;
  totalPayment: number;
  createdAt: string;
}
