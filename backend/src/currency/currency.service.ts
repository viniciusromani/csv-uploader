import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { DataSource, Repository } from 'typeorm';
import { Currency } from './currency.entity';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { GetPricesDTO } from './dto/get-prices.dto';
import { CurrencyPrice } from '../currency-price/currency-price.entity';

@Injectable()
export class CurrencyService {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,

    private readonly dataSource: DataSource,

    private readonly httpService: HttpService,
  ) {}

  async getCurrencies(): Promise<GetPricesDTO[]> {
    try {
      // get from cache if it exists
      const now = new Date();
      const key = now.toJSON().slice(0, 10);
      const cached = await this.cacheManager.get(key);
      if (cached != null) {
        console.log('return cache');
        return cached as GetPricesDTO[];
      }

      // fetching current currency prices
      const { data } = await this.httpService.axiosRef.get('/v1/currencies/usd.json');
      const prices = data['usd'];

      return await this.dataSource.transaction(async (manager) => {
        // get from db
        const currencyRepository = manager.getRepository(Currency);
        const currencyPricesRepository = manager.getRepository(CurrencyPrice);

        const currencies = await currencyRepository.find({ where: { is_enabled: true } });
        const dtos = currencies.map((currency) => {
          const price = prices[currency.acronym];
          return { currency_id: currency.id, value: price };
        });

        // save prices
        const createdPrices = currencyPricesRepository.create(dtos);
        const savedPrices = await currencyPricesRepository.save(createdPrices);

        // save on cache for next use
        const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
        const ttl = endOfDay.getTime() - now.getTime();
        await this.cacheManager.set(key, dtos, ttl);

        return dtos;
      });
    } catch (err) {
      console.log('on error', err);
      return [];
    }
  }
}
