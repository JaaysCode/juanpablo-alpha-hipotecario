import { IsString, IsNumber, IsPositive, IsNotEmpty, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SimulateLoanDto {
  @ApiProperty({ description: 'Cédula del cliente', example: '1234567890' })
  @IsString()
  @IsNotEmpty()
  nationalIdentification: string;

  @ApiProperty({ description: 'Valor del inmueble en COP', example: 300000000 })
  @IsNumber()
  @IsPositive()
  propertyValue: number;

  @ApiProperty({ description: 'Cuota inicial en COP', example: 60000000 })
  @IsNumber()
  @Min(0)
  downPayment: number;

  @ApiProperty({ description: 'Plazo en años', example: 20, minimum: 1, maximum: 30 })
  @IsNumber()
  @Min(1)
  @Max(30)
  termInYears: number;

  @ApiProperty({ description: 'Tasa de interés anual efectiva (0.12 = 12% EA)', example: 0.12 })
  @IsNumber()
  @Min(0.001)
  @Max(1)
  annualInterestRate: number;
}
