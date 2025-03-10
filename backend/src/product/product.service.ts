import { Inject, Injectable, Logger } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDTO } from './dto/create-product.dto';
import { GetPricesDTO } from '../currency/dto/get-prices.dto';
import { ProductPrice } from '../product-price/product-price.entity';
import { CreateProductPriceDTO } from '../product-price/dto/create-product-price.dto';
import { GetProductsQueryDTO } from './dto/get-products-query.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { GetProductPricesDTO, GetProductsResponseDTO } from './dto/get-products-response.dto';
import { parseStream } from '@fast-csv/parse';
import { CurrencyService } from '../currency/currency.service';
import { Response } from 'express';
import { Readable } from 'node:stream';

@Injectable()
export class ProductService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    @Inject()
    private readonly currencyService: CurrencyService,
  ) {}

  private readonly logger = new Logger(ProductService.name);

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

  extractNameAndCode(text: string): [string, string | undefined] {
    const parts = text.split('#');

    if (parts.length === 1) {
      return [text.trim(), undefined];
    }

    const name = parts[0].trim();
    const code = parts[1].trim().match(/\d+/)?.[0] ?? undefined;

    return [name, code];
  }
  extractPrice(price: string): number {
    if (price.length == 0) return 0;

    const match = price.replace('$', '').trim();
    const numeric = parseFloat(match);

    if (Number.isNaN(numeric)) {
      return 0;
    }

    return numeric;
  }
  extractExpirationDate(date: string): string | undefined {
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

  async processCsv(file: Express.Multer.File, response: Response) {
    // track progress variables
    const totalSize = file.size;
    let processedSize = 0;
    // insert control variables
    const buffer: CreateProductDTO[] = [];
    const BUFFER_LIMIT = 500;
    const insertPromises: Promise<Product[] | void>[] = [];
    // invalid lines variables
    let rowCounter = 1;
    const invalidLines: number[] = [];

    const currencies = await this.currencyService.getCurrencies();
    const stream = this.getStream(file.buffer);

    parseStream(stream, { headers: true, delimiter: ';', objectMode: true })
      .validate((data) => {
        if (!data.name || data.name.length == 0) return false;
        if (!data.price || data.price.length == 0) return false;
        return true;
      })
      .on('error', (error) => {
        this.logger.error('[ERROR]', error);
      })
      .on('data', (row) => {
        rowCounter++;

        // progress
        const line = Object.values(row).join(';');
        const lineSize = Buffer.byteLength(line, 'utf-8');
        processedSize = processedSize + lineSize;
        const progress = Math.round((processedSize / totalSize) * 100);
        response.write(`${progress}\n`);

        // saving on db
        buffer.push(row);
        if (buffer.length >= BUFFER_LIMIT) {
          insertPromises.push(
            this.insertMany(buffer.splice(0, BUFFER_LIMIT), currencies).catch((error) =>
              this.writeResponseError(response, error),
            ),
          );
        }
      })
      .on('data-invalid', (row) => {
        rowCounter++;
        invalidLines.push(rowCounter);
        this.logger.error('[INVALID ROW]', row);
      })
      .on('end', async (rowCount: number) => {
        insertPromises.push(
          this.insertMany(buffer, currencies).catch((error) => this.writeResponseError(response, error)),
        );

        try {
          await Promise.all(insertPromises);
        } catch (error) {
          this.logger.error('[ERROR] Inserting promises', error);
          this.writeResponseError(response, error);
          response.end();
          return;
        }
        buffer.length = 0;

        response.write('100\n');
        response.write(`total:${rowCount}\n`);
        response.write(`invalid:${JSON.stringify(invalidLines)}\n`);
        response.end();
      });
  }

  private writeResponseError(response: Response, error: any) {
    response.write(
      `error:${JSON.stringify({
        message: 'Error inserting records on database',
        error,
      })}`,
    );
  }

  private getStream(buffer: Buffer): Readable {
    const CHUNK_SIZE = 16384;
    let offset = 0;
    return new Readable({
      read(size) {
        const chunkSize = Math.min(CHUNK_SIZE, buffer.length - offset);
        if (chunkSize <= 0) {
          this.push(null);
          return;
        }

        const chunk = buffer.subarray(offset, offset + chunkSize);
        offset += chunkSize;

        this.push(chunk);
      },
    });
  }
}
