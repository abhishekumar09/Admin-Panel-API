/*
  Warnings:

  - You are about to drop the column `softDeleted` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `softDeleted` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `_ProjectAssignments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ProjectAssignments" DROP CONSTRAINT "_ProjectAssignments_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProjectAssignments" DROP CONSTRAINT "_ProjectAssignments_B_fkey";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "softDeleted",
ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Role" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "permissions" TEXT[];

-- AlterTable
ALTER TABLE "User" DROP COLUMN "softDeleted";

-- DropTable
DROP TABLE "_ProjectAssignments";

-- CreateTable
CREATE TABLE "_ProjectAssignment" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectAssignment_AB_unique" ON "_ProjectAssignment"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectAssignment_B_index" ON "_ProjectAssignment"("B");

-- AddForeignKey
ALTER TABLE "_ProjectAssignment" ADD CONSTRAINT "_ProjectAssignment_A_fkey" FOREIGN KEY ("A") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectAssignment" ADD CONSTRAINT "_ProjectAssignment_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
