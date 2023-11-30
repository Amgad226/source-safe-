import { log } from 'console';

export async function truncate(prisma) {
  const tablenames: Array<{ tablename: string }> = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables: string = tablenames
    .map(({ tablename }) => tablename)
    .filter((name: string) => name !== '_prisma_migrations')
    .map(function (name: string) {
      log('truncate table[ ' + name + ' ]');
      return name;
    })
    .map((name: string) => `"public"."${name}"`)
    .join(', ');

  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  } catch (error) {
    console.log({ error });
  }
}
