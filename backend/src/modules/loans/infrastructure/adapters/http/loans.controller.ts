import { Controller, Get, Post, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { GetLoanByIdQuery } from '../../../application/queries/get-loan-by-id.query';
import { ExplainLoanQuery } from '../../../application/queries/explain-loan.query';
import { SimulateLoanCommand } from '../../../application/commands/simulate-loan.command';
import { SimulateLoanDto } from '../../../application/dtos/simulate-loan.dto';
import { GetClientByNationalIdQuery } from '../../../../../modules/clients/application/queries/get-client-by-national-id.query';
import { LoanWithEntries } from '../../../application/queries/handlers/get-loan-by-id.handler';
import { SimulateLoanResult } from '../../../application/commands/handlers/simulate-loan.handler';
import { LoanMapper } from '../../persistence/mappers/loan.mapper';
import { Loan, LoanProps } from '../../../domain/entities/loan';
import { AmortizationEntry, AmortizationEntryProps } from '../../../domain/entities/amortization-entry';
import { Client } from '../../../../../modules/clients/domain/entities/client';

@ApiTags('loans')
@Controller('loans')
export class LoansController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Post('simulate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Simular crédito hipotecario' })
  @ApiResponse({ status: 201, description: 'Simulación creada con tabla de amortización' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o reglas de negocio no cumplidas' })
  @ApiResponse({ status: 404, description: 'Cliente con esa cédula no encontrado' })
  async simulate(@Body() dto: SimulateLoanDto) {
    const client: Client = await this.queryBus.execute(
      new GetClientByNationalIdQuery(dto.nationalIdentification),
    );

    const { loan, amortizationEntries }: SimulateLoanResult =
      await this.commandBus.execute(
        new SimulateLoanCommand(
          client.id,
          client.monthlyIncome,
          dto.propertyValue,
          dto.downPayment,
          dto.termInYears,
          dto.annualInterestRate,
        ),
      );

    return this.toLoanDetailDto(loan, amortizationEntries);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de simulación con tabla de amortización' })
  @ApiParam({ name: 'id', description: 'UUID de la simulación' })
  @ApiResponse({ status: 200, description: 'Detalle de la simulación con tabla de amortización' })
  @ApiResponse({ status: 404, description: 'Simulación no encontrada' })
  async findOne(@Param('id') id: string) {
    const { loan, amortizationEntries }: LoanWithEntries =
      await this.queryBus.execute(new GetLoanByIdQuery(id));

    return this.toLoanDetailDto(loan, amortizationEntries);
  }

  @Post(':id/explain')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Explicación en lenguaje natural de la simulación para el cliente' })
  @ApiParam({ name: 'id', description: 'UUID de la simulación' })
  @ApiResponse({ status: 200, description: 'Explicación generada por IA en español' })
  @ApiResponse({ status: 404, description: 'Simulación no encontrada' })
  async explain(@Param('id') id: string): Promise<{ explanation: string }> {
    return this.queryBus.execute(new ExplainLoanQuery(id));
  }

  private toLoanDetailDto(loan: Loan, amortizationEntries: AmortizationEntry[]) {
    const loanDto = LoanMapper.toDTO(loan);
    const props = loan.toObject() as LoanProps;

    return {
      ...loanDto,
      totalPayment: Math.round((props.loanAmount + props.totalInterest) * 100) / 100,
      amortizationSchedule: amortizationEntries.map((entry) => {
        const e = entry.toObject() as AmortizationEntryProps;
        return {
          month: e.monthNumber,
          payment: Number(e.payment),
          principal: Number(e.principal),
          interest: Number(e.interest),
          balance: Number(e.balance),
        };
      }),
    };
  }
}
