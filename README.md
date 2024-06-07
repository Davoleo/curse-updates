# Curse Updates

A discord bot that has the purpose of announcing new updates of projects on [CurseForge](http://www.curseforge.com)


The bot can detect new updates of:<br>
- Mods
- Modpacks
- Resource Packs
- Worlds
- Mods and Modpacks from other games supported on Curseforge

#### Example Update Message
![example](https://i.imgur.com/uvrivD1.png)

### Reporting Bugs / Suggesting Features
If you're having issues with the bot, or you would like to suggest a new feature, please consider opening a new bug report thread on the [issue tracker](https://github.com/Davoleo/curse-updates/issues).


### Inviting the original version of this bot.
**If you use and appreciate this bot consider supporting me on [Patreon, PayPal or Ko-Fi](https://davoleo.net/donate)**:
incomes help me to pay the hosting prices of my VPS so any donated amount is greatly appreciated!
The new version has just released so beware that there might be problems that require the bot to be offline for maintenance or working partially.
The original version of this bot runs on my VPS, you can invite this version of the bot via [this link](https://discordapp.com/api/oauth2/authorize?client_id=658271214116274196&permissions=537193552&scope=bot).

### Running your own version of this bot (Self-Hosting)
If you want to self-host this discord bot you can do so by following these steps:<br>
- Download/Clone the project sources from GitHub _(the green button)_
- Create a new file named `.env` in the root of the bot directory
- Fill `.env` with this template replacing the dummy data with your configuration options:
```dotenv
# Discord
DISCORD_TOKEN=<Discord Application Token>
OWNER_ID=<Owner Permission Level User Id>
BOT_ID=<Discord Application ID>

# Development
# If DEV_MODE is set to true the bot will only work on the 2 testing server specified below (no more no less)
# Currently ONLY DEV_MODE = TRUE is supported
DEV_MODE=TRUE
TESTING_SERVER1=<first ID of the discord server you want the bot to work on>
TESTING_SERVER2=<second ID of the discord server you want the bot to work on>
# LOG_LEVEL=DEBUG # Minimum log level severity (remove first # to uncomment) [default value: DEBUG] {possible values: ERROR, WARN, INFO, DEBUG} 

# CurseForge
CURSEFORGE_API_KEY=<Curseforge API Key>
```
- _(Optional)_ Open `config.json` in the main directory and change config values based on your personal preference
- Open a terminal in the main directory of the bot and run `npm install` to install dependencies
- Initialize the database with `npx prisma migrate deploy`
- Then compile typescript source files with `npm run build`
- Then you can actually start the bot with `npm run bot`
- Invite the bot to your server and enjoy :)
