/*
  Warnings:

  - You are about to drop the column `taxCategory` on the `Client` table. All the data in the column will be lost.
  - Added the required column `taxCategoryId` to the `Client` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Client" DROP COLUMN "taxCategory",
ADD COLUMN     "taxCategoryId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "TaxCategory" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),

    CONSTRAINT "TaxCategory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_taxCategoryId_fkey" FOREIGN KEY ("taxCategoryId") REFERENCES "TaxCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
