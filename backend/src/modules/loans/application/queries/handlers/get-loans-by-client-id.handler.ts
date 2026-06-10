import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetLoansByClientIdQuery } from '../get-loans-by-client-id.query';
import { LOAN_REPOSITORY } from '../../tokens';
import type { ILoanRepository } from '../../../domain/ports/loan.repository';
import type { Loan } from '../../../domain/entities/loan';

@QueryHandler(GetLoansByClientIdQuery)
export class GetLoansByClientIdHandler
  implements IQueryHandler<GetLoansByClientIdQuery>
{
  constructor(
    @Inject(LOAN_REPOSITORY)
    private readonly loanRepository: ILoanRepository,
  ) {}

  async execute(
    query: GetLoansByClientIdQuery,
  ): Promise<{ loans: Loan[]; total: number }> {
    return this.loanRepository.findByClientId(
      query.clientId,
      query.page,
      query.limit,
    );
  }
}
