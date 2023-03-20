/*
  Warnings:

  - The primary key for the `OrganizationContact` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `OrganizationFile` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `OrganizationLocation` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "OrganizationContact" DROP CONSTRAINT "OrganizationContact_pkey",
ADD CONSTRAINT "OrganizationContact_pkey" PRIMARY KEY ("contactId");

-- AlterTable
ALTER TABLE "OrganizationFile" DROP CONSTRAINT "OrganizationFile_pkey",
ADD CONSTRAINT "OrganizationFile_pkey" PRIMARY KEY ("fileId");

-- AlterTable
ALTER TABLE "OrganizationLocation" DROP CONSTRAINT "OrganizationLocation_pkey",
ADD CONSTRAINT "OrganizationLocation_pkey" PRIMARY KEY ("locationId");
