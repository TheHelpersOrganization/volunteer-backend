import { MigrationInterface, QueryRunner } from "typeorm";

export class migrations1677594654219 implements MigrationInterface {
    name = 'migrations1677594654219'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "accounts" ALTER COLUMN "isAccountDisabled" SET DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "accounts" ALTER COLUMN "isAccountDisabled" DROP DEFAULT`);
    }

}
