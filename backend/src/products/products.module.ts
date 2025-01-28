import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Products } from './products.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { CurrencyModule } from 'src/currencies/currencies.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Products]),
    CurrencyModule
  ],
  providers: [ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {}
