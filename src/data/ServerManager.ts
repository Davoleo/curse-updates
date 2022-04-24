import * as assert from "assert";
import { Snowflake } from "discord.js";
import { dbclient } from "./dataHandler";
import UpdatesManager from "./UpdatesManager";

export default class ServerManager {

    serverId: Snowflake;
    serverName: string;
    projects: Set<number>;

    private queried: boolean;
    private projectsToRemove: Set<number> | null = new Set();

    private constructor(serverId: Snowflake, serverName: string) {
        this.serverId = serverId;
        this.serverName = serverName;
        this.projects = new Set();
    }

    // ----- Initialization -----

    static async ofServer(id: Snowflake): Promise<ServerManager | null> {
        const match = await dbclient.serverConfig.findUnique({
            where: {
                id: id
            }
        });
        
        return match === null ? null : new ServerManager(id, match.serverName);
    }

    static create(id: Snowflake, name: string): ServerManager {
        dbclient.serverConfig.create({
            data: {
                id: id,
                serverName: name
            }
        });

        return new ServerManager(id, name);
    }

    static async all(): Promise<ServerManager[]> {
        const configs = await dbclient.serverConfig.findMany();
        return configs.map(conf => new ServerManager(conf.id, conf.serverName));
    }

    //DB Load
    async querySchedule(): Promise<ServerManager> {

        if (this.queried)
            return this;

        const assigned = await dbclient.assignedProject.findMany({
            where: {
                serverId: this.serverId
            }
        });
        this.projects = new Set();
        assigned.forEach(assigned => this.projects.add(assigned.projectId));

        this.projectsToRemove = new Set();
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
            this.projects = new Set();
        }
        else {
            for (const proj of this.projectsToRemove) {
                await dbclient.assignedProject.delete({
                    where: {
                        projectId_serverId: {
                            serverId: this.serverId,
                            projectId: proj
                        }
                    }
                })
            }
        }

        return this;
    }

    async getUpdateSettings() {
        return UpdatesManager.ofServer(this.serverId);
    }

    removeSelf(): void {
        dbclient.serverConfig.delete({
            where: {
                id: this.serverId
            }
        });
    }

    // ---- Project Schedule ----
    addProject(id: number): void {
        assert(this.queried)

        if (this.projects.size >= 30)
            throw Error("Too many Assigned projects! Remove something first.");

        if (this.projects.has(id))
            throw Error("Project already Scheduled!");

        this.projects.add(id);
    }

    removeProject(id: number): void {
        assert(this.queried);

        //means clearProjects was called before -> all projects will be removed
        if (this.projectsToRemove === null)
            return;

        if (!this.projects.has(id)) 
            throw Error("There's no project with that id number!");
    
        this.projectsToRemove.add(id);
    }

    clearProjects(): void {
        assert(this.queried);

        if (this.projects.size === 0)
            return;

        this.projectsToRemove = null;
    }
}