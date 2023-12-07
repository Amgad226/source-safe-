import { collectDataBy } from '../base-entity';
import {
  PaginationMetaData,
  PaginatorOutputProps,
} from './paginator.interfaces';

export class PaginatorEntity {
  public data: any;
  public pagination: PaginationMetaData;
  constructor(
    public entityClass: any,
    { data, pagination }: PaginatorOutputProps,
  ) {
    this.data = collectDataBy(entityClass, data);
    this.pagination = pagination;
  }
}
