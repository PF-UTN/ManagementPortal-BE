-- CreateTable
CREATE TABLE "PaymentStatus" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "PaymentStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "mpPaymentId" TEXT NOT NULL,
    "statusId" INTEGER NOT NULL,
    "transactionAmount" DOUBLE PRECISION,
    "currencyId" TEXT,
    "description" TEXT,
    "paymentMethod" TEXT,
    "paymentType" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL,
    "dateApproved" TIMESTAMP(3),
    "dateLastUpdated" TIMESTAMP(3),
    "orderId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentStatus_code_key" ON "PaymentStatus"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_mpPaymentId_key" ON "Payment"("mpPaymentId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "PaymentStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
