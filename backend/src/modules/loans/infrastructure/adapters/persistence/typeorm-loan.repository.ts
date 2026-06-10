import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ILoanRepository } from '../../../domain/ports/loan.repository';
import { Loan } from '../../../domain/entities/loan';
import { AmortizationEntry } from '../../../domain/entities/amortization-entry';
import { LoanDbEntity } from '../../persistence/entities/loan.db.entity';
import { AmortizationEntryDbEntity } from '../../persistence/entities/amortization-entry.db.entity';
import { LoanMapper } from '../../persistence/mappers/loan.mapper';
import { AmortizationEntryMapper } from '../../persistence/mappers/amortization-entry.mapper';

@Injectable()
export class TypeOrmLoanRepository implements ILoanRepository {
  constructor(
    @InjectRepository(LoanDbEntity)
    private readonly loanRepo: Repository<LoanDbEntity>,
    @InjectRepository(AmortizationEntryDbEntity)
    private readonly amortizationRepo: Repository<AmortizationEntryDbEntity>,
  ) {}

  async create(loan: Loan, amortizationEntries: AmortizationEntry[]): Promise<Loan> {
    const loanEntity = LoanMapper.toPersistence(loan);
    const savedLoan = await this.loanRepo.save(loanEntity);

    if (amortizationEntries.length > 0) {
      const entries = amortizationEntries.map((e) =>
        AmortizationEntryMapper.toPersistence(e),
      );
      await this.amortizationRepo.save(entries);
    }

    return LoanMapper.toDomain(savedLoan);
  }

  async findById(id: string): Promise<Loan | null> {
    const entity = await this.loanRepo.findOne({ where: { id } });
    return entity ? LoanMapper.toDomain(entity) : null;
  }

  async findByClientId(
    clientId: string,
    page: number,
    limit: number,
  ): Promise<{ loans: Loan[]; total: number }> {
    const [entities, total] = await this.loanRepo.findAndCount({
      where: { clientId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { loans: entities.map(LoanMapper.toDomain), total };
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<{ loans: Loan[]; total: number }> {
    const [entities, total] = await this.loanRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { loans: entities.map(LoanMapper.toDomain), total };
  }

  async update(loan: Loan): Promise<Loan> {
    const entity = LoanMapper.toPersistence(loan);
    const saved = await this.loanRepo.save(entity);
    return LoanMapper.toDomain(saved);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.loanRepo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
