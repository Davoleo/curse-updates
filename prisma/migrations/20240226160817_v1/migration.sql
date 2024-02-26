/*
  Warnings:

  - You are about to drop the `AssignedProject` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `version` on the `CachedProject` table. All the data in the column will be lost.
  - The primary key for the `AnnouncementsConfig` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropTable
PRAGMA foreign_keys=off;
-- noinspection SqlResolve
DROP TABLE "AssignedProject";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "_AssignedProject" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_AssignedProject_A_fkey" FOREIGN KEY ("A") REFERENCES "CachedProject" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AssignedProject_B_fkey" FOREIGN KEY ("B") REFERENCES "ServerConfig" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CachedProject" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "fileId" INTEGER,
    "filename" TEXT
);
INSERT INTO "new_CachedProject" ("id", "slug") SELECT "id", "slug" FROM "CachedProject";
DROP TABLE "CachedProject";
ALTER TABLE "new_CachedProject" RENAME TO "CachedProject";
CREATE TABLE "new_AnnouncementsConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "serverId" TEXT NOT NULL,
    "channel" TEXT,
    "message" TEXT,
    "tagsFilter" TEXT,
    "projectsFilter" TEXT,
    CONSTRAINT "AnnouncementsConfig_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "ServerConfig" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AnnouncementsConfig" ("channel", "id", "message", "serverId") SELECT "channel", "id", "message", "serverId" FROM "AnnouncementsConfig";
DROP TABLE "AnnouncementsConfig";
ALTER TABLE "new_AnnouncementsConfig" RENAME TO "AnnouncementsConfig";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "_AssignedProject_AB_unique" ON "_AssignedProject"("A", "B");

-- CreateIndex
CREATE INDEX "_AssignedProject_B_index" ON "_AssignedProject"("B");
