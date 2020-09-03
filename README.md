# Curse Updates

A discord bot that has the purpose to announce new updates for mods, modpacks and other projects on [CurseForge](http://www.curseforge.com/minecraft)

It can announce new versions of:<br>
- Mods
- Modpacks
- Resource Packs
- Worlds

### Reporting Bugs / Suggesting Features
If you're having issues with the bot or you would like to suggest a new feature, please consider opening a new bug report thread on the [issue tracker](https://github.com/Davoleo/curse-updates/issues).

### Inviting the original version of this bot.
**At the moment this bot is in experimental state**, so I should stress that the invite link *is not* public for this reason, if you're a modpack or a mod developer that is at least moderately famous for a specific Curseforge Project project we can discuss it on my Discord Server at http://discord.davoleo.net and I might give you the invite link for the main bot version that is running on my VPS. Although don't take for granted that you'll get access to this version since I don't want it to spread too much yet.<br>
*I may publish the invite link in the future when the project is a bit more stable*.

### Running your own version of this bot (Self-Hosting)
If you want to self-host this discord bot you can do so by following these steps:<br>
- Download/Clone the project sources from Github _(the green button)_
- Create a new `cfg.json` file in the `src` directory
- Fill `cfg.json` with this template replacing the dummy data with your configuration options:
```json
{
  "prefix": "||",
  "token": "<Your Application Token>",
  "serverConfig": {
    
  }
}
```
_(note that the prefix should be maximum 3 chars long)_
_(you should replace the discord client token to start the bot with your own (you can get one in the Discord Applications dev portal))_
- To build the bot open a terminal in the main directory and run this command: `npm run build`
- To start it run `npm run bot` in the same directory as before
- Invite the bot to your server and enjoy :)
