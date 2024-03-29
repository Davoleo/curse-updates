/*
  Warnings:

  - The primary key for the `AnnouncementsConfig` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AnnouncementsConfig" (
    "id" INTEGER NOT NULL,
    "serverId" TEXT NOT NULL,
    "channel" TEXT,
    "message" TEXT,
    "tagsFilter" TEXT,
    "projectsFilter" TEXT,

    PRIMARY KEY ("id", "serverId"),
    CONSTRAINT "AnnouncementsConfig_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "ServerConfig" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AnnouncementsConfig" ("channel", "id", "message", "projectsFilter", "serverId", "tagsFilter") SELECT "channel", "id", "message", "projectsFilter", "serverId", "tagsFilter" FROM "AnnouncementsConfig";
DROP TABLE "AnnouncementsConfig";
ALTER TABLE "new_AnnouncementsConfig" RENAME TO "AnnouncementsConfig";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
