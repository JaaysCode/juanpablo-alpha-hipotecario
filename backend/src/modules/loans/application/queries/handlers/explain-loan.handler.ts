import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { ExplainLoanQuery } from '../explain-loan.query';
import { LOAN_REPOSITORY, AMORTIZATION_ENTRY_REPOSITORY, LOAN_EXPLAINER } from '../../tokens';
import type { ILoanExplainer } from '../../../domain/ports/loan-explainer.port';
import type { ILoanRepository, IAmortizationEntryRepository } from '../../../domain/ports/loan.repository';
import { LoanProps } from '../../../domain/entities/loan';

@QueryHandler(ExplainLoanQuery)
export class ExplainLoanHandler implements IQueryHandler<ExplainLoanQuery> {
  constructor(
    @Inject(LOAN_REPOSITORY)
    private readonly loanRepository: ILoanRepository,
    @Inject(AMORTIZATION_ENTRY_REPOSITORY)
    private readonly amortizationEntryRepository: IAmortizationEntryRepository,
    @Inject(LOAN_EXPLAINER)
    private readonly loanExplainer: ILoanExplainer,
  ) {}

  async execute(query: ExplainLoanQuery): Promise<{ explanation: string }> {
    const loan = await this.loanRepository.findById(query.loanId);
    if (!loan) throw new NotFoundException(`Loan ${query.loanId} not found`);

    const props = loan.toObject() as LoanProps;

    const explanation = await this.loanExplainer.explain({
      propertyValue: props.propertyValue,
      downPayment: props.downPayment,
      loanAmount: props.loanAmount,
      termInYears: props.termInYears,
      annualInterestRate: props.annualInterestRate,
      monthlyPayment: props.monthlyPayment,
      totalInterest: props.totalInterest,
      status: props.status,
      rejectionReason: props.rejectionReason,
    });

    return { explanation };
  }
}
