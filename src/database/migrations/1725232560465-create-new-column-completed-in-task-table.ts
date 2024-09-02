import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNewColumnCompletedInTaskTable1725232560465
  implements MigrationInterface
{
  name = 'CreateNewColumnCompletedInTaskTable1725232560465';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "task"
            ADD "completed" boolean NOT NULL DEFAULT false
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "task" DROP COLUMN "completed"
        `);
  }
}
