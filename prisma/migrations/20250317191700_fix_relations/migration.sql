/*
  Warnings:

  - You are about to drop the column `registrationRequestId` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "registrationRequestId",
ALTER COLUMN "documentNumber" SET DATA TYPE VARCHAR(11);
