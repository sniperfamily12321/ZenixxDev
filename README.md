# 👑 ZENIXX DEV - Premium Discord Automator

A production-ready, highly polished, robust, dual-mode (slash & prefix commands) Discord bot designed for **ZENIXX DEV**. It includes a lightweight Express-powered web control dashboard that allows configurations syncing and triggers live REST deployments directly from the browser viewport.

---

## ✨ Primary Capabilities

1. **Dual Command Parsing** — Supports both traditional prefix commands (trigger characters customizable dynamically) and modern Discord `/` slash commands, with programmatic protection mechanisms preventing logic duplication.
2. **Server Structurator & Builder** — Auto-deploys custom premium categories, structured role lists, and channels configured directly in a modular `config.json` file.
3. **Screenshot Theme Pattern** — Implements Discord aesthetic styling conforming with emoji keys and dot dividers:
   - Channels: `📢・server・updates`, `🎫・open・ticket`.
   - Role Banners: `👑 ． OWNER ． <3`, `． Members ． <3`.
4. **Vertical Hierarchy Aligner** — Auto-sorts and arranges vertical position orders on created custom roles below the client integration layer safely.
5. **Presence Manager** — Supports dynamic modification of custom statuses (Playing, Watching, Listening, Streaming, Competing) and saves settings persistently across thread reboots.
6. **Hard Reset Dev Safebound** — Offers a teardown function to safely remove created roles and channels in a single transaction, making design testing very satisfying.
7. **Modular Administration Gates** — Limits server building commands strictly to username `zenixx.dev`. Restricts Help boards for non-privileged members to locked system menus.

---

## 📂 Minimal Project Tree

```text
├── index.html                  # Frontend index document
├── package.json                # Project script, dependency manifestations
├── tsconfig.json               # Type definition paths rules
├── vite.config.ts              # Bundler configuration file
├── server.ts                   # Full-Stack developer backend server & API daemon
├── index.js                    # Bot client core entry point
├── deploy-commands.js          # REST Registrar CLI for Slash Commands
├── config.json                 # Core layouts & configurable name attributes
├── .env.example                # Template for server host strings and secrets
├── utils/
│   └── configManager.js        # read/write handler for config.json files
├── commands/
│   ├── help.js                 # Conditional help boards controller
│   ├── ping.js                 # Gateway latency evaluator
│   ├── bot-info.js             # Diagnostic telemetry card reports
│   ├── set-prefix.js           # Live prefix symbol modifier
│   ├── set-status.js           # Live status activity modifier
│   ├── setup-server.js         # Master prefix builder (owner restricted)
│   ├── create-roles.js         # Independent custom role deployer
│   ├── create-channels.js      # Category boxes constructor
│   ├── set-permissions.js      # Permissions lock-down overrides sync
│   ├── set-role-position.js    # Hierarchy vertical sorting module
│   ├── role-styler.js          # Role layout auditor
│   └── reset-setup.js          # Channel & role wiper
└── src/
    ├── App.tsx                 # Web panel management client
    ├── main.tsx                # Client bundle mounting entry
    └── index.css               # Styled font assets & tailwind directives
```

---

## 🛠️ Step-by-Step Installation

### Prerequisites
- [Node.js](https://nodejs.org) (v18.0.0 or higher recommended)
- **Privileged Gateway Intents enabled** in the Discord Developer Portal:
  - Scroll tab: "Bot"
  - Turn ON: **Presence Intent**, **Server Members Intent**, and **Message Content Intent**.

### Standard Setup & Running
1. Clone your project:
   ```bash
   git clone <YOUR_REPOSITORY_URL>
   cd react-example
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Create your `.env` configuration file from the template:
   ```bash
   cp .env.example .env
   ```
4. Enter values in `.env`:
   - `DISCORD_TOKEN`: Your bot application's credentials token.
   - `DISCORD_CLIENT_ID`: Application client ID numbers.
   - `DISCORD_GUILD_ID`: Optional server ID for instantaneous command updates.
   - `GEMINI_API_KEY`: API Key (optional backend dependencies).
5. Start the web control panel and bot dynamically:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` inside your browser to access the control panel dashboard!

---

## 📱 Running on Mobile / Termux

To run this platform directly on mobile environments utilizing Termux:

1. Update native package list and install Node modules inside Termux:
   ```bash
   pkg update && pkg upgrade
   pkg install nodejs-lts git
   ```
2. Clone, setup dependencies, configure environment properties, and run solely the backend bot client offline without mounting browser servers:
   ```bash
   npm install
   node index.js
   ```
   *Prefix commands will parse perfectly as long as Message Content and Server Members intents are enabled.*

---

## 🤖 Administrative Setup Execution Flow

1. Invite the bot link generated in the Developer Portal with **Administrator** permissions.
2. In your Discord server, navigate to **Server Settings** -> **Roles** and drag your Bot's Integration Role (usually matching the Bot's exact label) to the **very top of the hierarchy list**. (Failure to perform this step will result in missing permissions when trying to set custom roles positions).
3. Log in under the exact Account Username **`zenixx.dev`**.
4. Type **`?setup-server`** (assuming default token prefix is `?`) inside a channel.
5. Watch the automated sequence construct the channels, categories, styled roles, lock-tight permissions, and arrange them into vertical ranking hierarchy cleanly!

---

## 📐 Modifying the Schemas

To change how channels inside categories look or adjust default hex colors of staff roles, you do not need to rewrite bot JavaScript modules. Simply open `/config.json` inside this repository and edit the JSON structures:

- Edit `"prefix"` to adjust command activations.
- Edit `"roles"` list properties to append metadata, positions, hoist states, permissions, color values.
- Edit `"channels"` category structures to customize lists of rooms, text types, voice types, and topic explanations.

Run `?reset-setup` to erase, modify configurations, and run `?setup-server` to build updated layouts securely!
All logs will capture gracefully in the terminal.

---

## 📝 CLI Reference Commands

| Command | Category | Slash Support | Hierarchy Restriction | Description |
| :--- | :--- | :---: | :--- | :--- |
| `?help` | Utility | Yes | None | Opens the interactive helper menus based on clearance. |
| `?ping` | Utility | Yes | None | Checks Gateway latency times. |
| `?bot-info` | Utility | Yes | None | Telemetry reports. |
| `?set-prefix` | Configuration | Yes | `zenixx.dev` | Change commands trigger prefix. |
| `?set-status` | Configuration | Yes | `zenixx.dev` | Changes current bot presence. |
| `?create-roles` | Automation | No | `zenixx.dev` | Creates only styled role nodes. |
| `?create-channels`| Automation | No | `zenixx.dev` | Generates channels tree directly. |
| `?set-permissions`| Automation | No | `zenixx.dev` | Locks channel locks. |
| `?set-role-position`| Automation| No | `zenixx.dev` | Aligner index sorter. |
| `?role-styler` | Automation | No | `zenixx.dev` | Audit checks of role nodes. |
| `?reset-setup` | Automation | Yes | `zenixx.dev` | Purges server elements from config. |
| `?setup-server` | Automation | No (*Prefix Only*) | `zenixx.dev` | Master sequential server setup execution. |
