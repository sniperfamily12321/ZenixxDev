require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID; // Optional: For instant guild-level command testing

if (!token || !clientId) {
  console.error('❌ ERROR: Missing DISCORD_TOKEN or DISCORD_CLIENT_ID in your .env configuration.');
  process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

console.log('🤖 Reading command structure from /commands disk folder...');

for (const file of commandFiles) {
  // Clear require cache to reload smoothly
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  
  if (command.prefixOnly) {
    console.log(`ℹ️ [Skipped] "${command.name}" is marked as Prefix Only.`);
    continue;
  }
  
  if (command.name && command.description) {
    const slashData = {
      name: command.name,
      description: command.description,
      options: command.slashOptions || []
    };
    
    commands.push(slashData);
    console.log(`🚀 [Ready] Loaded Slash Definition: /${command.name}`);
  }
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log(`\n⚡ Publishing ${commands.length} application (/) commands into Discord API gates...`);

    if (guildId) {
      // Instant development registration inside the specified test server
      await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands }
      );
      console.log(`✅ SUCCESS: Instant guild slash commands deployed on Guild ID: ${guildId}`);
    } else {
      // Global production registration (takes up to an hour to populate across all user servers)
      await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands }
      );
      console.log('✅ SUCCESS: Global slash commands deployed successfully across all guilds.');
    }
  } catch (error) {
    console.error('❌ FAILED: Error deploying slash command payload:', error);
  }
})();
