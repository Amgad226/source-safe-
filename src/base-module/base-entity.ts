export class BaseEntity {}
export function collectDataBy(EntityClass: any, items: any[]): any[] {
  return items.map((item) => new EntityClass(item));
}
