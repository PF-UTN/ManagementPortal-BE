import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const mergeTableData = async (tableName: string, values: Array<Record<string, any>>): Promise<void> => {
  if (values.length === 0) throw new Error("Values array cannot be empty");

  const columns = Object.keys(values[0]);
  const idColumn = "id"; // Assuming 'id' is the primary key
  
  const valuesList = values
    .map(row => `(${columns.map(col => typeof row[col] === 'string' ? `'${row[col]}'` : row[col]).join(", ")})`)
    .join(",\n  ");

  const updateClause = columns
    .filter(col => col !== idColumn) // Exclude ID from update
    .map(col => `${col} = EXCLUDED.${col}`)
    .join(", ");

  const query =  
    `WITH inserted AS (
      INSERT INTO "${tableName}" (${columns.join(", ")})
      VALUES
        ${valuesList}
      ON CONFLICT (${idColumn})
      DO UPDATE SET ${updateClause}
      RETURNING ${idColumn}
    )
    DELETE FROM "${tableName}" WHERE ${idColumn} NOT IN (SELECT ${idColumn} FROM inserted);`;

  console.log(query);

  await prisma.$executeRawUnsafe(query);
}