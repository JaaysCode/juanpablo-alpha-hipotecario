import { Entity } from '../../../../shared/domain/entity.base';

export enum LoanStatus {
  PENDING = 'PENDING',
  PRE_APPROVED = 'PRE_APPROVED',
  PRE_APPROVED_WITH_OBSERVATIONS = 'PRE_APPROVED_WITH_OBSERVATIONS',
  REJECTED = 'REJECTED',
}

export interface LoanProps {
  id?: string;
  clientId: string;
  propertyValue: number; // COP
  downPayment: number; // COP
  loanAmount: number; // Calculated: propertyValue - downPayment, COP
  termInYears: number;
  annualInterestRate: number; // 0.12 = 12% EA
  monthlyPayment: number; // Calculated, COP
  totalInterest: number; // Calculated, COP
  status: LoanStatus;
  rejectionReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Loan extends Entity<LoanProps> {
  private constructor(props: LoanProps) {
    super(props);
  }

  static create(
    props: Omit<
      LoanProps,
      | 'id'
      | 'loanAmount'
      | 'monthlyPayment'
      | 'totalInterest'
      | 'createdAt'
      | 'updatedAt'
    >,
  ): Loan {
    const loanAmount = props.propertyValue - props.downPayment;

    return new Loan({
      ...props,
      id: this.generateId(),
      loanAmount,
      monthlyPayment: 0, // Will be calculated by application service
      totalInterest: 0, // Will be calculated by application service
      status: LoanStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static fromDB(props: LoanProps): Loan {
    return new Loan(props);
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get clientId(): string {
    return this.props.clientId;
  }

  get propertyValue(): number {
    return this.props.propertyValue;
  }

  get downPayment(): number {
    return this.props.downPayment;
  }

  get loanAmount(): number {
    return this.props.loanAmount;
  }

  get termInYears(): number {
    return this.props.termInYears;
  }

  get annualInterestRate(): number {
    return this.props.annualInterestRate;
  }

  get monthlyPayment(): number {
    return this.props.monthlyPayment;
  }

  get totalInterest(): number {
    return this.props.totalInterest;
  }

  get status(): LoanStatus {
    return this.props.status;
  }

  get rejectionReason(): string | undefined {
    return this.props.rejectionReason;
  }

  get createdAt(): Date {
    return this.props.createdAt || new Date();
  }

  get updatedAt(): Date {
    return this.props.updatedAt || new Date();
  }

  setCalculatedValues(monthlyPayment: number, totalInterest: number): void {
    this.props.monthlyPayment = monthlyPayment;
    this.props.totalInterest = totalInterest;
    this.props.updatedAt = new Date();
  }

  approve(): void {
    this.props.status = LoanStatus.PRE_APPROVED;
    this.props.updatedAt = new Date();
  }

  approveWithObservations(): void {
    this.props.status = LoanStatus.PRE_APPROVED_WITH_OBSERVATIONS;
    this.props.updatedAt = new Date();
  }

  reject(reason: string): void {
    this.props.status = LoanStatus.REJECTED;
    this.props.rejectionReason = reason;
    this.props.updatedAt = new Date();
  }
}
