-- AlterTable
ALTER TABLE "User" ADD COLUMN     "birthdate" DATE;

-- Update
UPDATE "User" SET "birthdate" = '1990-01-01' WHERE "birthdate" IS NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "birthdate" SET NOT NULL;
