import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { CreateClientDto } from '../../../application/dtos/create-client.dto';
import { CreateClientCommand } from '../../../application/commands/create-client.command';
import { GetClientQuery } from '../../../application/queries/get-client.query';
import { ListClientsQuery } from '../../../application/queries/list-clients.query';
import { GetLoansByClientIdQuery } from '../../../../loans/application/queries/get-loans-by-client-id.query';
import { Client } from '../../../domain/entities/client';
import { Loan } from '../../../../loans/domain/entities/loan';
import { ClientMapper } from '../../persistence/mappers/client.mapper';
import { LoanMapper } from '../../../../loans/infrastructure/persistence/mappers/loan.mapper';

@ApiTags('clients')
@Controller('clients')
export class ClientsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo cliente' })
  @ApiResponse({ status: 201, description: 'Cliente creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 409, description: 'CC o email ya registrado' })
  async create(@Body() dto: CreateClientDto) {
    const client: Client = await this.commandBus.execute(
      new CreateClientCommand(
        dto.nationalIdentification,
        dto.firstName,
        dto.lastName,
        new Date(dto.dateOfBirth),
        dto.email,
        dto.phoneNumber,
        dto.monthlyIncome,
        dto.employmentType,
        dto.monthlyExpenses,
        dto.numberOfDependents,
        dto.currentAddress,
        dto.company,
      ),
    );

    return ClientMapper.toDTO(client);
  }

  @Get()
  @ApiOperation({ summary: 'Listar clientes con paginación y búsqueda' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Buscar por nombre, apellido, CC o email',
  })
  @ApiResponse({ status: 200, description: 'Lista de clientes paginada' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    const { clients, total }: { clients: Client[]; total: number } =
      await this.queryBus.execute(new ListClientsQuery(page, limit, search));

    return {
      data: clients.map(ClientMapper.toDTO),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un cliente' })
  @ApiParam({ name: 'id', description: 'UUID del cliente' })
  @ApiResponse({ status: 200, description: 'Detalle del cliente' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  async findOne(@Param('id') id: string) {
    const client: Client = await this.queryBus.execute(new GetClientQuery(id));

    return ClientMapper.toDTO(client);
  }

  @Get(':id/loans')
  @ApiOperation({ summary: 'Obtener simulaciones de crédito de un cliente' })
  @ApiParam({ name: 'id', description: 'UUID del cliente' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 100 })
  @ApiResponse({
    status: 200,
    description: 'Lista de simulaciones del cliente',
  })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  async findLoans(
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
  ) {
    // Verify client exists first
    await this.queryBus.execute(new GetClientQuery(id));

    const { loans, total }: { loans: Loan[]; total: number } =
      await this.queryBus.execute(new GetLoansByClientIdQuery(id, page, limit));

    return loans.map(LoanMapper.toDTO);
  }
}
