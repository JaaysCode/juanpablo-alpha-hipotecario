export class SimulateLoanCommand {
  constructor(
    public readonly clientId: string,
    public readonly monthlyIncome: number,
    public readonly propertyValue: number,
    public readonly downPayment: number,
    public readonly termInYears: number,
    public readonly annualInterestRate: number,
  ) {}
}
