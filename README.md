# Discord Ticket Bot (v14)

## Setup
1. Node 18+ recommended.
2. `npm i` and `npm install discord.js dotenv nanoid fs-extra pretty-ms`
3. Create `.env` with:
   - DISCORD_TOKEN=YOUR_BOT_TOKEN
   - CLIENT_ID= YOUR_BOT_CLIENT_ID
   - (optional) GUILD_ID=YOUR_SERVER_ID
4. In `src/config/config.js`, fill in:
   - roles.staffRoleId
   - categories.openCategoryId, categories.closedCategoryId
   - channels.logChannelId
5. Deploy slash commands:
   - `npm run deploy`
6. Start:
   - `npm start`

## Usage
- `/panel` to post the **Open Ticket** panel.
- Users click **Open Ticket** → modal collects subject + description → channel is created in your **open** category.
- Staff tools:
  - Buttons: **Claim**, **Rename**, **Lock**, **Archive** and **Close**
  - Commands: `/add`, `/remove`, `/claim`, `/unclaim`, `/lock`, `/unlock`
- Closing moves the channel to the **closed** category and posts an **HTML transcript** (also logged).

## Notes
- Cooldown & max-open limits are in `config.js`.
- Data is file-based JSON for simplicity; swap to a DB if you prefer.
- Transcripts saved in `/transcripts`. They’re also attached to the archived channel and logged.
