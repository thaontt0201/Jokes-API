import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Categories } from "./Categories";

@Entity()
export class Jokes extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @CreateDateColumn()
  created!: Date;

  @UpdateDateColumn()
  modified!: Date;

  @Column({ default: 0 })
  likes!: number;

  @Column({ default: 0 })
  dislikes!: number;

  @Column()
  content!: string;

  @ManyToOne(() => Categories, (categories) => categories.jokes)
  category: Categories;

  @Column()
  categoryId!: number;
}
