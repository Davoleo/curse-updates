import * as assert from "assert";
import { Snowflake } from "discord.js";
import { dbclient } from "./dataHandler";

export default class ServerManager {

    serverId: Snowflake;
    serverName: string = null;
    projects: number[] = null;

    private queried: boolean;
    private projectsToRemove: Set<number> = new Set();

    private constructor(serverId: Snowflake, serverName = "") {
        this.serverId = serverId;

        this.queried = serverName !== "";

        if (serverName !== "") {
            // Server is being created from scratch -> everything is empty
            this.serverName = serverName;
            this.projects = [];
        }
    }

    // ----- Initialization -----

    static ofServer(id: Snowflake): ServerManager {
        return new ServerManager(id);
    }

    static fromScratch(id: Snowflake, name: string): ServerManager {
        dbclient.serverConfig.create({
            data: {
                id: id,
                serverName: name
            }
        });

        return new ServerManager(id, name);
    }

    //DB Load
    async query(): Promise<ServerManager> {

        if (this.queried)
            return this;

        const server = await dbclient.serverConfig.findUnique({
            where: {
                id: this.serverId
            }
        });
        this.serverName = server.serverName;

        const assigned = await dbclient.assignedProject.findMany({
            where: {
                serverId: this.serverId
            }
        });
        this.projects = assigned.map(assigned => assigned.projectId);

        this.queried = true;
        return this;
    }

    //DB Save
    async save(): Promise<ServerManager> {
        //Update Assigned Projects
        if (this.projectsToRemove === null) {
            //clearProjects was called
            await dbclient.assignedProject.deleteMany({
                where: {
                    serverId: this.serverId
                }
            });
            this.projects = [];
        }
        else {
            for (const index of this.projectsToRemove) {
                await dbclient.assignedProject.delete({
                    where: {
                        projectId_serverId: {
                            serverId: this.serverId,
                            projectId: this.projects[index]
                        }
                    }
                })
            }
        }

        return this;
    }

    remove(): void {
        dbclient.serverConfig.delete({
            where: {
                id: this.serverId
            }
        });
    }

    // ---- Project Schedule ----
    addProject(id: number): void {
        assert(this.queried)

        if (this.projects.length >= 30)
            throw Error("Too many Assigned projects! Remove something first.");

        if (this.projects.indexOf(id) !== -1)
            throw Error("Project already Scheduled!");

        this.projects.push(id);
    }

    removeProject(id: number): void {
        assert(this.queried);

        //means clearProjects was called before -> all projects will be removed
        if (this.projectsToRemove === null)
            return;

        const index = this.projects.indexOf(id);

        if (index === -1) 
            throw Error("There's no project with that id number!");
    
        this.projectsToRemove.add(index);
    }

    clearProjects(): void {
        assert(this.queried);

        if (this.projects.length === 0)
            return;

        this.projectsToRemove = null;
    }
}