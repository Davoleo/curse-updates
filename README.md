# Curse Updates

A discord bot that has the purpose to announce new updates for mods, modpacks and other projects on [CurseForge](http://www.curseforge.com/minecraft)

It can announce new versions of:<br>
- Mods
- Modpacks
- Resource Packs
- Worlds

### Reporting Bugs / Suggesting Features
If you're having issues with the bot or you would like to suggest a new feature, please consider opening a new bug report thread on the [issue tracker](https://github.com/Davoleo/curse-updates/issues).

### Inviting this bot
At the moment this bot is in experimental state, if you'd like to try it out join my Discord Server at http://discord.davoleo.net and ask me there.<br>
I may publish the invite link in the future when the project is a bit more stable

### Self-Hosting
If you want to self-host this discord bot you can do so by following these steps:<br>
- Download/Clone the project sources from Github _(the green button)_
- Create a new `cfg.json` file inside the bot directory _(**not** inside the src directory)_
- Fill `cfg.json` with this template replacing the dummy data with your configuration:
```json
{
  "prefix": "||",
  "token": "<Your Application Token>",
  "serverConfig": {
    
  }
}
```
_(note that the prefix should be maximum 3 chars long)_
_(you should replace the discord client token to start the bot with your own)_
- To run the bot just open a terminal in the main directory and run this command: `npm run bot`
- Invite the bot to your server and enjoy :)