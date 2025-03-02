-- CreateTable
CREATE TABLE "RegistrationRequestStatus" (
    "id" INTEGER NOT NULL,
    "status" VARCHAR(8) NOT NULL,

    CONSTRAINT "RegistrationRequestStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistrationRequest" (
    "id" SERIAL NOT NULL,
    "fullNameOrBusinessName" VARCHAR(100) NOT NULL,
    "email" VARCHAR(250) NOT NULL,
    "statusId" INTEGER NOT NULL,
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "documentTypeAndNumber" VARCHAR(50) NOT NULL,
    "province" VARCHAR(50) NOT NULL,
    "city" VARCHAR(50) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,

    CONSTRAINT "RegistrationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RegistrationRequestStatus_id_key" ON "RegistrationRequestStatus"("id");

-- CreateIndex
CREATE UNIQUE INDEX "RegistrationRequestStatus_status_key" ON "RegistrationRequestStatus"("status");

-- CreateIndex
CREATE UNIQUE INDEX "RegistrationRequest_email_key" ON "RegistrationRequest"("email");

-- AddForeignKey
ALTER TABLE "RegistrationRequest" ADD CONSTRAINT "RegistrationRequest_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "RegistrationRequestStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
