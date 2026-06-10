import {
  IsString,
  IsEmail,
  IsNumber,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  IsDateString,
  Length,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmploymentType } from '../../domain/entities/client';

export class CreateClientDto {
  @ApiProperty({ example: '1234567890', minLength: 5, maxLength: 20 })
  @IsString()
  @Length(5, 20)
  nationalIdentification: string;

  @ApiProperty({ example: 'Juan' })
  @IsString()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ example: '1990-05-15', description: 'ISO 8601 date (YYYY-MM-DD)' })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ example: 'juan.perez@email.com' })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: '3001234567' })
  @IsString()
  @MaxLength(20)
  phoneNumber: string;

  @ApiProperty({ example: 5000000, description: 'Ingreso mensual en COP' })
  @IsNumber()
  @Min(0)
  monthlyIncome: number;

  @ApiPropertyOptional({ example: 1500000, description: 'Gastos mensuales en COP' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyExpenses?: number;

  @ApiPropertyOptional({ example: 2, description: 'Número de dependientes' })
  @IsOptional()
  @IsInt()
  @Min(0)
  numberOfDependents?: number;

  @ApiPropertyOptional({ example: 'Calle 123 # 45-67, Bogotá' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  currentAddress?: string;

  @ApiProperty({ enum: EmploymentType, example: EmploymentType.DEPENDENT })
  @IsEnum(EmploymentType)
  employmentType: EmploymentType;

  @ApiPropertyOptional({ example: 'Alpha Ingenuity S.A.S' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  company?: string;
}
