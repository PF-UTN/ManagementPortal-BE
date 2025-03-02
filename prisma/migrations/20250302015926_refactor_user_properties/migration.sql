/*
  Warnings:

  - You are about to drop the column `city` on the `RegistrationRequest` table. All the data in the column will be lost.
  - You are about to drop the column `documentTypeAndNumber` on the `RegistrationRequest` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `RegistrationRequest` table. All the data in the column will be lost.
  - You are about to drop the column `fullNameOrBusinessName` on the `RegistrationRequest` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `RegistrationRequest` table. All the data in the column will be lost.
  - You are about to drop the column `province` on the `RegistrationRequest` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `RegistrationRequestStatus` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `RegistrationRequest` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `RegistrationRequestStatus` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `note` to the `RegistrationRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `RegistrationRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `RegistrationRequestStatus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `documentNumber` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `documentType` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "RegistrationRequest_email_key";

-- DropIndex
DROP INDEX "RegistrationRequestStatus_status_key";

-- AlterTable
ALTER TABLE "RegistrationRequest" DROP COLUMN "city",
DROP COLUMN "documentTypeAndNumber",
DROP COLUMN "email",
DROP COLUMN "fullNameOrBusinessName",
DROP COLUMN "phone",
DROP COLUMN "province",
ADD COLUMN     "note" VARCHAR(50) NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "RegistrationRequestStatus" DROP COLUMN "status",
ADD COLUMN     "code" VARCHAR(8) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "documentNumber" VARCHAR(10) NOT NULL,
ADD COLUMN     "documentType" VARCHAR(4) NOT NULL,
ADD COLUMN     "registrationRequestId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "RegistrationRequest_userId_key" ON "RegistrationRequest"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RegistrationRequestStatus_code_key" ON "RegistrationRequestStatus"("code");

-- AddForeignKey
ALTER TABLE "RegistrationRequest" ADD CONSTRAINT "RegistrationRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
