import { AmortizationEntry, AmortizationEntryProps } from '../../../domain/entities/amortization-entry';
import { AmortizationEntryDbEntity } from '../entities/amortization-entry.db.entity';

export class AmortizationEntryMapper {
  static toDomain(raw: AmortizationEntryDbEntity): AmortizationEntry {
    return AmortizationEntry.fromDB({
      id: raw.id,
      loanId: raw.loanId,
      monthNumber: raw.monthNumber,
      payment: Number(raw.payment),
      principal: Number(raw.principal),
      interest: Number(raw.interest),
      balance: Number(raw.balance),
      createdAt: raw.createdAt,
    });
  }

  static toPersistence(entry: AmortizationEntry): AmortizationEntryDbEntity {
    const props = entry.toObject() as AmortizationEntryProps;
    const entity = new AmortizationEntryDbEntity();
    entity.id = props.id!;
    entity.loanId = props.loanId;
    entity.monthNumber = props.monthNumber;
    entity.payment = props.payment;
    entity.principal = props.principal;
    entity.interest = props.interest;
    entity.balance = props.balance;
    entity.createdAt = props.createdAt || new Date();
    return entity;
  }

  static toDTO(entry: AmortizationEntry) {
    const props = entry.toObject() as AmortizationEntryProps;
    return {
      id: props.id,
      loanId: props.loanId,
      monthNumber: props.monthNumber,
      payment: props.payment,
      principal: props.principal,
      interest: props.interest,
      balance: props.balance,
      createdAt: props.createdAt,
    };
  }
}
