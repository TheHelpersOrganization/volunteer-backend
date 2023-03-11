import { MigrationInterface, QueryRunner } from "typeorm";

export class migrations1678511951130 implements MigrationInterface {
    name = 'migrations1678511951130'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "telephoneNumber"`);
        await queryRunner.query(`ALTER TABLE "profiles" ADD "phoneNumber" character varying`);
        await queryRunner.query(`ALTER TABLE "profiles" ADD "addressLine1" character varying`);
        await queryRunner.query(`ALTER TABLE "profiles" ADD "addressLine2" character varying`);
        await queryRunner.query(`ALTER TABLE "profiles" ADD "createdAt" TIMESTAMP DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "profiles" ADD "updatedAt" TIMESTAMP DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "addressLine2"`);
        await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "addressLine1"`);
        await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "phoneNumber"`);
        await queryRunner.query(`ALTER TABLE "profiles" ADD "telephoneNumber" character varying`);
        await queryRunner.query(`ALTER TABLE "profiles" ADD "updated_at" TIMESTAMP DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "profiles" ADD "created_at" TIMESTAMP DEFAULT now()`);
    }

}
