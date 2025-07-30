-- CreateTable
CREATE TABLE "MaintenanceItem" (
    "id" SERIAL NOT NULL,
    "description" VARCHAR(500) NOT NULL,

    CONSTRAINT "MaintenanceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenancePlanItem" (
    "id" SERIAL NOT NULL,
    "kmInterval" INTEGER,
    "timeInterval" INTEGER,
    "vehicleId" INTEGER NOT NULL,
    "maintenanceItemId" INTEGER NOT NULL,

    CONSTRAINT "MaintenancePlanItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Maintenance" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "kmPerformed" INTEGER NOT NULL,
    "maintenancePlanItemId" INTEGER NOT NULL,
    "serviceSupplierId" INTEGER NOT NULL,

    CONSTRAINT "Maintenance_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MaintenancePlanItem" ADD CONSTRAINT "MaintenancePlanItem_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenancePlanItem" ADD CONSTRAINT "MaintenancePlanItem_maintenanceItemId_fkey" FOREIGN KEY ("maintenanceItemId") REFERENCES "MaintenanceItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_maintenancePlanItemId_fkey" FOREIGN KEY ("maintenancePlanItemId") REFERENCES "MaintenancePlanItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_serviceSupplierId_fkey" FOREIGN KEY ("serviceSupplierId") REFERENCES "ServiceSupplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
