import { TestingModule, Test } from '@nestjs/testing';
import { ProductService } from './product.service';
import { DataSource, Repository } from 'typeorm';
import { Product } from './product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getMockDataSource, getMockRepository } from '../utils/test-utils';
import { ProductPrice } from '../product-price/product-price.entity';
import { CreateProductDTO } from './dto/create-product.dto';
import { GetPricesDTO } from '../currency/dto/get-prices.dto';

describe('ProductService', () => {
  let productService: ProductService;
  let productRepository: Repository<Product>;
  let priceRepository: Repository<ProductPrice>;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        getMockDataSource(Product),
        getMockRepository(Product),
        getMockRepository(ProductPrice),
      ],
    }).compile();

    productService = module.get<ProductService>(ProductService);
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

      const productServiceMock = new ProductService(dataSourceMock as any, productRepository);
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
  });

  describe('findAll', () => {
    it('should return a list of products', async () => {
      const db = [
        {
          id: 1,
          name: 'Calypso - Lemonade',
          code: '4026987913289674',
          expiration: '1/11/2023',
          created_at: new Date(),
          updated_at: new Date(),
          prices: [
            {
              currency: { acronym: 'usd' },
              value: 115.55,
            },
          ],
        },
        {
          id: 10,
          name: 'Venison - Ground',
          code: '5610875542054651',
          expiration: '3/5/2023',
          created_at: new Date(),
          updated_at: new Date(),
          prices: [
            {
              currency: { acronym: 'usd' },
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
          created_at: new Date(),
          updated_at: new Date(),
          prices: { usd: 115.55 },
        },
        {
          id: 10,
          name: 'Venison - Ground',
          code: '5610875542054651',
          expiration: '3/5/2023',
          created_at: new Date(),
          updated_at: new Date(),
          prices: { usd: 4.91 },
        },
      ];
      const result = await productService.findAll({});
      expect(result).toEqual(expected);
    });

    it('should throw', async () => {
      const errorMessage = 'Database query failed';

      const mockQueryBuilder = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockRejectedValue(new Error(errorMessage)),
      };

      jest.spyOn(productRepository, 'createQueryBuilder').mockImplementation(() => mockQueryBuilder as any);
      await expect(productService.findAll({})).rejects.toThrow(errorMessage);
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
