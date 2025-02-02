import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateProductPriceDTO {
  @ApiProperty({ description: 'Currency ID' })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  // @Exists('Currency', 'id')
  currency_id: number;

  @ApiProperty({ description: 'Product ID' })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  // @Exists('Product', 'id')
  product_id: number;

  @ApiProperty({ description: 'Products converted price' })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  value: number;
}
