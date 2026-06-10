import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  ForeignKey,
} from 'typeorm';
import { LoanDbEntity } from './loan.db.entity';

@Entity('amortization_entries')
@Index('idx_amortization_entries_loan_id', ['loanId'])
@Index('idx_amortization_entries_loan_month', ['loanId', 'monthNumber'])
export class AmortizationEntryDbEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  loanId: string;

  @Column('integer')
  monthNumber: number;

  @Column('decimal', { precision: 15, scale: 2 })
  payment: number;

  @Column('decimal', { precision: 15, scale: 2 })
  principal: number;

  @Column('decimal', { precision: 15, scale: 2 })
  interest: number;

  @Column('decimal', { precision: 15, scale: 2 })
  balance: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => LoanDbEntity, (loan) => loan.amortizationEntries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'loanId' })
  loan?: LoanDbEntity;
}
