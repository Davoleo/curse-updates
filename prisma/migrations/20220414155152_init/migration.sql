-- CreateTable
CREATE TABLE "ServerConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serverName" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "AssignedProject" (
    "projectId" INTEGER NOT NULL,
    "serverId" TEXT NOT NULL,

    PRIMARY KEY ("projectId", "serverId"),
    CONSTRAINT "AssignedProject_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "ServerConfig" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AssignedProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "CachedProject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AnnouncementsConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "serverId" TEXT NOT NULL,
    "channel" TEXT,
    "message" TEXT,
    CONSTRAINT "AnnouncementsConfig_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "ServerConfig" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CachedProject" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "version" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CachedProject_slug_key" ON "CachedProject"("slug");
