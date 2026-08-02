/*
  Warnings:

  - Added the required column `storage_key` to the `document_versions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storage_url` to the `document_versions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "document_versions" ADD COLUMN     "storage_key" TEXT NOT NULL,
ADD COLUMN     "storage_url" TEXT NOT NULL;
