import { ProductPrice } from '../product-price/product-price.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity('currencies')
export class Currency {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  acronym: string;

  @Column()
  prefix: string;

  @Column({ default: true })
  is_enabled: boolean;

  // relationships
  @OneToMany(() => ProductPrice, (price) => price.currency)
  prices: ProductPrice[];
}
