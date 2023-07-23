import { CurseHelper } from "../curseHelper.js";

export default class GameTag {
    constructor(public game: string, public tag: string) {}

    join(): string {
        return `${this.game}:${this.tag}`
    }

    validate(): void {
        const gameId = CurseHelper.GameSlugs.get(this.game)

        if (!gameId)
            throw Error("Invalid game: " + this.game + "!")

        const versions = CurseHelper.GameVersions.get(gameId)
        if (!versions || !versions.has(this.tag))
            throw Error("Invalid version: " + this.tag + "!")
    }

    static fromString(serialized: string): GameTag {
        const separator = serialized.indexOf(':');
        const game = serialized.substring(0, separator);
        return new GameTag(game, serialized.substring(separator + 1));
    }
}