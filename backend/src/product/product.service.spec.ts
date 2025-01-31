import { TestingModule, Test } from '@nestjs/testing';
import { ProductService } from './product.service';
import { DataSource, Repository } from 'typeorm';
import { Product } from './product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getMockDataSource, getMockRepository } from '../utils/test-utils';

describe('ProductService', () => {
  let productService: ProductService;
  let productRepository: Repository<Product>;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductService, getMockDataSource(Product), getMockRepository(Product)],
    }).compile();

    productService = module.get<ProductService>(ProductService);
    productRepository = module.get(getRepositoryToken(Product));
    dataSource = module.get(DataSource);
  });

  it('should be defined', () => {
    expect(productService).toBeDefined();
    expect(productRepository).toBeDefined();
    expect(dataSource).toBeDefined();
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
  });
});
