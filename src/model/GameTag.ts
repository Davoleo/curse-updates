export default class GameTag {
    constructor(public game: number, public tag: string) {}

    join(): string {
        return `${this.game}:${this.tag}`
    }

    static fromString(serialized: string): GameTag {
        const separator = serialized.indexOf(':');
        const game = Number(serialized.substring(0, separator));
        return new GameTag(game, serialized.substring(separator + 1));
    }
}