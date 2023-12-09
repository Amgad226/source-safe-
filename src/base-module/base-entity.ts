export class BaseEntity {}
export function collectDataBy(EntityClass: any, items: any[]): any[] {
  if(items==null )return [];
  return items.map((item) => new EntityClass(item));
}
