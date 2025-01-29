import { Controller, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Readable } from 'node:stream';
import { Response } from 'express';
import { parseStream } from '@fast-csv/parse';
import { ProductService } from './product.service';
import { CurrencyService } from 'src/currency/currency.service';

@Controller('products')
export class ProductController {
  constructor(
    private readonly productsService: ProductService,
    private readonly currencyService: CurrencyService,
  ) {}

  @Post('/csv-import')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Res() response: Response) {
    const totalSize = file.size;
    let processedSize = 0;
    let rowCounter = 1; // starting at 1 because of headers
    let invalidLines: number[] = [];

    const currencies = await this.currencyService.getCurrencies();
    console.log(currencies);

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
      .on('data', async (row) => {
        rowCounter++;

        // progress
        const line = Object.values(row).join(';');
        const lineSize = Buffer.byteLength(line, 'utf-8');
        processedSize = processedSize + lineSize;
        const progress = Math.round((processedSize / totalSize) * 100);
        response.write(`${progress}\n`);

        // saving on db
      })
      .on('data-invalid', (row) => {
        rowCounter++;
        invalidLines.push(rowCounter);
        console.warn('invalid row', row);
      })
      .on('end', async (rowCount: number) => {
        console.log(`Parsed ${rowCount} rows`);

        // writing progress; totalcount; invalidlines
        response.write('100\n');
        response.write(`total:${rowCount}\n`);
        response.write(`invalid:${JSON.stringify(invalidLines)}\n`);
        response.end();
      });
  }
}
