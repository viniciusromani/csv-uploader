import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDTO } from './dto/create-product.dto';
import { GetPricesDTO } from 'src/currency/dto/get-prices.dto';
import { ProductPrice } from 'src/product-price/product-price.entity';
import { CreateProductPriceDTO } from 'src/product-price/dto/create-product-price.dto';

@Injectable()
export class ProductService {
  constructor(private readonly dataSource: DataSource) {}

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

    if (isNaN(numeric)) {
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
}
