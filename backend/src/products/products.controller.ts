import {
  Controller,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Readable } from 'node:stream';
import { Response } from 'express';
import { parseStream } from '@fast-csv/parse';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('/csv-import')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Res() response: Response,
  ) {
    console.log(file);

    const totalSize = file.size;
    let processedSize = 0;

    const stream = Readable.from(file.buffer);
    parseStream(stream, { headers: true, delimiter: ';', objectMode: true })
      .on('error', (error) => {
        console.error('[ERROR]', error);
      })
      .on('data', async (row) => {
        // progress
        const line = Object.values(row).join(';');
        const lineSize = Buffer.byteLength(line, 'utf-8');
        processedSize = processedSize + lineSize;
        const progress = Math.round((processedSize / totalSize) * 100);
        response.write(`${progress}\n`);

        // saving on db
      })
      .on('end', async (rowCount: number) => {
        console.log(`Parsed ${rowCount} rows`);
        response.write(`${100}\n`);
        response.end();
      });
  }
}
