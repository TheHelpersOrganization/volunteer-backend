-- CreateTable
CREATE TABLE "accounts" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR NOT NULL,
    "isAccountDisabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "isAccountVerified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "internalName" VARCHAR NOT NULL,
    "mimetype" VARCHAR NOT NULL,
    "path" VARCHAR NOT NULL,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(6),
    "createdBy" INTEGER,

    CONSTRAINT "PK_36b46d232307066b3a2c9ea3a1d" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location" (
    "id" SERIAL NOT NULL,
    "addressLine1" VARCHAR,
    "addressLine2" VARCHAR,
    "locality" VARCHAR,
    "region" VARCHAR,
    "country" VARCHAR,
    "latitude" INTEGER,
    "longitude" INTEGER,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PK_876d7bdba03c72251ec4c2dc827" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "migrations" (
    "id" SERIAL NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "name" VARCHAR NOT NULL,

    CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp" (
    "accountId" INTEGER NOT NULL,
    "type" VARCHAR NOT NULL,
    "token" VARCHAR NOT NULL,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ(6),

    CONSTRAINT "PK_0418a63aca14f7051945d5fc866" PRIMARY KEY ("accountId","type")
);

-- CreateTable
CREATE TABLE "profiles" (
    "accountId" INTEGER NOT NULL,
    "username" VARCHAR,
    "firstName" VARCHAR,
    "lastName" VARCHAR,
    "dateOfBirth" TIMESTAMP(6),
    "gender" VARCHAR,
    "bio" VARCHAR,
    "phoneNumber" VARCHAR,
    "addressLine1" VARCHAR,
    "addressLine2" VARCHAR,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PK_a443220e6eb2480b1514c8b6203" PRIMARY KEY ("accountId")
);

-- CreateIndex
CREATE UNIQUE INDEX "UQ_ee66de6cdc53993296d1ceb8aa0" ON "accounts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UQ_cb1b584718e00680d586b7aac94" ON "file"("internalName");

-- AddForeignKey
ALTER TABLE "file" ADD CONSTRAINT "FK_bb001e754134c80f1975e18e4c2" FOREIGN KEY ("createdBy") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
