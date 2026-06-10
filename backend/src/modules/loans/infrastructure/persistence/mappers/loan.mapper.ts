import { Loan, LoanProps } from '../../../domain/entities/loan';
import { LoanDbEntity } from '../entities/loan.db.entity';

export class LoanMapper {
  static toDomain(raw: LoanDbEntity): Loan {
    return Loan.fromDB({
      id: raw.id,
      clientId: raw.clientId,
      propertyValue: Number(raw.propertyValue),
      downPayment: Number(raw.downPayment),
      loanAmount: Number(raw.loanAmount),
      termInYears: raw.termInYears,
      annualInterestRate: Number(raw.annualInterestRate),
      monthlyPayment: Number(raw.monthlyPayment),
      totalInterest: Number(raw.totalInterest),
      status: raw.status,
      rejectionReason: raw.rejectionReason || undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(loan: Loan): LoanDbEntity {
    const props = loan.toObject() as LoanProps;
    const entity = new LoanDbEntity();
    entity.id = props.id!;
    entity.clientId = props.clientId;
    entity.propertyValue = props.propertyValue;
    entity.downPayment = props.downPayment;
    entity.loanAmount = props.loanAmount;
    entity.termInYears = props.termInYears;
    entity.annualInterestRate = props.annualInterestRate;
    entity.monthlyPayment = props.monthlyPayment;
    entity.totalInterest = props.totalInterest;
    entity.status = props.status;
    entity.rejectionReason = props.rejectionReason || null;
    entity.createdAt = props.createdAt || new Date();
    entity.updatedAt = props.updatedAt || new Date();
    return entity;
  }

  static toDTO(loan: Loan) {
    const props = loan.toObject() as LoanProps;
    return {
      id: props.id,
      clientId: props.clientId,
      propertyValue: props.propertyValue,
      downPayment: props.downPayment,
      loanAmount: props.loanAmount,
      termInYears: props.termInYears,
      annualInterestRate: props.annualInterestRate,
      monthlyPayment: props.monthlyPayment,
      totalInterest: props.totalInterest,
      status: props.status,
      rejectionReason: props.rejectionReason,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
