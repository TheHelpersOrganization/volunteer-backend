-- AlterTable
ALTER TABLE "MemberRole" ADD COLUMN     "grantedBy" INTEGER;

-- AddForeignKey
ALTER TABLE "MemberRole" ADD CONSTRAINT "MemberRole_grantedBy_fkey" FOREIGN KEY ("grantedBy") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
