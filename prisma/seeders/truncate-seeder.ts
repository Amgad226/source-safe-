import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function getAllTableNames(): Promise<string[]> {
  const result: { table_name: string }[] =
    await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`;
  return result.map((row) => row.table_name);
}
export async function truncate() {
  try {
    const tableNames = await getAllTableNames();
    console.log(tableNames);

    for (const tableName of tableNames) {
      if (tableName == '_prisma_migrations') {
        continue;
      }
      await prisma.$executeRaw`TRUNCATE TABLE ${tableNames} RESTART IDENTITY;`;
    }

    console.log('All tables truncated successfully.');
  } catch (error) {
    console.error('Error truncating tables:', error);
  }
}
