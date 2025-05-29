-- CreateTable
CREATE TABLE "Address" (
    "id" SERIAL NOT NULL,
    "townId" INTEGER NOT NULL,
    "street" VARCHAR(50) NOT NULL,
    "streetNumber" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Address_userId_key" ON "Address"("userId");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_townId_fkey" FOREIGN KEY ("townId") REFERENCES "Town"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
