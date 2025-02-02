import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrencyPrice } from './currency-price.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CurrencyPrice])],
  providers: [],
  exports: [],
})
export class CurrencyPriceModule {}
