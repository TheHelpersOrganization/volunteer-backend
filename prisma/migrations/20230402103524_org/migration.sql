/*
  Warnings:

  - The primary key for the `Member` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `VolunteerShift` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Member" DROP CONSTRAINT "Member_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "rejectionReason" TEXT,
ADD CONSTRAINT "Member_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "VolunteerShift" DROP CONSTRAINT "VolunteerShift_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "rejectionReason" TEXT,
ADD CONSTRAINT "VolunteerShift_pkey" PRIMARY KEY ("id");
