import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetLoanByIdQuery } from '../get-loan-by-id.query';
import { LOAN_REPOSITORY, AMORTIZATION_ENTRY_REPOSITORY } from '../../tokens';
import type { ILoanRepository, IAmortizationEntryRepository } from '../../../domain/ports/loan.repository';
import type { Loan } from '../../../domain/entities/loan';
import type { AmortizationEntry } from '../../../domain/entities/amortization-entry';

export { LOAN_REPOSITORY, AMORTIZATION_ENTRY_REPOSITORY } from '../../tokens';

export interface LoanWithEntries {
  loan: Loan;
  amortizationEntries: AmortizationEntry[];
}

@QueryHandler(GetLoanByIdQuery)
export class GetLoanByIdHandler implements IQueryHandler<GetLoanByIdQuery> {
  constructor(
    @Inject(LOAN_REPOSITORY)
    private readonly loanRepository: ILoanRepository,
    @Inject(AMORTIZATION_ENTRY_REPOSITORY)
    private readonly amortizationEntryRepository: IAmortizationEntryRepository,
  ) {}

  async execute(query: GetLoanByIdQuery): Promise<LoanWithEntries> {
    const loan = await this.loanRepository.findById(query.id);

    if (!loan) {
      throw new NotFoundException(`Loan ${query.id} not found`);
    }

    const amortizationEntries =
      await this.amortizationEntryRepository.findByLoanId(loan.id!);

    return { loan, amortizationEntries };
  }
}
