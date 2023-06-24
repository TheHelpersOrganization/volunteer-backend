-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isAccountDisabled" BOOLEAN NOT NULL DEFAULT false,
    "isAccountVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "accountId" INTEGER NOT NULL,
    "username" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "bio" TEXT,
    "phoneNumber" TEXT,
    "locationId" INTEGER,
    "avatarId" INTEGER,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("accountId")
);

-- CreateTable
CREATE TABLE "Token" (
    "accountId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Token_pkey" PRIMARY KEY ("accountId","type")
);

-- CreateTable
CREATE TABLE "File" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "internalName" TEXT NOT NULL,
    "mimetype" TEXT,
    "path" TEXT NOT NULL,
    "size" DOUBLE PRECISION NOT NULL,
    "sizeUnit" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "locality" TEXT,
    "region" TEXT,
    "country" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "email" TEXT,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "phoneNumber" TEXT,
    "email" TEXT,
    "description" TEXT,
    "website" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "isDisabled" BOOLEAN NOT NULL DEFAULT false,
    "logo" INTEGER,
    "banner" INTEGER,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "ownerId" INTEGER NOT NULL,
    "verifierId" INTEGER,
    "verifierComment" TEXT,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDisabled" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "thumbnail" INTEGER,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shift" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "automaticStatusUpdate" BOOLEAN NOT NULL DEFAULT true,
    "numberOfParticipants" INTEGER,
    "availableSlots" INTEGER,
    "joinedParticipants" INTEGER NOT NULL DEFAULT 0,
    "checkInMinutesLimit" INTEGER,
    "checkOutMinutesLimit" INTEGER,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "activityId" INTEGER NOT NULL,

    CONSTRAINT "Shift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShiftMetadata" (
    "id" INTEGER NOT NULL,
    "joinedParticipants" INTEGER NOT NULL,
    "availableSlots" INTEGER,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShiftMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "from" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountBan" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "performedBy" INTEGER NOT NULL,
    "isBanned" BOOLEAN NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountBan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountVerification" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "performedBy" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "isVerified" BOOLEAN NOT NULL,
    "content" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountRole" (
    "accountId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountRole_pkey" PRIMARY KEY ("accountId","roleId")
);

-- CreateTable
CREATE TABLE "AccountVerificationFile" (
    "accountVerificationId" INTEGER NOT NULL,
    "fileId" INTEGER NOT NULL,

    CONSTRAINT "AccountVerificationFile_pkey" PRIMARY KEY ("fileId")
);

-- CreateTable
CREATE TABLE "ProfileInterestedSkill" (
    "profileId" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileInterestedSkill_pkey" PRIMARY KEY ("profileId","skillId")
);

-- CreateTable
CREATE TABLE "OrganizationFile" (
    "organizationId" INTEGER NOT NULL,
    "fileId" INTEGER NOT NULL,

    CONSTRAINT "OrganizationFile_pkey" PRIMARY KEY ("fileId")
);

-- CreateTable
CREATE TABLE "OrganizationLocation" (
    "organizationId" INTEGER NOT NULL,
    "locationId" INTEGER NOT NULL,

    CONSTRAINT "OrganizationLocation_pkey" PRIMARY KEY ("locationId")
);

-- CreateTable
CREATE TABLE "OrganizationContact" (
    "organizationId" INTEGER NOT NULL,
    "contactId" INTEGER NOT NULL,

    CONSTRAINT "OrganizationContact_pkey" PRIMARY KEY ("contactId")
);

