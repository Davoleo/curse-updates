# Curse-Updates Changelog

### 1.0.2
- Improve cache cleanup operations
- Fixed database data cleanup when the bot is removed from a server
- updated Prisma dependencies

### 1.0.1
- Allow Slash commands to be registered globally [in all guilds the bot is part of]
- Fixed seeding script
- Adjusted `scheduler.ts` interval 15min → 60min
- Fix `schedule remove` command argument (project id)
  - Argument is now mandatory
  - Fixed parameter name
- Updated CurseForge release embed colors to match new website
- Decreased release embed description (changelog) character limit to 3700 (will continue to monitor this value and if needed decrease it even more)
- Fix `scheduler.ts` issue where it would try sending updates when there weren't any
- Fixed typo in bot status activity
- Fixed database issue when adding a CF project that was already cached
- Change release embed title URL to contain a link to the new release instead of the project (project link still exists at the bottom of the embed)
- change "Checking for updates..." log line severity `INFO` → `DEBUG`
- Exceptions that get out of hand and reach top level handler are now caught (but more logging calls are done as well as sending a DM to the bot owner to notify the exception happened).
- `BOT_OWNER` environment variable is now optional, omitting it will disable:
  - DM notifications from the bot when errors occur
  - Bot Owner permission level commands
- new optional environment variable `LOG_LEVEL` to specify the minimum severity log level to write to the log file (console will still output all log levels) 

### 1.0.0
- Complete Rewrite from scratch to be more optimized.
- Now uses _new_ official Curseforge API
- Back-end persistence is now achieved using Prisma + SQLite.
- The bot now supports Slash Commands!
- New Features:
  - Project Updates now show changelogs!
  - multiple update configs supported to distribute updates in different discord channels and filter them however you want.
  - Every update config also can have a dedicated message with optional role mention.
  - Project Updates can now be filtered by: game versions, game tags, project ids

### 0.1.1
- Worked on catching many errors also adding some more user-friendly and detailed messages
- Fixed logic flaws
- Updated to work with a newer version of mca
- Restyled Update Embeds
  - Added total mod downloads
  - Added mod update file size
- Improved UX of the `help` command
- Hopefully addressed many unhandled promises that might crash the bot

### 0.1.0
- Debut: First Public Version