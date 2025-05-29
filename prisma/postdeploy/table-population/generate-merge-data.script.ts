import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const mergeTableData = async (
  tableName: string,
  values: Array<Record<string, string | number | Date | null>>,
  uniqueColumns: string[] = ['id'],
): Promise<void> => {
  if (values.length === 0) throw new Error('Values array cannot be empty');

  const columns = Object.keys(values[0]);
  const quotedColumns = columns.map((col) => `"${col}"`).join(', ');
  const uniqueKey = uniqueColumns.map((col) => `"${col}"`).join(', ');
  const returningColumns = uniqueColumns.map((col) => `"${col}"`).join(', ');

  const updateColumns = columns.filter((col) => !uniqueColumns.includes(col));
  const updateClause =
    updateColumns.length > 0
      ? updateColumns.map((col) => `"${col}" = EXCLUDED."${col}"`).join(', ')
      : uniqueColumns.map((col) => `"${col}" = EXCLUDED."${col}"`).join(', ');

  const valuesList = values
    .map(
      (row) =>
        '(' +
        columns
          .map((col) => {
            const value = row[col];
            if (typeof value === 'string') {
              return `'${value.replace(/'/g, "''")}'`;
            }
            if (value instanceof Date) {
              return `'${value.toISOString()}'`;
            }
            return value;
          })
          .join(', ') +
        ')',
    )
    .join(',\n  ');

  const query = `WITH inserted AS (
      INSERT INTO "${tableName}" (${quotedColumns})
      VALUES
        ${valuesList}
      ON CONFLICT (${uniqueKey})
      DO UPDATE SET ${updateClause}
      RETURNING ${returningColumns}
    )
    DELETE FROM "${tableName}" WHERE (${uniqueKey}) NOT IN (SELECT ${returningColumns} FROM inserted);`;

  await prisma.$executeRawUnsafe(query);
};
