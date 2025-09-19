/*
  Warnings:

  - You are about to alter the column `description` on the `PaymentType` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `VarChar(30)`.

*/
-- AlterTable
ALTER TABLE "PaymentType" ALTER COLUMN "description" SET DATA TYPE VARCHAR(30);
