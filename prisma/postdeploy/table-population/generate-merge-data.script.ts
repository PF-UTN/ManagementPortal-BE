import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const mergeTableData = async (
  tableName: string,
  values: Array<Record<string, string | number | Date | null>>,
  uniqueColumns: string[] = ['id'],
): Promise<void> => {
  if (values.length === 0) throw new Error('Values array cannot be empty');

  const columns = Object.keys(values[0]);

  const valuesList = values
    .map(
      (row) =>
        '(' +
        columns
          .map((col) =>
            typeof row[col] === 'string' ? `'${row[col]}'` : row[col],
          )
          .join(', ') +
        ')',
    )
    .join(',\n  ');

  const quotedColumns = columns.map((col) => `"${col}"`).join(', ');
  const uniqueKey = uniqueColumns.map((col) => `"${col}"`).join(', ');
  const returningColumns = uniqueColumns.map((col) => `"${col}"`).join(', ');
  const updateColumns = columns.filter((col) => !uniqueColumns.includes(col));
  const updateClause = updateColumns
    .map((col) => `"${col}" = EXCLUDED."${col}"`)
    .join(', ');

  const query = `WITH inserted AS (
      INSERT INTO "${tableName}" (${quotedColumns})
      VALUES
        ${valuesList}
      ON CONFLICT (${uniqueKey})
      ${updateClause ? `DO UPDATE SET ${updateClause}` : 'DO NOTHING'}
      RETURNING ${returningColumns}
    )
    DELETE FROM "${tableName}" WHERE (${uniqueKey}) NOT IN (SELECT ${returningColumns} FROM inserted);`;

  await prisma.$executeRawUnsafe(query);
};
