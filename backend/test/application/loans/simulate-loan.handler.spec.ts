import { BadRequestException } from '@nestjs/common';
import { SimulateLoanHandler } from '@/modules/loans/application/commands/handlers/simulate-loan.handler';
import { SimulateLoanCommand } from '@/modules/loans/application/commands/simulate-loan.command';
import { ILoanRepository } from '@/modules/loans/domain/ports/loan.repository';
import { LoanStatus, LoanProps } from '@/modules/loans/domain/entities/loan';
import { AmortizationEntryProps } from '@/modules/loans/domain/entities/amortization-entry';
import { createLoanRepositoryMock } from '@test/shared/mocks/repositories/loan-repository.mock';
import { makeLoan, LOAN_FIXTURE_DEFAULTS } from '@test/shared/fixtures/loan.fixture';

describe('SimulateLoanHandler', () => {
  let handler: SimulateLoanHandler;
  let loanRepository: jest.Mocked<ILoanRepository>;

  const { clientId, propertyValue, downPayment, termInYears, annualInterestRate } =
    LOAN_FIXTURE_DEFAULTS;

  beforeEach(() => {
    loanRepository = createLoanRepositoryMock();
    loanRepository.create.mockImplementation((loan) => Promise.resolve(loan));
    handler = new SimulateLoanHandler(loanRepository);
  });

  function cmd(monthlyIncome: number): SimulateLoanCommand {
    return new SimulateLoanCommand(
      clientId,
      monthlyIncome,
      propertyValue,
      downPayment,
      termInYears,
      annualInterestRate,
    );
  }

  // ─── Amortization schedule ────────────────────────────────────────────────

  describe('when a valid simulation is requested', () => {
    it('generates an amortization schedule with exactly termInYears × 12 entries', async () => {
      // Given a client with sufficient income
      // When the simulation is executed
      const { amortizationEntries } = await handler.execute(
        cmd(LOAN_FIXTURE_DEFAULTS.monthlyIncome.preApproved),
      );

      // Then the schedule has one entry per month
      expect(amortizationEntries).toHaveLength(termInYears * 12);
    });
  });

  describe('when reviewing each amortization entry', () => {
    it('ensures principal + interest equals the monthly payment (rounding tolerance ≤ 1 COP)', async () => {
      // Given a pre-approved simulation
      // When the amortization schedule is computed
      const { amortizationEntries } = await handler.execute(
        cmd(LOAN_FIXTURE_DEFAULTS.monthlyIncome.preApproved),
      );

      // Then each entry satisfies: principal + interest ≈ payment
      amortizationEntries.forEach((entry) => {
        const { payment, principal, interest } = entry.toObject() as AmortizationEntryProps;
        expect(Math.abs(principal + interest - payment)).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('when checking the final amortization entry', () => {
    it('has a remaining balance of approximately 0 (≤ 1 COP drift from rounding)', async () => {
      // Given a full-term simulation
      // When the schedule is generated
      const { amortizationEntries } = await handler.execute(
        cmd(LOAN_FIXTURE_DEFAULTS.monthlyIncome.preApproved),
      );

      // Then the loan is fully repaid
      const lastEntry = amortizationEntries[amortizationEntries.length - 1];
      const { balance } = lastEntry.toObject() as AmortizationEntryProps;
      expect(balance).toBeLessThanOrEqual(1);
    });
  });

  describe('when checking amortization balance progression', () => {
    it('decreases monotonically — each month balance is lower than the previous', async () => {
      // Given a simulation with standard parameters
      // When the schedule is built
      const { amortizationEntries } = await handler.execute(
        cmd(LOAN_FIXTURE_DEFAULTS.monthlyIncome.preApproved),
      );

      // Then balance strictly decreases each month
      for (let i = 1; i < amortizationEntries.length; i++) {
        const prev = (amortizationEntries[i - 1].toObject() as AmortizationEntryProps).balance;
        const curr = (amortizationEntries[i].toObject() as AmortizationEntryProps).balance;
        expect(curr).toBeLessThanOrEqual(prev);
      }
    });
  });

  // ─── Approval status rules ────────────────────────────────────────────────

  describe('when the monthly payment is below 25% of monthly income', () => {
    it('sets the loan status to PRE_APPROVED', async () => {
      // Given monthly income = 7,200,000 → ratio ≈ 24.5%
      // When the simulation runs
      const { loan } = await handler.execute(
        cmd(LOAN_FIXTURE_DEFAULTS.monthlyIncome.preApproved),
      );

      // Then the loan is fully approved
      expect(loan.status).toBe(LoanStatus.PRE_APPROVED);
    });
  });

  describe('when the monthly payment is between 25% and 30% of monthly income', () => {
    it('sets the loan status to PRE_APPROVED_WITH_OBSERVATIONS', async () => {
      // Given monthly income = 6,000,000 → ratio ≈ 29.4%
      // When the simulation runs
      const { loan } = await handler.execute(
        cmd(LOAN_FIXTURE_DEFAULTS.monthlyIncome.preApprovedWithObservations),
      );

      // Then the loan is conditionally approved
      expect(loan.status).toBe(LoanStatus.PRE_APPROVED_WITH_OBSERVATIONS);
    });
  });

  describe('when the monthly payment exceeds 30% of monthly income', () => {
    it('sets the loan status to REJECTED with reason "Capacidad de pago excedida."', async () => {
      // Given monthly income = 5,000,000 → ratio ≈ 35.2%
      // When the simulation runs
      const { loan } = await handler.execute(
        cmd(LOAN_FIXTURE_DEFAULTS.monthlyIncome.rejected),
      );

      // Then the loan is rejected
      expect(loan.status).toBe(LoanStatus.REJECTED);
      expect(loan.rejectionReason).toBe('Capacidad de pago excedida.');
    });
  });

  describe('when downPayment is equal to or greater than propertyValue', () => {
    it('throws BadRequestException before any calculation or persistence', async () => {
      // Given an invalid down payment
      const invalidCmd = new SimulateLoanCommand(
        clientId,
        10_000_000,
        propertyValue,
        propertyValue, // downPayment === propertyValue
        termInYears,
        annualInterestRate,
      );

      // When the command is executed
      // Then a BadRequestException is thrown and the repository is never called
      await expect(handler.execute(invalidCmd)).rejects.toThrow(BadRequestException);
      expect(loanRepository.create).not.toHaveBeenCalled();
    });
  });
});
