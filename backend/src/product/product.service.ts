import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDTO } from './dto/create-product.dto';
import { GetPricesDTO } from '../currency/dto/get-prices.dto';
import { ProductPrice } from '../product-price/product-price.entity';
import { CreateProductPriceDTO } from '../product-price/dto/create-product-price.dto';
import { GetProductsQueryDTO } from './dto/get-products-query.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { GetProductPricesDTO, GetProductsResponseDTO } from './dto/get-products-response.dto';

@Injectable()
export class ProductService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  private extractNameAndCode(text: string): [string, string | undefined] {
    const parts = text.split('#');

    if (parts.length === 1) {
      return [text.trim(), undefined];
    }

    const name = parts[0].trim();
    const code = parts[1].trim().match(/\d+/)?.[0] ?? undefined;

    return [name, code];
  }
  private extractPrice(price: string): number {
    if (price.length == 0) return 0;

    const match = price.replace('$', '').trim();
    const numeric = parseFloat(match);

    if (Number.isNaN(numeric)) {
      return 0;
    }

    return numeric;
  }
  private extractExpirationDate(date: string): string | undefined {
    if (date.length == 0) return undefined;

    const parts = date.split('/');
    if (parts.length !== 3) return undefined;

    const [month, day, year] = parts.map(Number);
    if (month < 1 || month > 12 || day < 1 || day > 31) return undefined;

    const _date = new Date(year, month - 1, day);
    const isValid = _date.getFullYear() === year && _date.getMonth() + 1 === month && _date.getDate() === day;

    return isValid ? date : undefined;
  }

  async insertMany(productList: CreateProductDTO[], pricesList: GetPricesDTO[]): Promise<Product[]> {
    const products = productList.map((product) => {
      const [name, code] = this.extractNameAndCode(product.name);
      const price = this.extractPrice(product.price);
      const expiration = this.extractExpirationDate(product.expiration);
      return { name, code, raw_price: price, expiration };
    });

    return await this.dataSource.transaction(async (manager) => {
      const productRepository = manager.getRepository(Product);
      const priceRepository = manager.getRepository(ProductPrice);

      const createdProducts = productRepository.create(products);
      const savedProducts = await productRepository.save(createdProducts);

      let prices: CreateProductPriceDTO[] = [];
      savedProducts.forEach((product) => {
        prices.push(
          ...pricesList.map((price) => {
            return {
              currency_id: price.currency_id,
              product_id: product.id,
              value: price.value * product.raw_price,
            };
          }),
        );
      });

      const createdPrices = priceRepository.create(prices);
      const savedPrices = await priceRepository.save(createdPrices);

      return savedProducts;
    });
  }

  async findAll(query: GetProductsQueryDTO): Promise<GetProductsResponseDTO[]> {
    const queryBuilder = this.productRepository.createQueryBuilder('products');
    queryBuilder
      .innerJoinAndSelect('products.prices', 'product_prices')
      .innerJoinAndSelect('product_prices.currency', 'currency');

    if (query.filter) {
      if (query.filter.name) {
        const name = query.filter.name;
        queryBuilder.andWhere('products.name LIKE :name', { name: `%${name}%` });
      }
      if (query.filter.price) {
        const price = query.filter.price;
        queryBuilder.andWhere('products.raw_price >= :price', { price });
      }
      if (query.filter.expiration) {
        const from = query.filter.expiration.from;
        const to = query.filter.expiration.to;
        queryBuilder.andWhere('products.expiration BETWEEN :from AND :to', { from, to });
      }
    }
    if (query.order) {
      const field = query.order.field;
      const sort = query.order.sort;
      if (field) {
        switch (field) {
          case 'name':
            queryBuilder.orderBy('products.name', sort);
            break;
          case 'price':
            queryBuilder.orderBy('products.raw_price', sort);
            break;
          case 'expiration':
            queryBuilder.orderBy('products.expiration', sort);
            queryBuilder.andWhere('products.expiration IS NOT NULL');
            break;
        }
      }
    }

    const products = await queryBuilder.getMany();

    return products.map((product) => {
      const prices: GetProductPricesDTO[] = [];
      product.prices.forEach((price) => {
        const acronym = price.currency.acronym;
        prices.push({
          acronym,
          value: price.value,
          prefix: price.currency.prefix,
        });
      });

      return { ...product, prices };
    });
  }
}
