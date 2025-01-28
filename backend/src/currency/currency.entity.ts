import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

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
}
