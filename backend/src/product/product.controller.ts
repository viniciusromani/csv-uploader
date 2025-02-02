import { Controller, Get, Post, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ProductService } from './product.service';
import { GetProductsQueryDTO } from './dto/get-products-query.dto';
import { ParseGetProductsQueryParamsPipe } from '../utils/parse-qp-get-products';
import { GetProductsResponseDTO } from './dto/get-products-response.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('/csv-import')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Res() response: Response) {
    await this.productService.processCsv(file, response);
  }

  @Get()
  async findAll(
    @Query(new ParseGetProductsQueryParamsPipe()) query: GetProductsQueryDTO,
  ): Promise<GetProductsResponseDTO[]> {
    return this.productService.findAll(query);
  }
}
