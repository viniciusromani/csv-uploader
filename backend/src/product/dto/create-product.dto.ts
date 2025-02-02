import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateProductDTO {
  @ApiProperty({ description: 'Product name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Product price' })
  @IsNotEmpty()
  @IsString()
  price: string;

  @ApiProperty({ description: 'The expiration date of the product', example: '2025-12-31' })
  @IsNotEmpty()
  @IsDateString()
  expiration: string;
}
