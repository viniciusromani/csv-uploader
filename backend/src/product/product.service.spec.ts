import { TestingModule, Test } from '@nestjs/testing';
import { ProductService } from './product.service';
import { DataSource, Repository } from 'typeorm';
import { Product } from './product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getMockDataSource, getMockRepository } from '../utils/test-utils';
import { ProductPrice } from '../product-price/product-price.entity';
import { CreateProductDTO } from './dto/create-product.dto';
import { GetPricesDTO } from '../currency/dto/get-prices.dto';
import { CurrencyService } from '../currency/currency.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpService } from '@nestjs/axios';

describe('ProductService', () => {
  let productService: ProductService;
  let currencyService: CurrencyService;
  let productRepository: Repository<Product>;
  let priceRepository: Repository<ProductPrice>;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        CurrencyService,
        getMockDataSource(Product),
        getMockRepository(Product),
        getMockRepository(ProductPrice),
        { provide: CACHE_MANAGER, useValue: {} },
        {
          provide: HttpService,
          useValue: { get: jest.fn() },
        },
      ],
    }).compile();

    productService = module.get<ProductService>(ProductService);
    currencyService = module.get<CurrencyService>(CurrencyService);
    productRepository = module.get(getRepositoryToken(Product));
    priceRepository = module.get(getRepositoryToken(ProductPrice));
    dataSource = module.get(DataSource);
  });

  it('should be defined', () => {
    expect(productService).toBeDefined();
    expect(productRepository).toBeDefined();
    expect(dataSource).toBeDefined();
  });

  describe('insertMany', () => {
    it('should insert many products and prices', async () => {
      const productList: CreateProductDTO[] = [
        {
          name: 'Calypso - Lemonade #(4026987913289674)',
          price: '$115.55',
          expiration: '1/11/2023',
        },
        {
          name: 'Cheese - Romano, Grated #()',
          price: '$5.10',
          expiration: '12/6/2022',
        },
      ];
      const pricesList: GetPricesDTO[] = [
        { currency_id: 1, value: 5.85 },
        { currency_id: 2, value: 2.37 },
      ];
      const mockSavedProducts = [
        { id: 1, name: 'Calypso - Lemonade', code: '4026987913289674', raw_price: 115.55, expiration: '1/11/2023' },
        { id: 2, name: 'Cheese - Romano, Grated', code: undefined, raw_price: 5.1, expiration: '12/6/2022' },
      ];

      const priceRepositoryMock = {
        save: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockReturnValue([]),
      };
      const dataSourceMock = {
        transaction: jest.fn().mockImplementation(async (callback) => {
          return await callback({
            getRepository: (entity) => {
              if (entity === Product) return productRepositoryMock;
              if (entity === ProductPrice) return priceRepositoryMock;
            },
          });
        }),
      };
      const productRepositoryMock = {
        save: jest.fn().mockResolvedValue(mockSavedProducts),
        create: jest.fn().mockReturnValue(mockSavedProducts),
      };

      const productServiceMock = new ProductService(dataSourceMock as any, productRepository, currencyService);
      const result = await productServiceMock.insertMany(productList, pricesList);

      expect(dataSourceMock.transaction).toHaveBeenCalledTimes(1);

      expect(productRepositoryMock.create).toHaveBeenCalledWith([
        { name: 'Calypso - Lemonade', code: '4026987913289674', raw_price: 115.55, expiration: '1/11/2023' },
        { name: 'Cheese - Romano, Grated', code: undefined, raw_price: 5.1, expiration: '12/6/2022' },
      ]);
      expect(productRepositoryMock.save).toHaveBeenCalledWith(mockSavedProducts);

      expect(priceRepositoryMock.create).toHaveBeenCalledTimes(1);
      expect(priceRepositoryMock.save).toHaveBeenCalledTimes(1);
    });
    describe('extractNameAndCode', () => {
      it('should extract name and code correctly', () => {
        const mock = 'Venison - Striploin #(5602222458020873)';
        const expected = ['Venison - Striploin', '5602222458020873'];
        expect(productService.extractNameAndCode(mock)).toEqual(expected);
      });
      it('should only extract name because code was not provided', () => {
        const mock = 'Venison - Striploin';
        const expected = ['Venison - Striploin', undefined];
        expect(productService.extractNameAndCode(mock)).toEqual(expected);
      });
      it('should only extract name because code is not numeric', () => {
        const mock = 'Venison - Striploin #(😍)';
        const expected = ['Venison - Striploin', undefined];
        expect(productService.extractNameAndCode(mock)).toEqual(expected);
      });
      it('should ignore trailing and leading whitespaces', () => {
        const mock = '       Venison - Striploin            #(5602222458020873)  ';
        const expected = ['Venison - Striploin', '5602222458020873'];
        expect(productService.extractNameAndCode(mock)).toEqual(expected);
      });
    });
  });

  describe('findAll', () => {
    it('should return a list of products', async () => {
      const db = [
        {
          id: 1,
          name: 'Calypso - Lemonade',
          code: '4026987913289674',
          expiration: '1/11/2023',
          created_at: '2025-01-31T10:08:09.141Z',
          updated_at: '2025-01-31T10:08:09.141Z',
          prices: [
            {
              currency: { acronym: 'usd', prefix: '$' },
              value: 115.55,
            },
          ],
        },
        {
          id: 10,
          name: 'Venison - Ground',
          code: '5610875542054651',
          expiration: '3/5/2023',
          created_at: '2025-01-31T10:08:09.141Z',
          updated_at: '2025-01-31T10:08:09.141Z',
          prices: [
            {
              currency: { acronym: 'usd', prefix: '$' },
              value: 4.91,
            },
          ],
        },
      ];

      jest.spyOn(productRepository, 'createQueryBuilder').mockImplementation(() => {
        return {
          innerJoinAndSelect: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          getMany: jest.fn().mockResolvedValue(db),
        } as any;
      });

      const expected = [
        {
          id: 1,
          name: 'Calypso - Lemonade',
          code: '4026987913289674',
          expiration: '1/11/2023',
          created_at: '2025-01-31T10:08:09.141Z',
          updated_at: '2025-01-31T10:08:09.141Z',
          prices: [
            {
              acronym: 'usd',
              value: 115.55,
              prefix: '$',
            },
          ],
        },
        {
          id: 10,
          name: 'Venison - Ground',
          code: '5610875542054651',
          expiration: '3/5/2023',
          created_at: '2025-01-31T10:08:09.141Z',
          updated_at: '2025-01-31T10:08:09.141Z',
          prices: [
            {
              acronym: 'usd',
              value: 4.91,
              prefix: '$',
            },
          ],
        },
      ];
      const result = await productService.findAll({});
      expect(result).toEqual(expected);
    });

    it.each([
      ['Database connection error', new Error('Connection refused')],
      ['Query syntax error', new Error('Invalid SQL syntax')],
      ['Constraint violation', new Error('Foreign key constraint failed')],
    ])('should handle %s', async (_, error) => {
      const mockQueryBuilder = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockRejectedValue(error),
      };

      jest.spyOn(productRepository, 'createQueryBuilder').mockImplementation(() => mockQueryBuilder as any);
      await expect(productService.findAll({})).rejects.toThrow(error.message);
    });

    describe('queryBuilder', () => {
      let mockQueryBuilder = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      beforeEach(() => {
        jest.spyOn(productRepository, 'createQueryBuilder').mockImplementation(() => mockQueryBuilder as any);
      });

      it('filter[name]', async () => {
        const name = 'alyp';
        const query = { filter: { name }, order: {} };
        await productService.findAll(query);

        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('products.name LIKE :name', { name: `%${name}%` });
      });
      it('filter[price]', async () => {
        const price = 115.55;
        const query = { filter: { price }, order: {} };
        await productService.findAll(query);

        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('products.raw_price >= :price', { price });
      });
      it('filter[expiration]', async () => {
        const from = '2023-01-11';
        const to = '2024-02-16';
        const query = { filter: { expiration: { from, to } }, order: {} };
        await productService.findAll(query);

        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('products.expiration BETWEEN :from AND :to', {
          from,
          to,
        });
      });
      it('order[name][asc]', async () => {
        const query = { filter: {}, order: { field: 'name', sort: 'ASC' as 'ASC' } };
        await productService.findAll(query);

        expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('products.name', 'ASC');
      });
      it('order[name][desc]', async () => {
        const query = { filter: {}, order: { field: 'name', sort: 'DESC' as 'DESC' } };
        await productService.findAll(query);

        expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('products.name', 'DESC');
      });
      it('order[price][asc]', async () => {
        const query = { filter: {}, order: { field: 'price', sort: 'ASC' as 'ASC' } };
        await productService.findAll(query);

        expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('products.raw_price', 'ASC');
      });
      it('order[price][desc]', async () => {
        const query = { filter: {}, order: { field: 'price', sort: 'DESC' as 'DESC' } };
        await productService.findAll(query);

        expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('products.raw_price', 'DESC');
      });
      it('order[expiration][asc]', async () => {
        const query = { filter: {}, order: { field: 'expiration', sort: 'ASC' as 'ASC' } };
        await productService.findAll(query);

        expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('products.expiration', 'ASC');
        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('products.expiration IS NOT NULL');
      });
      it('order[price][desc]', async () => {
        const query = { filter: {}, order: { field: 'price', sort: 'DESC' as 'DESC' } };
        await productService.findAll(query);

        expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('products.raw_price', 'DESC');
      });
    });
  });
});
