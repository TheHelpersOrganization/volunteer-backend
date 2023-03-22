/*
  Warnings:

  - A unique constraint covering the columns `[avatarId]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Location" ALTER COLUMN "latitude" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "longitude" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "avatarId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Profile_avatarId_key" ON "Profile"("avatarId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;
