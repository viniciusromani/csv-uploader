import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../product/product.entity';
import { DataSource, SelectQueryBuilder } from 'typeorm';

const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(),
  findAndCount: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
};
export function getMockRepository<T>(entity: new () => T) {
  return {
    provide: getRepositoryToken(entity),
    useValue: mockRepository,
  };
}

const mockDataSource = {
  transaction: jest.fn((callback) => callback({ getRepository: () => mockRepository })), // Simula transação
};
export function getMockDataSource<T>(entity: new () => T) {
  return {
    provide: DataSource,
    useValue: mockDataSource,
  };
}
