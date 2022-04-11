import { Snowflake } from "discord.js";
import { config } from "dotenv";

/**
 * Singleton Typed Wrapper class for .env fields
 */
export default class Environment {

    private static INSTANCE: Environment = null;

    DiscordToken: string;
    OwnerId: Snowflake;
    BotId: Snowflake;

    DevMode: boolean;
    TestingServers: Snowflake[];

    CurseForgeAPIKey: string;

    private constructor() {
        this.DiscordToken = process.env.DISCORD_TOKEN;
        this.OwnerId = process.env.OWNER_ID;
        this.BotId = process.env.BOT_ID;
        this.DevMode = process.env.DEV_MODE.toUpperCase() === "TRUE"
        this.TestingServers.push(process.env.TESTING_SERVER1, process.env.TESTING_SERVER2);
        this.CurseForgeAPIKey = process.env.CURSEFORGE_API_KEY;
    }

    /**
     * Initializes Environment via dotenv
     */
    public static get(): Environment {
        if (this.INSTANCE === null) {
            config();
            this.INSTANCE = new Environment();
        }
        return this.INSTANCE;
    }
    
}