import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDTO } from './dto/create-product.dto';
import { Products } from './products.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Products)
    private productsRepository: Repository<Products>,
  ) {}

  async createMany(
    createList: CreateProductDTO[],
  ): Promise<CreateProductDTO[]> {
    console.log('im here');
    return [];
  }
}
