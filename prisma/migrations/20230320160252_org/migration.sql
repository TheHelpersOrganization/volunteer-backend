/*
  Warnings:

  - A unique constraint covering the columns `[logo]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[banner]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "banner" INTEGER,
ADD COLUMN     "logo" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Organization_logo_key" ON "Organization"("logo");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_banner_key" ON "Organization"("banner");

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_logo_fkey" FOREIGN KEY ("logo") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_banner_fkey" FOREIGN KEY ("banner") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;
