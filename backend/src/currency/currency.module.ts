import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { HttpModule } from '@nestjs/axios';
import { Currency } from './currency.entity';
import { CurrencyService } from './currency.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Currency]),
    CacheModule.register(),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.get<string>('PRICES_API_URL'),
      }),
    }),
  ],
  providers: [CurrencyService],
  exports: [CurrencyService],
})
export class CurrencyModule {}
