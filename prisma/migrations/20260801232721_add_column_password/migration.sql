/*
  Warnings:

  - Added the required column `password` to the `collaborators` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "collaborators" ADD COLUMN     "password" TEXT NOT NULL;
