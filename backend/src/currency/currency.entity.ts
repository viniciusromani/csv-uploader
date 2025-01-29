import { CurrencyPrice } from 'src/currency-price/currency-price.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity('currencies')
export class Currency {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  acronym: string;

  @Column()
  prefix: string;

  @Column({ default: true })
  is_enabled: boolean;

  // relationships
  @OneToMany(() => CurrencyPrice, (currencyPrice) => currencyPrice.currency)
  currency_prices: CurrencyPrice[];
}
