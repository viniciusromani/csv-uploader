import { ProductPrice } from '../product-price/product-price.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
  
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  raw_price: number;

  @Column({ nullable: true })
  code: string;

  @Column({ type: 'date', nullable: true })
  expiration: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // relationships
  @OneToMany(() => ProductPrice, (price) => price.product)
  prices: ProductPrice[];
}
