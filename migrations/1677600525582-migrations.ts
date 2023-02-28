import { MigrationInterface, QueryRunner } from "typeorm";

export class migrations1677600525582 implements MigrationInterface {
    name = 'migrations1677600525582'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "otp" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "otp" ADD "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "otp" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "otp" ADD "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "otp" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "otp" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "otp" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "otp" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "otp" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "otp" ADD "updatedAt" TIMESTAMP DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "otp" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "otp" ADD "createdAt" TIMESTAMP DEFAULT now()`);
    }

}
