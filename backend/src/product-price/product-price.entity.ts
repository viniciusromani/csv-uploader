import { Currency } from 'src/currency/currency.entity';
import { Product } from 'src/product/product.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('product_prices')
export class ProductPrice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  currency_id: number;

  @ManyToOne(() => Currency, (currency) => currency.prices)
  @JoinColumn({ name: 'currency_id' })
  currency: Currency;

  @Column()
  product_id: number;

  @ManyToOne(() => Product, (product) => product.prices)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'decimal', precision: 20, scale: 10 })
  value: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
