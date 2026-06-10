import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { EmploymentType } from '../../../domain/entities/client';

const decimalTransformer = {
  to: (value: number | null): number | null => value,
  from: (value: string | null): number | null =>
    value === null ? null : Number.parseFloat(value),
};

@Entity('clients')
@Index('idx_clients_national_id', ['nationalIdentification'], { unique: true })
@Index('idx_clients_email', ['email'], { unique: true })
export class ClientDbEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('varchar', { unique: true, length: 20 })
  nationalIdentification!: string;

  @Column('varchar', { length: 100 })
  firstName!: string;

  @Column('varchar', { length: 100 })
  lastName!: string;

  @Column('date')
  dateOfBirth!: Date;

  @Column('varchar', { unique: true, length: 255 })
  email!: string;

  @Column('varchar', { length: 20 })
  phoneNumber!: string;

  @Column('decimal', {
    precision: 15,
    scale: 2,
    transformer: decimalTransformer,
  })
  monthlyIncome!: number;

  @Column('decimal', {
    precision: 15,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  monthlyExpenses!: number | null;

  @Column('integer', { nullable: true })
  numberOfDependents!: number | null;

  @Column('varchar', { length: 255, nullable: true })
  currentAddress!: string | null;

  @Column('enum', { enum: EmploymentType })
  employmentType!: EmploymentType;

  @Column('varchar', { length: 255, nullable: true })
  company!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
