/*
  Warnings:

  - A unique constraint covering the columns `[locationId]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.
  - Made the column `phoneNumber` on table `Profile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "locationId" INTEGER,
ALTER COLUMN "phoneNumber" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Profile_locationId_key" ON "Profile"("locationId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
