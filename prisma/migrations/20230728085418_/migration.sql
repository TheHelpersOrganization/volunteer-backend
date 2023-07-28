-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "disabledBy" INTEGER;

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "disabledBy" INTEGER;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_disabledBy_fkey" FOREIGN KEY ("disabledBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_disabledBy_fkey" FOREIGN KEY ("disabledBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
