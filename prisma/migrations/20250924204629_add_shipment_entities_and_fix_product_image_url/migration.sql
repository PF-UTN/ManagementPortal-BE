/*
  Warnings:

  - You are about to alter the column `imageUrl` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `VarChar(500)` to `VarChar(255)`.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shipmentId" INTEGER;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "imageUrl" SET DATA TYPE VARCHAR(255);

-- CreateTable
CREATE TABLE "ShipmentStatus" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(20) NOT NULL,

    CONSTRAINT "ShipmentStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "estimatedKm" DECIMAL(10,2),
    "finishedAt" TIMESTAMP(3),
    "effectiveKm" DECIMAL(10,2),
    "routeLink" VARCHAR(500),
    "vehicleId" INTEGER NOT NULL,
    "statusId" INTEGER NOT NULL,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "ShipmentStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
