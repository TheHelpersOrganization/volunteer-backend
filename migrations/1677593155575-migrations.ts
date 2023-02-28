import { MigrationInterface, QueryRunner } from 'typeorm';

export class migrations1677593155575 implements MigrationInterface {
    name = 'migrations1677593155575';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "otp" ("accountId" integer NOT NULL, "type" character varying NOT NULL, "otp" character varying NOT NULL, "createdAt" TIMESTAMP DEFAULT now(), "updatedAt" TIMESTAMP DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_0418a63aca14f7051945d5fc866" PRIMARY KEY ("accountId", "type"))`,
        );
        await queryRunner.query(
            `ALTER TABLE "accounts" ADD "isAccountVerified" boolean NOT NULL DEFAULT FALSE`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "accounts" DROP COLUMN "isAccountVerified"`,
        );
        await queryRunner.query(`DROP TABLE "otp"`);
    }
}
