import { Entity } from '../../../../shared/domain/entity.base';

export interface AmortizationEntryProps {
  id?: string;
  loanId: string;
  monthNumber: number;
  payment: number; // COP
  principal: number; // COP
  interest: number; // COP
  balance: number; // COP
  createdAt?: Date;
}

export class AmortizationEntry extends Entity<AmortizationEntryProps> {
  private constructor(props: AmortizationEntryProps) {
    super(props);
  }

  static create(
    loanId: string,
    monthNumber: number,
    payment: number,
    principal: number,
    interest: number,
    balance: number,
  ): AmortizationEntry {
    return new AmortizationEntry({
      id: this.generateId(),
      loanId,
      monthNumber,
      payment,
      principal,
      interest,
      balance,
      createdAt: new Date(),
    });
  }

  static fromDB(props: AmortizationEntryProps): AmortizationEntry {
    return new AmortizationEntry(props);
  }

  get loanId(): string {
    return this.props.loanId;
  }

  get monthNumber(): number {
    return this.props.monthNumber;
  }

  get payment(): number {
    return this.props.payment;
  }

  get principal(): number {
    return this.props.principal;
  }

  get interest(): number {
    return this.props.interest;
  }

  get balance(): number {
    return this.props.balance;
  }

  get createdAt(): Date {
    return this.props.createdAt || new Date();
  }
}
