import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateCurrencyPriceDTO {
  @ApiProperty({ description: 'Currency ID' })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  currency_id: number;

  @ApiProperty({ description: 'Currency price value' })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  value: number;
}
