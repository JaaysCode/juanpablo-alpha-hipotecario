import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { LoanStatus } from '../../../domain/entities/loan';
import { AmortizationEntryDbEntity } from './amortization-entry.db.entity';

@Entity('loans')
@Index('idx_loans_client_id', ['clientId'])
@Index('idx_loans_status', ['status'])
export class LoanDbEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  clientId: string;

  @Column('decimal', { precision: 15, scale: 2 })
  propertyValue: number;

  @Column('decimal', { precision: 15, scale: 2 })
  downPayment: number;

  @Column('decimal', { precision: 15, scale: 2 })
  loanAmount: number;

  @Column('integer')
  termInYears: number;

  @Column('decimal', { precision: 5, scale: 4 })
  annualInterestRate: number;

  @Column('decimal', { precision: 15, scale: 2 })
  monthlyPayment: number;

  @Column('decimal', { precision: 15, scale: 2 })
  totalInterest: number;

  @Column('enum', { enum: LoanStatus })
  status: LoanStatus;

  @Column('varchar', { length: 255, nullable: true })
  rejectionReason: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(
    () => AmortizationEntryDbEntity,
    (entry) => entry.loan,
    { cascade: true, eager: false },
  )
  amortizationEntries?: AmortizationEntryDbEntity[];
}
