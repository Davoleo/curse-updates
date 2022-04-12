-- CreateTable
CREATE TABLE "ServerConfig" (
    "serverId" TEXT NOT NULL PRIMARY KEY,
    "serverName" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "AnnouncementsConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "serverId" TEXT NOT NULL,
    "channel" TEXT,
    "message" TEXT,
    CONSTRAINT "AnnouncementsConfig_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "ServerConfig" ("serverId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CachedProject" (
    "projectId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "version" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CachedProjectToServerConfig" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,
    FOREIGN KEY ("A") REFERENCES "CachedProject" ("projectId") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("B") REFERENCES "ServerConfig" ("serverId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CachedProject_slug_key" ON "CachedProject"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "_CachedProjectToServerConfig_AB_unique" ON "_CachedProjectToServerConfig"("A", "B");

-- CreateIndex
CREATE INDEX "_CachedProjectToServerConfig_B_index" ON "_CachedProjectToServerConfig"("B");
