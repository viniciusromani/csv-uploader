import { Controller, Get, Post, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Readable } from 'node:stream';
import { Response } from 'express';
import { parseStream } from '@fast-csv/parse';
import { ProductService } from './product.service';
import { CurrencyService } from '../currency/currency.service';
import { CreateProductDTO } from './dto/create-product.dto';
import { Product } from './product.entity';
import { GetProductsQueryDTO } from './dto/get-products-query.dto';
import { ParseGetProductsQueryParamsPipe } from '../utils/parse-qp-get-products';
import { GetProductsResponseDTO } from './dto/get-products-response.dto';

@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly currencyService: CurrencyService,
  ) {}

  @Post('/csv-import')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Res() response: Response) {
    // track progress variables
    const totalSize = file.size;
    let processedSize = 0;
    // insert control variables
    let lastProgress = 0;
    const buffer: CreateProductDTO[] = [];
    const insertPromises: Promise<Product[] | void>[] = [];
    // invalid lines variables
    let rowCounter = 1;
    const invalidLines: number[] = [];

    const currencies = await this.currencyService.getCurrencies();

    const stream = Readable.from(file.buffer);
    parseStream(stream, { headers: true, delimiter: ';', objectMode: true })
      .validate((data) => {
        if (!data.name || data.name.length == 0) return false;
        if (!data.price || data.price.length == 0) return false;
        return true;
      })
      .on('error', (error) => {
        console.error('[ERROR]', error);
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
        if (progress >= lastProgress + 20) {
          lastProgress = progress;

          if (buffer.length > 0) {
            insertPromises.push(
              this.productService
                .insertMany(buffer, currencies)
                .catch((error) => this.writeResponseError(response, error)),
            );
            buffer.length = 0;
          }
        }
      })
      .on('data-invalid', (row) => {
        rowCounter++;
        invalidLines.push(rowCounter);
        console.warn('invalid row', row);
      })
      .on('end', async (rowCount: number) => {
        insertPromises.push(
          this.productService.insertMany(buffer, currencies).catch((error) => this.writeResponseError(response, error)),
        );

        try {
          await Promise.all(insertPromises);
        } catch (error) {
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

  @Get()
  async findAll(
    @Query(new ParseGetProductsQueryParamsPipe()) query: GetProductsQueryDTO,
  ): Promise<GetProductsResponseDTO[]> {
    return this.productService.findAll(query);
  }
}
