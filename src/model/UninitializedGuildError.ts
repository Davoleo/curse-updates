import {Snowflake} from "discord.js";

export default class UninitializedGuildError extends Error {
    constructor(public serverId: Snowflake) {
        super();
    }
}