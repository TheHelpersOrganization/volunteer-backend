import { MigrationInterface, QueryRunner } from "typeorm";

export class migrations1679065722676 implements MigrationInterface {
    name = 'migrations1679065722676'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "location" ("id" SERIAL NOT NULL, "addressLine1" character varying, "addressLine2" character varying, "locality" character varying, "region" character varying, "country" character varying, "latitude" integer, "longitude" integer, "createdAt" TIMESTAMP DEFAULT now(), "updatedAt" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_876d7bdba03c72251ec4c2dc827" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "location"`);
    }

}
