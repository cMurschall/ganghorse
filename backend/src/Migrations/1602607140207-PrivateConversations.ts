import { MigrationInterface, QueryRunner } from "typeorm";

export class PrivateConversations1602607140207 implements MigrationInterface {
    name = 'PrivateConversations1602607140207'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "privateMessages" ("id" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "version" integer DEFAULT 1, "senderUserId" character varying(50) DEFAULT '', "receiverUserId" character varying(50) DEFAULT '', "text" character varying(10000) NOT NULL DEFAULT '', "readByReceiver" boolean NOT NULL DEFAULT false, "conversationId" character varying, CONSTRAINT "PK_5928a7b69a77b7d04fb8e1856d9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "conversations" ("id" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "version" integer DEFAULT 1, "memberIds" text array, "horseId" character varying(50) DEFAULT '', "horseName" character varying(50) DEFAULT '', CONSTRAINT "PK_ee34f4f7ced4ec8681f26bf04ef" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "horses" ALTER COLUMN "hasEczema" SET DEFAULT null`);
        await queryRunner.query(`ALTER TABLE "privateMessages" ADD CONSTRAINT "FK_43462d4b8ac8b58d43a32b71b2c" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "privateMessages" DROP CONSTRAINT "FK_43462d4b8ac8b58d43a32b71b2c"`);
        await queryRunner.query(`ALTER TABLE "horses" ALTER COLUMN "hasEczema" DROP DEFAULT`);
        await queryRunner.query(`DROP TABLE "conversations"`);
        await queryRunner.query(`DROP TABLE "privateMessages"`);
    }

}
