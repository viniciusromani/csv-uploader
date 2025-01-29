import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { CurrencyModule } from 'src/currency/currency.module';
import { ProductPriceModule } from 'src/product-price/product-price.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), CurrencyModule, ProductPriceModule],
  providers: [ProductService],
  controllers: [ProductController],
})
export class ProductModule {}
