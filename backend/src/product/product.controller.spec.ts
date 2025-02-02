import { TestingModule, Test } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CurrencyService } from '../currency/currency.service';
import { GetProductsQueryDTO } from './dto/get-products-query.dto';
import { GetProductsResponseDTO } from './dto/get-products-response.dto';

describe('ProductController', () => {
  let productController: ProductController;
  let productService: ProductService;
  let currencyService: CurrencyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: {
            findAll: jest.fn(),
            insertMany: jest.fn(),
          },
        },
        {
          provide: CurrencyService,
          useValue: {
            getCurrencies: jest.fn(),
          },
        },
      ],
    }).compile();

    productController = module.get<ProductController>(ProductController);
    productService = module.get<ProductService>(ProductService);
    currencyService = module.get<CurrencyService>(CurrencyService);
  });

  it('should be defined', () => {
    expect(productController).toBeDefined();
    expect(productService).toBeDefined();
    expect(currencyService).toBeDefined();
  });

  describe('findAll', () => {
    it('should call productService.findAll and return a list of products', async () => {
      const query: GetProductsQueryDTO = {};
      const result: GetProductsResponseDTO[] = [
        {
          id: 1,
          name: 'Calypso - Lemonade',
          code: '4026987913289674',
          expiration: '1/11/2023',
          created_at: new Date(),
          updated_at: new Date(),
          raw_price: 115.55,
          prices: [{ acronym: 'usd', value: 115.55, prefix: '$' }],
        },
      ];

      jest.spyOn(productService, 'findAll').mockResolvedValue(result);

      const response = await productController.findAll(query);

      expect(productService.findAll).toHaveBeenCalledWith(query);
      expect(productService.findAll).toHaveBeenCalled();
      expect(response).toEqual(result);
    });

    it('should call productService.findAll and throw', async () => {
      jest.spyOn(productService, 'findAll').mockRejectedValue(new Error('Database error'));

      const query = {};
      await expect(productController.findAll(query)).rejects.toThrow('Database error');
    });
  });
});
