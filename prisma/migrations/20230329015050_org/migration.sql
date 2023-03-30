/*
  Warnings:

  - You are about to drop the column `isVerified` on the `Organization` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "isVerified",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';
