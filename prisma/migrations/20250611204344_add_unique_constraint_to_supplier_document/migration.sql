/*
  Warnings:

  - A unique constraint covering the columns `[documentType,documentNumber]` on the table `Supplier` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Supplier_documentType_documentNumber_key" ON "Supplier"("documentType", "documentNumber");
