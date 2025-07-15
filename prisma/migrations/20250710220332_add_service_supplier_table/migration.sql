-- CreateTable
CREATE TABLE "ServiceSupplier" (
    "id" SERIAL NOT NULL,
    "businessName" VARCHAR(255) NOT NULL,
    "documentType" VARCHAR(4) NOT NULL,
    "documentNumber" VARCHAR(11) NOT NULL,
    "email" VARCHAR(250) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "addressId" INTEGER NOT NULL,

    CONSTRAINT "ServiceSupplier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceSupplier_email_key" ON "ServiceSupplier"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceSupplier_addressId_key" ON "ServiceSupplier"("addressId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceSupplier_documentType_documentNumber_key" ON "ServiceSupplier"("documentType", "documentNumber");

-- AddForeignKey
ALTER TABLE "ServiceSupplier" ADD CONSTRAINT "ServiceSupplier_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
