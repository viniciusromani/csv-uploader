import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDate, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class GetProductPricesDTO {
  @ApiProperty({ example: 'usd' })
  @IsString()
  acronym: string;

  @ApiProperty({ example: 99.99 })
  @IsNumber()
  value: number;

  @ApiProperty({ example: '$' })
  @IsString()
  prefix: string;
}

export class GetProductsResponseDTO {
  @ApiProperty({ example: 1 })
  @IsNumber()
  id: number;

  @ApiProperty({ example: 'Calypso - Lemonade' })
  @IsString()
  name: string;

  @ApiProperty({ example: 99.99 })
  @IsNumber()
  raw_price: number;

  @ApiProperty({ required: false, example: '4026987913289674' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ required: false, example: '2024-12-31' })
  @IsString()
  @IsOptional()
  expiration?: string;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  created_at: Date;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  updated_at: Date;

  @ApiProperty({ type: [GetProductPricesDTO] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GetProductPricesDTO)
  prices: GetProductPricesDTO[];
}
