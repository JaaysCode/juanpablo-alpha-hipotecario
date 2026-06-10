import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException } from '@nestjs/common';
import { SimulateLoanCommand } from '../simulate-loan.command';
import { LOAN_REPOSITORY } from '../../tokens';
import type { ILoanRepository } from '../../../domain/ports/loan.repository';
import { Loan, LoanStatus } from '../../../domain/entities/loan';
import { AmortizationEntry } from '../../../domain/entities/amortization-entry';

export interface SimulateLoanResult {
  loan: Loan;
  amortizationEntries: AmortizationEntry[];
}

@CommandHandler(SimulateLoanCommand)
export class SimulateLoanHandler
  implements ICommandHandler<SimulateLoanCommand>
{
  constructor(
    @Inject(LOAN_REPOSITORY)
    private readonly loanRepository: ILoanRepository,
  ) {}

  async execute(command: SimulateLoanCommand): Promise<SimulateLoanResult> {
    const {
      clientId,
      monthlyIncome,
      propertyValue,
      downPayment,
      termInYears,
      annualInterestRate,
    } = command;

    if (downPayment >= propertyValue) {
      throw new BadRequestException(
        'La cuota inicial no puede ser mayor o igual al valor del inmueble.',
      );
    }

    const loanAmount = propertyValue - downPayment;
    const nMonths = termInYears * 12;
    const monthlyRate = annualInterestRate / 12;

    const monthlyPayment =
      loanAmount *
      (monthlyRate * Math.pow(1 + monthlyRate, nMonths)) /
      (Math.pow(1 + monthlyRate, nMonths) - 1);

    const totalPayment = monthlyPayment * nMonths;
    const totalInterest = totalPayment - loanAmount;

    const loan = Loan.create({
      clientId,
      propertyValue,
      downPayment,
      termInYears,
      annualInterestRate,
      status: LoanStatus.PENDING,
    });

    loan.setCalculatedValues(
      Math.round(monthlyPayment * 100) / 100,
      Math.round(totalInterest * 100) / 100,
    );

    const paymentToIncomeRatio = monthlyPayment / monthlyIncome;

    if (paymentToIncomeRatio > 0.3) {
      loan.reject('Capacidad de pago excedida.');
    } else if (paymentToIncomeRatio >= 0.25) {
      loan.approveWithObservations();
    } else {
      loan.approve();
    }

    const amortizationEntries = this.buildAmortizationSchedule(
      loan.id!,
      loanAmount,
      monthlyPayment,
      monthlyRate,
      nMonths,
    );

    const savedLoan = await this.loanRepository.create(loan, amortizationEntries);

    return { loan: savedLoan, amortizationEntries };
  }

  private buildAmortizationSchedule(
    loanId: string,
    loanAmount: number,
    monthlyPayment: number,
    monthlyRate: number,
    nMonths: number,
  ): AmortizationEntry[] {
    const entries: AmortizationEntry[] = [];
    let balance = loanAmount;

    for (let month = 1; month <= nMonths; month++) {
      const interest = balance * monthlyRate;
      const principal = monthlyPayment - interest;
      balance = Math.max(0, balance - principal);

      entries.push(
        AmortizationEntry.create(
          loanId,
          month,
          Math.round(monthlyPayment * 100) / 100,
          Math.round(principal * 100) / 100,
          Math.round(interest * 100) / 100,
          Math.round(balance * 100) / 100,
        ),
      );
    }

    return entries;
  }
}
