import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { Repository } from 'typeorm';
import { Currency } from './currency.entity';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { GetPricesDTO } from './dto/get-prices.dto';

@Injectable()
export class CurrencyService {
  constructor(
    @InjectRepository(Currency)
    private currencyRepository: Repository<Currency>,

    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,

    private readonly httpService: HttpService,
  ) {}

  async getCurrencies(): Promise<GetPricesDTO[]> {
    try {
      // get from cache if it exists
      const now = new Date();
      const key = now.toJSON().slice(0, 10);
      const cached = await this.cacheManager.get(key);
      if (cached != null) {
        return cached as GetPricesDTO[];
      }

      // get from db/resource
      const currencies = await this.currencyRepository.find({
        where: { is_enabled: true },
      });
      const { data } = await this.httpService.axiosRef.get(
        '/v1/currencies/usd.json',
      );
      const prices = data['usd'];

      const dtos = currencies.map((currency) => {
        const price = prices[currency.acronym];
        return { id: currency.id, price };
      });

      // save on cache for next use
      const endOfDay = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          23,
          59,
          59,
          999,
        ),
      );
      const ttl = endOfDay.getTime() - now.getTime();
      await this.cacheManager.set(key, dtos, ttl);
      return dtos;
    } catch (err) {
      return [];
    }
  }
}