-- CreateTable
CREATE TABLE "OrganizationSkill" (
    "organizationId" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationSkill_pkey" PRIMARY KEY ("organizationId","skillId")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "censorId" INTEGER,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivitySkill" (
    "activityId" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivitySkill_pkey" PRIMARY KEY ("activityId","skillId")
);

-- CreateTable
CREATE TABLE "ActivityManager" (
    "activityId" INTEGER NOT NULL,
    "accountId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityManager_pkey" PRIMARY KEY ("activityId","accountId")
);

-- CreateTable
CREATE TABLE "ActivityContact" (
    "activityId" INTEGER NOT NULL,
    "contactId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityContact_pkey" PRIMARY KEY ("activityId","contactId")
);

-- CreateTable
CREATE TABLE "VolunteerSkill" (
    "accountId" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,
    "hours" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VolunteerSkill_pkey" PRIMARY KEY ("accountId","skillId")
);

-- CreateTable
CREATE TABLE "ShiftLocation" (
    "shiftId" INTEGER NOT NULL,
    "locationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShiftLocation_pkey" PRIMARY KEY ("locationId")
);

-- CreateTable
CREATE TABLE "ShiftContact" (
    "shiftId" INTEGER NOT NULL,
    "contactId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShiftContact_pkey" PRIMARY KEY ("contactId")
);

-- CreateTable
CREATE TABLE "ShiftSkill" (
    "shiftId" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,
    "hours" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShiftSkill_pkey" PRIMARY KEY ("shiftId","skillId")
);

-- CreateTable
CREATE TABLE "ShiftSkillValue" (
    "shiftId" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,
    "hours" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShiftSkillValue_pkey" PRIMARY KEY ("shiftId","skillId")
);

-- CreateTable
CREATE TABLE "VolunteerShift" (
    "id" SERIAL NOT NULL,
    "shiftId" INTEGER NOT NULL,
    "accountId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "rejectionReason" TEXT,
    "censorId" INTEGER,
    "attendant" BOOLEAN NOT NULL DEFAULT false,
    "checkedIn" BOOLEAN,
    "checkedOut" BOOLEAN,
    "checkInAt" TIMESTAMP(3),
    "checkOutAt" TIMESTAMP(3),
    "isCheckInVerified" BOOLEAN,
    "isCheckOutVerified" BOOLEAN,
    "checkInOutVerifierId" INTEGER,
    "completion" DOUBLE PRECISION,
    "reviewNote" TEXT,
    "reviewerId" INTEGER,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VolunteerShift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShiftManager" (
    "shiftId" INTEGER NOT NULL,
    "accountId" INTEGER NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShiftManager_pkey" PRIMARY KEY ("shiftId","accountId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_accountId_key" ON "Profile"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_locationId_key" ON "Profile"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_avatarId_key" ON "Profile"("avatarId");

-- CreateIndex
CREATE UNIQUE INDEX "File_internalName_key" ON "File"("internalName");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_logo_key" ON "Organization"("logo");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_banner_key" ON "Organization"("banner");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_thumbnail_key" ON "Activity"("thumbnail");

-- CreateIndex
CREATE UNIQUE INDEX "ShiftMetadata_id_key" ON "ShiftMetadata"("id");

-- CreateIndex
CREATE UNIQUE INDEX "AccountVerificationFile_fileId_key" ON "AccountVerificationFile"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationFile_fileId_key" ON "OrganizationFile"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationLocation_locationId_key" ON "OrganizationLocation"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationContact_contactId_key" ON "OrganizationContact"("contactId");

-- CreateIndex
CREATE UNIQUE INDEX "ShiftLocation_locationId_key" ON "ShiftLocation"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "ShiftContact_contactId_key" ON "ShiftContact"("contactId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_logo_fkey" FOREIGN KEY ("logo") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_banner_fkey" FOREIGN KEY ("banner") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_verifierId_fkey" FOREIGN KEY ("verifierId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_thumbnail_fkey" FOREIGN KEY ("thumbnail") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftMetadata" ADD CONSTRAINT "ShiftMetadata_id_fkey" FOREIGN KEY ("id") REFERENCES "Shift"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountBan" ADD CONSTRAINT "AccountBan_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountBan" ADD CONSTRAINT "AccountBan_performedBy_fkey" FOREIGN KEY ("performedBy") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountVerification" ADD CONSTRAINT "AccountVerification_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountVerification" ADD CONSTRAINT "AccountVerification_performedBy_fkey" FOREIGN KEY ("performedBy") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountRole" ADD CONSTRAINT "AccountRole_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountRole" ADD CONSTRAINT "AccountRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountVerificationFile" ADD CONSTRAINT "AccountVerificationFile_accountVerificationId_fkey" FOREIGN KEY ("accountVerificationId") REFERENCES "AccountVerification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountVerificationFile" ADD CONSTRAINT "AccountVerificationFile_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileInterestedSkill" ADD CONSTRAINT "ProfileInterestedSkill_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("accountId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileInterestedSkill" ADD CONSTRAINT "ProfileInterestedSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationFile" ADD CONSTRAINT "OrganizationFile_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationFile" ADD CONSTRAINT "OrganizationFile_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationLocation" ADD CONSTRAINT "OrganizationLocation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationLocation" ADD CONSTRAINT "OrganizationLocation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationContact" ADD CONSTRAINT "OrganizationContact_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationContact" ADD CONSTRAINT "OrganizationContact_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationSkill" ADD CONSTRAINT "OrganizationSkill_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationSkill" ADD CONSTRAINT "OrganizationSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_censorId_fkey" FOREIGN KEY ("censorId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivitySkill" ADD CONSTRAINT "ActivitySkill_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivitySkill" ADD CONSTRAINT "ActivitySkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityManager" ADD CONSTRAINT "ActivityManager_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityManager" ADD CONSTRAINT "ActivityManager_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityContact" ADD CONSTRAINT "ActivityContact_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityContact" ADD CONSTRAINT "ActivityContact_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerSkill" ADD CONSTRAINT "VolunteerSkill_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerSkill" ADD CONSTRAINT "VolunteerSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftLocation" ADD CONSTRAINT "ShiftLocation_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftLocation" ADD CONSTRAINT "ShiftLocation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftContact" ADD CONSTRAINT "ShiftContact_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftContact" ADD CONSTRAINT "ShiftContact_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftSkill" ADD CONSTRAINT "ShiftSkill_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftSkill" ADD CONSTRAINT "ShiftSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftSkillValue" ADD CONSTRAINT "ShiftSkillValue_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftSkillValue" ADD CONSTRAINT "ShiftSkillValue_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerShift" ADD CONSTRAINT "VolunteerShift_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerShift" ADD CONSTRAINT "VolunteerShift_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerShift" ADD CONSTRAINT "VolunteerShift_censorId_fkey" FOREIGN KEY ("censorId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerShift" ADD CONSTRAINT "VolunteerShift_checkInOutVerifierId_fkey" FOREIGN KEY ("checkInOutVerifierId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerShift" ADD CONSTRAINT "VolunteerShift_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftManager" ADD CONSTRAINT "ShiftManager_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftManager" ADD CONSTRAINT "ShiftManager_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

