import { BadRequestException } from '@nestjs/common';
import { ParseGetProductsQueryParamsPipe } from './parse-qp-get-products';

describe('ParseGetProductsQueryParamsPipe', () => {
  let pipe: ParseGetProductsQueryParamsPipe;

  beforeEach(() => {
    pipe = new ParseGetProductsQueryParamsPipe();
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('should transform filter and order parameters', () => {
    const params = {
      'filter[name]': 'Mushroom - Chanterelle Frozen',
      'filter[price]': '127.06',
      'filter[expiration][from]': '2023-01-11',
      'filter[expiration][to]': '2024-02-16',
      'order[field]': 'price',
      'order[sort]': 'DESC',
    };

    // ignoring type since we need to test conversion
    const transformed = pipe.transform(params as any, { type: 'query' });

    expect(transformed).toEqual({
      filter: {
        name: 'Mushroom - Chanterelle Frozen',
        price: 127.06,
        expiration: { from: '2023-01-11', to: '2024-02-16' },
      },
      order: { field: 'price', sort: 'DESC' },
    });
  });

  it('should return undefined for filter and order if empty', () => {
    const params = {};
    const transformed = pipe.transform(params, { type: 'query' });

    expect(transformed).toEqual({ filter: undefined, order: undefined });
  });

  it('should throw for invalid price', () => {
    const params = { 'filter[price]': 'invalid' };

    expect(() => pipe.transform(params as any, { type: 'query' })).toThrow(BadRequestException);
    expect(() => pipe.transform(params as any, { type: 'query' })).toThrow('Invalid price value. Must be a number.');
  });

  it('should set default order.sort to ASC if only order.field is provided', () => {
    const params = { 'order[field]': 'price' };
    const transformed = pipe.transform(params as any, { type: 'query' });

    expect(transformed.order).toEqual({ field: 'price', sort: 'ASC' });
  });

  it('should not set default order.sort it has been provided', () => {
    const params = { 'order[field]': 'price', 'order[sort]': 'DESC' };
    const transformed = pipe.transform(params as any, { type: 'query' });

    expect(transformed.order).toEqual({ field: 'price', sort: 'DESC' });
  });
});
