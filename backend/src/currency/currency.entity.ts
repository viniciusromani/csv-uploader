import { ProductPrice } from 'src/product-price/product-price.entity';
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
  @OneToMany(() => ProductPrice, (price) => price.product)
  prices: ProductPrice[];
}
