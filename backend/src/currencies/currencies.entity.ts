import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Currencies {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  acronym: string;

  @Column()
  prefix: string;

  @Column({ default: true })
  is_enabled: boolean;
}
