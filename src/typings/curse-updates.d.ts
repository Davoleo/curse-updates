import { BotConfig } from "../model/BotConfig";

declare module "../cfg.json" {
    const value: BotConfig;
    export default value;
}