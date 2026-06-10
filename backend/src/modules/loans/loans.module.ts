import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { LoanDbEntity } from './infrastructure/persistence/entities/loan.db.entity';
import { AmortizationEntryDbEntity } from './infrastructure/persistence/entities/amortization-entry.db.entity';
import { TypeOrmLoanRepository } from './infrastructure/adapters/persistence/typeorm-loan.repository';
import { TypeOrmAmortizationEntryRepository } from './infrastructure/adapters/persistence/typeorm-amortization-entry.repository';
import { OllamaLoanExplainer } from './infrastructure/adapters/ai/ollama-loan-explainer';
import { LoansController } from './infrastructure/adapters/http/loans.controller';
import { GetLoanByIdHandler } from './application/queries/handlers/get-loan-by-id.handler';
import { GetLoansByClientIdHandler } from './application/queries/handlers/get-loans-by-client-id.handler';
import { ExplainLoanHandler } from './application/queries/handlers/explain-loan.handler';
import { SimulateLoanHandler } from './application/commands/handlers/simulate-loan.handler';
import { LOAN_REPOSITORY, AMORTIZATION_ENTRY_REPOSITORY, LOAN_EXPLAINER } from './application/tokens';

const commandHandlers = [SimulateLoanHandler];
const queryHandlers = [GetLoanByIdHandler, GetLoansByClientIdHandler, ExplainLoanHandler];

@Module({
  imports: [
    CqrsModule,
    ConfigModule,
    TypeOrmModule.forFeature([LoanDbEntity, AmortizationEntryDbEntity]),
  ],
  controllers: [LoansController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    {
      provide: LOAN_REPOSITORY,
      useClass: TypeOrmLoanRepository,
    },
    {
      provide: AMORTIZATION_ENTRY_REPOSITORY,
      useClass: TypeOrmAmortizationEntryRepository,
    },
    {
      provide: LOAN_EXPLAINER,
      useClass: OllamaLoanExplainer,
    },
  ],
  exports: [CqrsModule],
})
export class LoansModule {}
