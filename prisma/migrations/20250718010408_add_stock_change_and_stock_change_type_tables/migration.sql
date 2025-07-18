-- CreateTable
CREATE TABLE "StockChangeType" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),

    CONSTRAINT "StockChangeType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockChange" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "changeTypeId" INTEGER NOT NULL,
    "changedField" VARCHAR(50) NOT NULL,
    "previousValue" INTEGER NOT NULL,
    "newValue" INTEGER NOT NULL,
    "reason" VARCHAR(255),
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockChange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StockChangeType_name_key" ON "StockChangeType"("name");

-- AddForeignKey
ALTER TABLE "StockChange" ADD CONSTRAINT "StockChange_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockChange" ADD CONSTRAINT "StockChange_changeTypeId_fkey" FOREIGN KEY ("changeTypeId") REFERENCES "StockChangeType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
