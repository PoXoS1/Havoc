import { Entity, PrimaryKey, Property, AnyEntity } from 'mikro-orm';
import BaseEntity from './BaseEntity';

@Entity()
export default class User extends BaseEntity implements AnyEntity {
  @PrimaryKey()
  id: string;

  @Property()
  dick?: number;

  @Property()
  gay?: number;

  constructor(id: string, { dick, gay }: { dick?: number; gay?: number } = {}) {
    super();
    this.id = id;
    this.dick = dick;
    this.gay = gay;
  }
}
