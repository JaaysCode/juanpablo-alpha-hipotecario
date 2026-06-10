import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IAmortizationEntryRepository } from '../../../domain/ports/loan.repository';
import { AmortizationEntry } from '../../../domain/entities/amortization-entry';
import { AmortizationEntryDbEntity } from '../../persistence/entities/amortization-entry.db.entity';
import { AmortizationEntryMapper } from '../../persistence/mappers/amortization-entry.mapper';

@Injectable()
export class TypeOrmAmortizationEntryRepository
  implements IAmortizationEntryRepository
{
  constructor(
    @InjectRepository(AmortizationEntryDbEntity)
    private readonly repo: Repository<AmortizationEntryDbEntity>,
  ) {}

  async createMany(
    entries: AmortizationEntry[],
  ): Promise<AmortizationEntry[]> {
    const entities = entries.map(AmortizationEntryMapper.toPersistence);
    const saved = await this.repo.save(entities);
    return saved.map(AmortizationEntryMapper.toDomain);
  }

  async findByLoanId(loanId: string): Promise<AmortizationEntry[]> {
    const entities = await this.repo.find({
      where: { loanId },
      order: { monthNumber: 'ASC' },
    });
    return entities.map(AmortizationEntryMapper.toDomain);
  }

  async deleteByLoanId(loanId: string): Promise<boolean> {
    const result = await this.repo.delete({ loanId });
    return (result.affected ?? 0) > 0;
  }
}
