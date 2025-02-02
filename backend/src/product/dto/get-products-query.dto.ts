import { IsEnum, IsNumber, IsOptional, IsString, Matches, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Although I am not using annotation to validate, I left it here
 * for further updates that should make it work
 */
class ExpirationDTO {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in YYYY-MM-DD format',
  })
  from: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in YYYY-MM-DD format',
  })
  to: string;
}

class FilterDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @Type(() => ExpirationDTO)
  @ValidateNested()
  expiration?: ExpirationDTO;
}

export enum OrderFieldEnum {
  name = 'name',
  price = 'price',
  expiration = 'expiration',
}
export enum OrderSortEnum {
  asc = 'ASC',
  desc = 'DESC',
}
class OrderDTO {
  @IsOptional()
  @IsEnum(OrderFieldEnum)
  field?: string;

  @IsOptional()
  @IsEnum(OrderSortEnum)
  sort?: 'ASC' | 'DESC' = 'ASC';
}

export class GetProductsQueryDTO {
  @Type(() => FilterDTO)
  @ValidateNested()
  filter?: FilterDTO;

  @Type(() => OrderDTO)
  @ValidateNested()
  order?: OrderDTO;
}
