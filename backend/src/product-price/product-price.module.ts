import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductPrice } from './product-price.entity';
import { CreateProductPriceDTO } from './dto/create-product-price.dto';

@Module({
  imports: [TypeOrmModule.forFeature([ProductPrice])],
  providers: [CreateProductPriceDTO],
  exports: [CreateProductPriceDTO],
})
export class ProductPriceModule {}
