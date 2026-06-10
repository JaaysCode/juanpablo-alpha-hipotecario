export interface LoanExplainInput {
  propertyValue: number;
  downPayment: number;
  loanAmount: number;
  termInYears: number;
  annualInterestRate: number;
  monthlyPayment: number;
  totalInterest: number;
  status: string;
  rejectionReason?: string;
}


export interface ILoanExplainer {
  explain(input: LoanExplainInput): Promise<string>;
}
