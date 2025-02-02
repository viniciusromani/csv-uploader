import { Controller, Get, Post, Query, Res, UploadedFile, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { ProductService } from './product.service';
import { GetProductsQueryDTO, OrderFieldEnum, OrderSortEnum } from './dto/get-products-query.dto';
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
  @ApiQuery({ name: 'filter[name]', required: false, type: String, description: 'You can provide any string, it will match using LIKE operator' })
  @ApiQuery({ name: 'filter[price]', required: false, type: Number, description: 'Use numbers like: 115.55' })
  @ApiQuery({ name: 'filter[expiration][from]', required: false, type: String, description: 'Format: YYYY-mm-dd' })
  @ApiQuery({ name: 'filter[expiration][to]', required: false, type: String, description: 'Format: YYYY-mm-dd' })
  @ApiQuery({ name: 'order[field]', required: false, type: String, enum: OrderFieldEnum })
  @ApiQuery({ name: 'order[sort]', required: false, type: String, enum: OrderSortEnum })
  @UsePipes(new ParseGetProductsQueryParamsPipe(), new ValidationPipe({ transform: true }))
  async findAll(
    @Query() query: GetProductsQueryDTO,
  ): Promise<GetProductsResponseDTO[]> {
    return this.productService.findAll(query);
  }
}
