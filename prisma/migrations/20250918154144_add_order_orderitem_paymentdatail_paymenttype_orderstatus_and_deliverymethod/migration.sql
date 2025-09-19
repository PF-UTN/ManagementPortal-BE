/*
  Warnings:

  - You are about to alter the column `totalAmount` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to drop the column `subtotalAmount` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `PaymentDetail` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `PaymentDetail` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `PaymentType` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `description` on the `PaymentType` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - A unique constraint covering the columns `[paymentDetailId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `deliveryMethodId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentDetailId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotalPrice` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitPrice` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PaymentDetail" DROP CONSTRAINT "PaymentDetail_orderId_fkey";

-- DropIndex
DROP INDEX "PaymentDetail_orderId_key";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryMethodId" INTEGER NOT NULL,
ADD COLUMN     "paymentDetailId" INTEGER NOT NULL,
ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "subtotalAmount",
ADD COLUMN     "subtotalPrice" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "unitPrice" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "PaymentDetail" DROP COLUMN "createdAt",
DROP COLUMN "orderId";

-- AlterTable
ALTER TABLE "PaymentType" ALTER COLUMN "name" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "description" SET DATA TYPE VARCHAR(100);

-- CreateTable
CREATE TABLE "DeliveryMethod" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(40) NOT NULL,

    CONSTRAINT "DeliveryMethod_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryMethod_name_key" ON "DeliveryMethod"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Order_paymentDetailId_key" ON "Order"("paymentDetailId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_paymentDetailId_fkey" FOREIGN KEY ("paymentDetailId") REFERENCES "PaymentDetail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_deliveryMethodId_fkey" FOREIGN KEY ("deliveryMethodId") REFERENCES "DeliveryMethod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
