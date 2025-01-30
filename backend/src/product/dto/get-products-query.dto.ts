import { IsIn, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Although I am not using annotation to validate, I left it here
 * for further updates that should make it work
 */
class ExpirationDTO {
  @IsString()
  from: string;

  @IsString()
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

class OrderDTO {
  @IsOptional()
  @IsString()
  @IsIn(['name', 'price'])
  field?: string;

  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
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
