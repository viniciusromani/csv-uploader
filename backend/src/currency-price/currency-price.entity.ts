import { Currency } from '../currency/currency.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('currency_prices')
export class CurrencyPrice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  currency_id: number;

  @ManyToOne(() => Currency, (currency) => currency.prices)
  @JoinColumn({ name: 'currency_id' })
  currency: Currency;

  @Column({ type: 'decimal', precision: 20, scale: 10 })
  value: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
