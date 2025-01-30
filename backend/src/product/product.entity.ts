import { ProductPrice } from 'src/product-price/product-price.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal', { precision: 20, scale: 10 })
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
