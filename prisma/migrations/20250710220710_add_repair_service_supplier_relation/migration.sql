/*
  Warnings:

  - Added the required column `serviceSupplierId` to the `Repair` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Repair" ADD COLUMN     "serviceSupplierId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Repair" ADD CONSTRAINT "Repair_serviceSupplierId_fkey" FOREIGN KEY ("serviceSupplierId") REFERENCES "ServiceSupplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
