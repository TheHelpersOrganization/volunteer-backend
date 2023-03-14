import { MigrationInterface, QueryRunner } from "typeorm";

export class migrations1678290664376 implements MigrationInterface {
    name = 'migrations1678290664376'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "file" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "internalName" character varying NOT NULL, "mimetype" character varying NOT NULL, "path" character varying NOT NULL, "createdAt" TIMESTAMP DEFAULT now(), "updatedAt" TIMESTAMP DEFAULT now(), "deletedAt" TIMESTAMP, "createdBy" integer, CONSTRAINT "UQ_cb1b584718e00680d586b7aac94" UNIQUE ("internalName"), CONSTRAINT "PK_36b46d232307066b3a2c9ea3a1d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "file" ADD CONSTRAINT "FK_bb001e754134c80f1975e18e4c2" FOREIGN KEY ("createdBy") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file" DROP CONSTRAINT "FK_bb001e754134c80f1975e18e4c2"`);
        await queryRunner.query(`DROP TABLE "file"`);
    }

}
