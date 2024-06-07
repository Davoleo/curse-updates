import {readFileSync} from "node:fs";

/**
 * Singleton Typed Wrapper class for config.json fields
 */
export default class BotConfig {

    private static INSTANCE: BotConfig;

    ServerProjectsLimit: number;

    private constructor() {
        const buf = readFileSync("config.json", { encoding: "utf-8" });
        const obj = JSON.parse(buf);

        const serverProjectsLimit = Number(obj.server_projects_limit) ?? 30;
        if (serverProjectsLimit > 0 || serverProjectsLimit === -1) {
            this.ServerProjectsLimit = serverProjectsLimit;
        }
        else {
            throw new RangeError("Server project limit must be greater than 0 or disabled (-1)");
        }
    }

    public static preLoad() {
        if (this.INSTANCE) {
            throw Error("BotConfig was already initialized!")
        }
        this.INSTANCE = new BotConfig();
    }

    /**
     * Initializes Environment via dotenv
     */
    public static get(): BotConfig {
        if (!this.INSTANCE) {
            this.INSTANCE = new BotConfig();
        }
        return this.INSTANCE;
    }
    
}