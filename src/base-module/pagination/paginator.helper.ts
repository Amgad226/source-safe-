import { default_page, default_items_per_page } from 'src/constant';
import {
  PaginatorInputProps,
  PaginatorOutputProps,
} from './paginator.interfaces';
// TODO edit function to accept multi relation names and inner relation

export async function PaginatorHelper<T>({
  model,
  items_per_page = default_items_per_page,
  page = default_page,
  relations,
  search,
}: PaginatorInputProps<T>): Promise<PaginatorOutputProps> {
  items_per_page = +items_per_page;
  page = +page;
  if (page > 0) page--;
  const skip = page * items_per_page;

  let where = {};
  let restProps = {};
  if (typeof relations === 'object') {
    if ('where' in relations) {
      where = relations.where;
      delete relations.where;
    }
    const relationProps = Object.keys(relations);
    const hasOtherProps = relationProps.some((prop) => prop !== 'where');
    if (hasOtherProps) {
      const { ...props } = relations;
      restProps = props;
    }
  }
  const modelKeys = await model.findFirst().then((data) => {
    if (data)
      return Object.keys(data).filter(
        (key) => typeof data[key] === 'string' && key !== 'gender',
      );
    else return [];
  });
  const searchObject = search
    ? {
        OR: modelKeys.map((key: string) => {
          return {
            [key]: {
              contains: search,
            },
          };
        }),
      }
    : {};
  const whereConditionAndSearch = search
    ? {
        AND: [{ ...searchObject }, { ...where }],
      }
    : where;

  const data = await model.findMany({
    take: items_per_page,
    skip,
    where: whereConditionAndSearch,
    ...restProps,
  });


  const totalItems = await model.count({
    where,
  });

  const totalPages = Math.ceil(totalItems / items_per_page);
  return {
    data,
    pagination: {
      totalItems,
      totalPages,
      page: ++page,
      items_per_page,
    },
  };
}
