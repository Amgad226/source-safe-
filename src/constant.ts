const default_items_per_page: number = process.env.items_per_page
  ? +process.env.items_per_page
  : 10;

const default_page: number = process.env.page ? +process.env.page : 1;

export { default_items_per_page, default_page };
