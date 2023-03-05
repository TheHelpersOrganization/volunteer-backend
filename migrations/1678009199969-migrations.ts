import { MigrationInterface, QueryRunner } from "typeorm";

export class migrations1678009199969 implements MigrationInterface {
    name = 'migrations1678009199969'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "otp" RENAME COLUMN "otp" TO "token"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "otp" RENAME COLUMN "token" TO "otp"`);
    }

}
