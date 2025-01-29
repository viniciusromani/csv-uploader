import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrencyPrice } from './currency-price.entity';
import { CreateCurrencyPriceDTO } from './dto/create-currency-price.dto';

@Module({
  imports: [TypeOrmModule.forFeature([CurrencyPrice])],
  providers: [CreateCurrencyPriceDTO],
  exports: [CreateCurrencyPriceDTO]
})
export class CurrencyPriceModule {}