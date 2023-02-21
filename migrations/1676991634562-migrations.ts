import { MigrationInterface, QueryRunner } from "typeorm";

export class migrations1676991634562 implements MigrationInterface {
    name = 'migrations1676991634562'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "profiles" ("accountId" integer NOT NULL, "username" character varying NOT NULL, "telephoneNumber" character varying NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "dateOfBirth" TIMESTAMP NOT NULL, "gender" character varying NOT NULL, "bio" character varying NOT NULL, "created_at" TIMESTAMP DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), CONSTRAINT "PK_a443220e6eb2480b1514c8b6203" PRIMARY KEY ("accountId"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "profiles"`);
    }

}
