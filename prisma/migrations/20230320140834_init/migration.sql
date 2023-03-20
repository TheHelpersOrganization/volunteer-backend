/*
  Warnings:

  - You are about to drop the `accounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `file` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `location` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `migrations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `otp` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `profiles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "file" DROP CONSTRAINT "FK_bb001e754134c80f1975e18e4c2";

-- DropTable
DROP TABLE "accounts";

-- DropTable
DROP TABLE "file";

-- DropTable
DROP TABLE "location";

-- DropTable
DROP TABLE "migrations";

-- DropTable
DROP TABLE "otp";

-- DropTable
DROP TABLE "profiles";

-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isAccountDisabled" BOOLEAN NOT NULL DEFAULT false,
    "isAccountVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "accountId" INTEGER NOT NULL,
    "username" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "bio" TEXT,
    "phoneNumber" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("accountId")
);

-- CreateTable
CREATE TABLE "Token" (
    "accountId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Token_pkey" PRIMARY KEY ("accountId","type")
);

-- CreateTable
CREATE TABLE "File" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "internalName" TEXT NOT NULL,
    "mimetype" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "locality" TEXT,
    "region" TEXT,
    "country" TEXT,
    "latitude" INTEGER,
    "longitude" INTEGER,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "email" TEXT,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "phoneNumber" TEXT,
    "email" TEXT,
    "description" TEXT,
    "website" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isDisabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationFile" (
    "organizationId" INTEGER NOT NULL,
    "fileId" INTEGER NOT NULL,

    CONSTRAINT "OrganizationFile_pkey" PRIMARY KEY ("organizationId","fileId")
);

-- CreateTable
CREATE TABLE "OrganizationLocation" (
    "organizationId" INTEGER NOT NULL,
    "locationId" INTEGER NOT NULL,

    CONSTRAINT "OrganizationLocation_pkey" PRIMARY KEY ("organizationId","locationId")
);

-- CreateTable
CREATE TABLE "OrganizationContact" (
    "organizationId" INTEGER NOT NULL,
    "contactId" INTEGER NOT NULL,

    CONSTRAINT "OrganizationContact_pkey" PRIMARY KEY ("organizationId","contactId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_accountId_key" ON "Profile"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "File_internalName_key" ON "File"("internalName");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationFile_fileId_key" ON "OrganizationFile"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationLocation_locationId_key" ON "OrganizationLocation"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationContact_contactId_key" ON "OrganizationContact"("contactId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationFile" ADD CONSTRAINT "OrganizationFile_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationFile" ADD CONSTRAINT "OrganizationFile_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationLocation" ADD CONSTRAINT "OrganizationLocation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationLocation" ADD CONSTRAINT "OrganizationLocation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationContact" ADD CONSTRAINT "OrganizationContact_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationContact" ADD CONSTRAINT "OrganizationContact_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
