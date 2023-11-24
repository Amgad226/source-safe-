export class BaseEntity {
    static collectData<T>(
      EntityClass: new (item: any) => T,
      items: any | any[],
    ): T | T[] {
      if (Array.isArray(items)) {
        return items.map((item) => new EntityClass(item)) as T[];
      } else {
        return new EntityClass(items) as T;
      }
    }
  }
  