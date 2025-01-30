import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { GetProductsQueryDTO } from 'src/product/dto/get-products-query.dto';

/**
 * This was created because I could not parse nested objects
 * from a query parameter using class-validator/class-transformer
 * TODO: Make both libs parse query-param and use ValidationPipe
 */
@Injectable()
export class ParseGetProductsQueryParamsPipe implements PipeTransform {
  transform(value: GetProductsQueryDTO, metadata: ArgumentMetadata) {
    value.filter = {};
    value.order = {};

    if (value['filter[name]']) {
      value.filter.name = value['filter[name]'];
      delete value['filter[name]'];
    }
    if (value['filter[price]']) {
      const price = parseFloat(value['filter[price]']);
      if (isNaN(price)) {
        throw new BadRequestException('Invalid price value. Must be a number.');
      }
      value.filter.price = parseFloat(value['filter[price]']);
      delete value['filter[price]'];
    }
    if (value['filter[expiration][from]'] && value['filter[expiration][from]']) {
      const from = value['filter[expiration][from]'];
      const to = value['filter[expiration][to]'];
      value.filter.expiration = { from, to };
      delete value['filter[expiration]'];
    }
    if (value['order[field]']) {
      value.order.field = value['order[field]'];
      value.order.sort = 'ASC';
      delete value['order[field]'];
    }
    if (value['order[sort]']) {
      value.order.sort = value['order[sort]'];
      delete value['order[sort]'];
    }
    if (Object.keys(value.filter).length == 0) {
      value.filter = undefined;
    }
    if (Object.keys(value.order).length == 0) {
      value.order = undefined;
    }
    return value;
  }
}
