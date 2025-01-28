import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { HttpModule } from '@nestjs/axios'
import { Currencies } from './currencies.entity';
import { CurrencyService } from './currencies.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Currencies]), 
    CacheModule.register(),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.get<string>('PRICES_API_URL')
      }),
    })
  ],
  providers: [CurrencyService],
  exports: [CurrencyService]
})
export class CurrencyModule {}