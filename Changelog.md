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