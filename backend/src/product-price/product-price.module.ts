import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductPrice } from './product-price.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductPrice])],
  providers: [],
  exports: [],
})
export class ProductPriceModule {}
