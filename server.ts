import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper to load live configs
  const configPath = path.join(process.cwd(), 'config.json');
  function readConfig() {
    try {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch {
      return { prefix: '?', ownerUsername: 'zenixx.dev', status: 'working for zenixx dev', statusType: 'PLAYING', roles: [], channels: [] };
    }
  }

  // 1. Get current bot status & client diagnostics
  app.get('/api/status', (req, res) => {
    let discordClient;
    try {
      discordClient = require('./index.js');
    } catch (e) {
      // not initialized yet
    }

    const currentConfig = readConfig();

    if (discordClient && discordClient.isReady()) {
      const guilds = discordClient.guilds.cache.map((g: any) => ({
        id: g.id,
        name: g.name,
        memberCount: g.memberCount,
        acronym: g.nameAcronym,
      }));

      return res.json({
        online: true,
        tag: discordClient.user?.tag,
        id: discordClient.user?.id,
        avatar: discordClient.user?.displayAvatarURL() || '',
        guilds: guilds,
        prefix: currentConfig.prefix,
        owner: currentConfig.ownerUsername,
        status: currentConfig.status,
        statusType: currentConfig.statusType,
      });
    } else {
      return res.json({
        online: false,
        prefix: currentConfig.prefix,
        owner: currentConfig.ownerUsername,
        status: currentConfig.status,
        statusType: currentConfig.statusType,
        hasToken: !!process.env.DISCORD_TOKEN,
      });
    }
  });

  // 2. Save modified configuration settings
  app.post('/api/config', (req, res) => {
    try {
      const { prefix, ownerUsername, status, statusType, roles, channels } = req.body;
      const currentConfig = readConfig();

      if (prefix !== undefined) currentConfig.prefix = prefix;
      if (ownerUsername !== undefined) currentConfig.ownerUsername = ownerUsername;
      if (status !== undefined) currentConfig.status = status;
      if (statusType !== undefined) currentConfig.statusType = statusType;
      if (roles !== undefined) currentConfig.roles = roles;
      if (channels !== undefined) currentConfig.channels = channels;

      fs.writeFileSync(configPath, JSON.stringify(currentConfig, null, 2), 'utf8');

      // Attempt to live update current bot client presence
      try {
        const discordClient = require('./index.js');
        if (discordClient && discordClient.isReady()) {
          const { ActivityType } = require('discord.js');
          let actType = ActivityType.Playing;
          const typed = currentConfig.statusType.toLowerCase();
          if (typed === 'watching') actType = ActivityType.Watching;
          else if (typed === 'listening') actType = ActivityType.Listening;
          else if (typed === 'streaming') actType = ActivityType.Streaming;

          discordClient.user.setPresence({
            activities: [{
              name: currentConfig.status,
              type: actType,
              url: typed === 'streaming' ? 'https://twitch.tv/zenixxdev' : undefined
            }]
          });
        }
      } catch (e) {
        // live update skipped
      }

      return res.json({ success: true, config: currentConfig });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. Register credentials & login Bot dynamically
  app.post('/api/credentials', async (req, res) => {
    try {
      const { token, clientId, guildId } = req.body;

      if (!token) {
        return res.status(400).json({ success: false, error: 'Token is required.' });
      }

      // Inject dynamically to environment memory
      process.env.DISCORD_TOKEN = token;
      if (clientId) process.env.DISCORD_CLIENT_ID = clientId;
      if (guildId) process.env.DISCORD_GUILD_ID = guildId;

      console.log('⚡ New credentials supplied. Attempting dynamic connection...');

      const discordClient = require('./index.js');

      if (discordClient.isReady()) {
        try {
          await discordClient.destroy();
        } catch {
          // ignore destroy failure
        }
      }

      await discordClient.login(token);

      return res.json({
        success: true,
        tag: discordClient.user?.tag,
        id: discordClient.user?.id,
        online: true
      });
    } catch (err: any) {
      console.error('Dynamic login error:', err);
      // Clean stale token so we don't retry forever on crashes
      process.env.DISCORD_TOKEN = '';
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. Trigger Programmatic Deployment of slash commands over HTTP post
  app.post('/api/deploy-slash', async (req, res) => {
    try {
      const { REST, Routes } = require('discord.js');
      const token = process.env.DISCORD_TOKEN;
      const clientId = process.env.DISCORD_CLIENT_ID;
      const guildId = process.env.DISCORD_GUILD_ID;

      if (!token || !clientId) {
        return res.status(400).json({ success: false, error: 'DISCORD_TOKEN and DISCORD_CLIENT_ID must be configured in environment first.' });
      }

      const commands: any[] = [];
      const commandsPath = path.join(process.cwd(), 'commands');
      const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

      for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        // Delete requiring cache to fetch fresh code edits
        delete require.cache[require.resolve(filePath)];
        const command = require(filePath);
        
        if (command.prefixOnly) continue;

        if (command.name && command.description) {
          commands.push({
            name: command.name,
            description: command.description,
            options: command.slashOptions || []
          });
        }
      }

      const rest = new REST({ version: '10' }).setToken(token);
      let deployResult = '';

      if (guildId) {
        await rest.put(
          Routes.applicationGuildCommands(clientId, guildId),
          { body: commands }
        );
        deployResult = `Successfully deployed ${commands.length} commands to server ID: ${guildId}`;
      } else {
        await rest.put(
          Routes.applicationCommands(clientId),
          { body: commands }
        );
        deployResult = `Successfully deployed ${commands.length} commands globally to all guilds.`;
      }

      return res.json({ success: true, message: deployResult, commandNames: commands.map(c => c.name) });
    } catch (err: any) {
      console.error('REST Deployment error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Serve Vite or Static files depending on mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Pre-load Bot if token is present
  if (process.env.DISCORD_TOKEN && process.env.DISCORD_TOKEN !== 'YOUR_DISCORD_TOKEN_HERE') {
    try {
      console.log('⚡ Boot preloading current Discord Bot client...');
      require('./index.js');
    } catch (err: any) {
      console.warn('Bot preloader deferred:', err.message);
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`📡 Control center running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
