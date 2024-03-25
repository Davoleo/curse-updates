import {Snowflake} from "discord.js";
import {config} from "dotenv";
import {utilFunctions} from "./functions.js";

/**
 * Singleton Typed Wrapper class for .env fields
 */
export default class Environment {

    private static INSTANCE: Environment;

    DiscordToken: string;
    OwnerId: Snowflake;
    BotId: Snowflake;

    DevMode: boolean;
    TestingServers: Snowflake[];

    CurseForgeAPIKey: string;

    private constructor() {
        if (!utilFunctions.allDefined([process.env.DISCORD_TOKEN, process.env.OWNER_ID, process.env.BOT_ID, process.env.CURSEFORGE_API_KEY]))
            throw Error("One or more required Environment Constants are not defined, please review your .env file!")


        this.DiscordToken = process.env.DISCORD_TOKEN!;
        this.OwnerId = process.env.OWNER_ID!;
        this.BotId = process.env.BOT_ID!;
        this.DevMode = process.env.DEV_MODE?.toUpperCase() === "TRUE"
        if (process.env.TESTING_SERVER1 || process.env.TESTING_SERVER2)
            this.TestingServers = utilFunctions.filterDefined([process.env.TESTING_SERVER1, process.env.TESTING_SERVER2])
        this.CurseForgeAPIKey = process.env.CURSEFORGE_API_KEY!;
    }

    /**
     * Initializes Environment via dotenv
     */
    public static get(): Environment {
        if (!this.INSTANCE) {
            config();  //load .env file
            this.INSTANCE = new Environment();
        }
        return this.INSTANCE;
    }
    
}