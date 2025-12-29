import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1735510000000 implements MigrationInterface {
  name = 'InitialSchema1735510000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryRunner.query(
      "CREATE TYPE \"customization_options_category_enum\" AS ENUM('PAINT','WHEELS','BODY_KIT','SPOILER','INTERIOR_SEAT','INTERIOR_DASHBOARD','TRIM_LEVEL','DECAL')"
    );

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "firstName" character varying NOT NULL,
        "lastName" character varying NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "cars" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "manufacturer" character varying NOT NULL,
        "year" integer NOT NULL,
        "basePrice" numeric(12,2) NOT NULL,
        "description" text,
        "modelUrl" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_cars_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "customization_options" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "carId" uuid NOT NULL,
        "category" "customization_options_category_enum" NOT NULL,
        "name" character varying NOT NULL,
        "description" text,
        "price" numeric(12,2) NOT NULL,
        "colorHex" character varying,
        "modelUrl" character varying,
        "imageUrl" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_customization_options_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query('CREATE INDEX "IDX_customization_options_carId" ON "customization_options" ("carId")');

    await queryRunner.query(`
      ALTER TABLE "customization_options"
      ADD CONSTRAINT "FK_customization_options_car" FOREIGN KEY ("carId") REFERENCES "cars"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE TABLE "saved_configurations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "carId" uuid NOT NULL,
        "name" character varying NOT NULL,
        "description" text,
        "basePrice" numeric(12,2) NOT NULL,
        "totalPrice" numeric(12,2) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_saved_configurations_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query('CREATE INDEX "IDX_saved_configurations_userId" ON "saved_configurations" ("userId")');
    await queryRunner.query('CREATE INDEX "IDX_saved_configurations_carId" ON "saved_configurations" ("carId")');

    await queryRunner.query(`
      ALTER TABLE "saved_configurations"
      ADD CONSTRAINT "FK_saved_configurations_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "saved_configurations"
      ADD CONSTRAINT "FK_saved_configurations_car" FOREIGN KEY ("carId") REFERENCES "cars"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE TABLE "saved_configuration_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "savedConfigurationId" uuid NOT NULL,
        "customizationOptionId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_saved_configuration_items_id" PRIMARY KEY ("id"),
        CONSTRAINT "uq_configuration_option" UNIQUE ("savedConfigurationId", "customizationOptionId")
      )
    `);

    await queryRunner.query('CREATE INDEX "IDX_saved_configuration_items_savedConfigurationId" ON "saved_configuration_items" ("savedConfigurationId")');
    await queryRunner.query('CREATE INDEX "IDX_saved_configuration_items_customizationOptionId" ON "saved_configuration_items" ("customizationOptionId")');

    await queryRunner.query(`
      ALTER TABLE "saved_configuration_items"
      ADD CONSTRAINT "FK_saved_configuration_items_configuration" FOREIGN KEY ("savedConfigurationId") REFERENCES "saved_configurations"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "saved_configuration_items"
      ADD CONSTRAINT "FK_saved_configuration_items_option" FOREIGN KEY ("customizationOptionId") REFERENCES "customization_options"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "saved_configuration_items" DROP CONSTRAINT "FK_saved_configuration_items_option"');
    await queryRunner.query('ALTER TABLE "saved_configuration_items" DROP CONSTRAINT "FK_saved_configuration_items_configuration"');
    await queryRunner.query('DROP INDEX "IDX_saved_configuration_items_customizationOptionId"');
    await queryRunner.query('DROP INDEX "IDX_saved_configuration_items_savedConfigurationId"');
    await queryRunner.query('DROP TABLE "saved_configuration_items"');

    await queryRunner.query('ALTER TABLE "saved_configurations" DROP CONSTRAINT "FK_saved_configurations_car"');
    await queryRunner.query('ALTER TABLE "saved_configurations" DROP CONSTRAINT "FK_saved_configurations_user"');
    await queryRunner.query('DROP INDEX "IDX_saved_configurations_carId"');
    await queryRunner.query('DROP INDEX "IDX_saved_configurations_userId"');
    await queryRunner.query('DROP TABLE "saved_configurations"');

    await queryRunner.query('ALTER TABLE "customization_options" DROP CONSTRAINT "FK_customization_options_car"');
    await queryRunner.query('DROP INDEX "IDX_customization_options_carId"');
    await queryRunner.query('DROP TABLE "customization_options"');

    await queryRunner.query('DROP TABLE "cars"');
    await queryRunner.query('DROP TABLE "users"');

    await queryRunner.query('DROP TYPE "customization_options_category_enum"');
  }
}
