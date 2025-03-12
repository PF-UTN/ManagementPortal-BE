-- CreateTable
CREATE TABLE "RegistrationRequestStatus" (
    "id" INTEGER NOT NULL,
    "code" VARCHAR(8) NOT NULL,

    CONSTRAINT "RegistrationRequestStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistrationRequest" (
    "id" SERIAL NOT NULL,
    "statusId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "note" VARCHAR(50) NOT NULL,
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistrationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "firstName" VARCHAR(50) NOT NULL,
    "lastName" VARCHAR(50) NOT NULL,
    "email" VARCHAR(250) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "documentType" VARCHAR(4) NOT NULL,
    "documentNumber" VARCHAR(10) NOT NULL,
    "registrationRequestId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RegistrationRequestStatus_id_key" ON "RegistrationRequestStatus"("id");

-- CreateIndex
CREATE UNIQUE INDEX "RegistrationRequestStatus_code_key" ON "RegistrationRequestStatus"("code");

-- CreateIndex
CREATE UNIQUE INDEX "RegistrationRequest_userId_key" ON "RegistrationRequest"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "RegistrationRequest" ADD CONSTRAINT "RegistrationRequest_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "RegistrationRequestStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistrationRequest" ADD CONSTRAINT "RegistrationRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
