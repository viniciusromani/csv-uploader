import { Min } from 'class-validator';
import { Currency } from '../currency/currency.entity';
import { Product } from '../product/product.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  Index,
} from 'typeorm';

@Entity('product_prices')
@Unique(['product_id', 'currency_id', 'created_at'])
export class ProductPrice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  currency_id: number;

  @ManyToOne(() => Currency, (currency) => currency.prices)
  @JoinColumn({ name: 'currency_id' })
  @Index()
  currency: Currency;

  @Column()
  product_id: number;

  @ManyToOne(() => Product, (product) => product.prices)
  @JoinColumn({ name: 'product_id' })
  @Index()
  product: Product;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  @Min(0)
  value: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
