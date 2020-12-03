import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Jokes } from "./Jokes";

@Entity()
export class Categories extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column()
  name!: string;

  @OneToMany(() => Jokes, (jokes) => jokes.category)
  jokes!: Jokes[];
}
