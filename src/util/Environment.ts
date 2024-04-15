import {Snowflake} from "discord.js";
import {config} from "dotenv";
import {utilFunctions} from "./functions.js";
import {Logger, LogLevel, LogLevelNames} from "./log.js";

/**
 * Singleton Typed Wrapper class for .env fields
 */
export default class Environment {

    private static INSTANCE: Environment;

    DiscordToken: string;
    OwnerId: Snowflake | undefined;
    BotId: Snowflake;

    DevMode: boolean;
    TestingServers: Snowflake[];
    LogLevel: LogLevel;

    CurseForgeAPIKey: string;

    private constructor() {
        const env = process.env;

        if (!utilFunctions.allDefined([env.DISCORD_TOKEN, env.OWNER_ID, env.BOT_ID, env.CURSEFORGE_API_KEY]))
            throw Error("One or more required Environment Constants are not defined, please review your .env file!")


        this.DiscordToken = env.DISCORD_TOKEN!;
        this.OwnerId = env.OWNER_ID;
        this.BotId = env.BOT_ID!;
        this.DevMode = env.DEV_MODE?.toUpperCase() === "TRUE"
        if (env.TESTING_SERVER1 || env.TESTING_SERVER2)
            this.TestingServers = utilFunctions.filterDefined([env.TESTING_SERVER1, env.TESTING_SERVER2])
        this.LogLevel = Logger.logLevelByName(env.LOG_LEVEL as LogLevelNames | undefined) ?? LogLevel.DEBUG;
        this.CurseForgeAPIKey = env.CURSEFORGE_API_KEY!;
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