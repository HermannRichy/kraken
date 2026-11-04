-- Remplace l'ancien rôle opérationnel par l'organisateur.
UPDATE "user" SET "role" = 'organizer' WHERE "role" = 'moderator';

CREATE TYPE "ResourceKind" AS ENUM ('file', 'link', 'docker_image');
CREATE TYPE "ResourceAudience" AS ENUM ('participant', 'public');
CREATE TYPE "ResourceStatus" AS ENUM ('draft', 'published', 'archived');
CREATE TYPE "SubmissionFormStatus" AS ENUM ('draft', 'published', 'closed', 'archived');
CREATE TYPE "SubmissionFieldType" AS ENUM ('short_text', 'long_text', 'url', 'select', 'checkbox', 'file');
CREATE TYPE "SubmissionStatus" AS ENUM ('draft', 'submitted', 'under_review', 'evaluated');

CREATE TABLE "Resource" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "kind" "ResourceKind" NOT NULL,
  "audience" "ResourceAudience" NOT NULL DEFAULT 'participant',
  "status" "ResourceStatus" NOT NULL DEFAULT 'draft',
  "availableAt" TIMESTAMP(3),
  "url" TEXT,
  "storageKey" TEXT,
  "fileName" TEXT,
  "contentType" TEXT,
  "size" INTEGER,
  "createdById" TEXT NOT NULL,
  "publishedAt" TIMESTAMP(3),
  "archivedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SubmissionForm" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" "SubmissionFormStatus" NOT NULL DEFAULT 'draft',
  "opensAt" TIMESTAMP(3),
  "closesAt" TIMESTAMP(3),
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SubmissionForm_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SubmissionField" (
  "id" TEXT NOT NULL,
  "formId" TEXT NOT NULL,
  "position" INTEGER NOT NULL,
  "label" TEXT NOT NULL,
  "help" TEXT,
  "type" "SubmissionFieldType" NOT NULL,
  "required" BOOLEAN NOT NULL DEFAULT false,
  "options" JSONB,
  "accept" TEXT,
  "maxFiles" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SubmissionField_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Submission" (
  "id" TEXT NOT NULL,
  "formId" TEXT NOT NULL,
  "participantId" TEXT NOT NULL,
  "status" "SubmissionStatus" NOT NULL DEFAULT 'draft',
  "answers" JSONB NOT NULL DEFAULT '{}',
  "submittedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SubmissionAttachment" (
  "id" TEXT NOT NULL,
  "submissionId" TEXT NOT NULL,
  "fieldId" TEXT NOT NULL,
  "storageKey" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "contentType" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SubmissionAttachment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SubmissionEvaluation" (
  "id" TEXT NOT NULL,
  "submissionId" TEXT NOT NULL,
  "reviewerId" TEXT NOT NULL,
  "score" INTEGER,
  "feedback" TEXT,
  "rubric" JSONB,
  "submittedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SubmissionEvaluation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Resource_storageKey_key" ON "Resource"("storageKey");
CREATE INDEX "Resource_status_audience_availableAt_idx" ON "Resource"("status", "audience", "availableAt");
CREATE INDEX "Resource_createdById_idx" ON "Resource"("createdById");
CREATE INDEX "SubmissionForm_status_opensAt_closesAt_idx" ON "SubmissionForm"("status", "opensAt", "closesAt");
CREATE UNIQUE INDEX "SubmissionField_formId_position_key" ON "SubmissionField"("formId", "position");
CREATE INDEX "SubmissionField_formId_idx" ON "SubmissionField"("formId");
CREATE UNIQUE INDEX "Submission_formId_participantId_key" ON "Submission"("formId", "participantId");
CREATE INDEX "Submission_status_submittedAt_idx" ON "Submission"("status", "submittedAt");
CREATE UNIQUE INDEX "SubmissionAttachment_storageKey_key" ON "SubmissionAttachment"("storageKey");
CREATE INDEX "SubmissionAttachment_submissionId_fieldId_idx" ON "SubmissionAttachment"("submissionId", "fieldId");
CREATE UNIQUE INDEX "SubmissionEvaluation_submissionId_reviewerId_key" ON "SubmissionEvaluation"("submissionId", "reviewerId");
CREATE INDEX "SubmissionEvaluation_reviewerId_submittedAt_idx" ON "SubmissionEvaluation"("reviewerId", "submittedAt");

ALTER TABLE "Resource" ADD CONSTRAINT "Resource_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SubmissionForm" ADD CONSTRAINT "SubmissionForm_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SubmissionField" ADD CONSTRAINT "SubmissionField_formId_fkey" FOREIGN KEY ("formId") REFERENCES "SubmissionForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_formId_fkey" FOREIGN KEY ("formId") REFERENCES "SubmissionForm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SubmissionAttachment" ADD CONSTRAINT "SubmissionAttachment_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SubmissionAttachment" ADD CONSTRAINT "SubmissionAttachment_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "SubmissionField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SubmissionEvaluation" ADD CONSTRAINT "SubmissionEvaluation_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SubmissionEvaluation" ADD CONSTRAINT "SubmissionEvaluation_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
