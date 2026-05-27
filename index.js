require('dotenv').config();
const { 
  Client, 
  GatewayIntentBits, 
  Partials, 
  Collection, 
  ActivityType, 
  EmbedBuilder 
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const { readConfig } = require('./utils/configManager');

// Load dynamic config specifications
let config = readConfig();

// Initialize client with proper Gateway Intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // REQUIRED for Prefix Command Parsing
    GatewayIntentBits.GuildMembers,    // REQUIRED for Creating & Arranging Roles
    GatewayIntentBits.GuildVoiceStates // Voice Channels Support
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction
  ]
});

// Register Commands collection
client.commands = new Collection();

// Command Loader
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  
  console.log('📦 Loading server commands...');
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    try {
      const command = require(filePath);
      if (command.name) {
        client.commands.set(command.name, command);
        console.log(`✅ Loaded command: ${command.name}`);
      }
    } catch (err) {
      console.error(`❌ Failed to load command at ${file}:`, err);
    }
  }
} else {
  console.warn('⚠️ Commands folder not found at', commandsPath);
}

// -----------------------------------------------------------------
// EVENT: Client Ready
// -----------------------------------------------------------------
client.once('ready', () => {
  console.log('\n=============================================');
  console.log(`🔥 ZENIXX DEV Core System Enabled`);
  console.log(`🤖 Logged in as: ${client.user.tag}`);
  console.log(`⚙️  Active Guilds: ${client.guilds.cache.size}`);
  console.log(`📊 Total Users: ${client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0)}`);
  console.log('=============================================\n');

  // Load configured status & activity
  try {
    let actType = ActivityType.Playing;
    const configuredType = (config.statusType || 'PLAYING').toLowerCase();
    
    if (configuredType === 'watching') actType = ActivityType.Watching;
    else if (configuredType === 'listening') actType = ActivityType.Listening;
    else if (configuredType === 'streaming') actType = ActivityType.Streaming;

    const streamUrl = configuredType === 'streaming' ? 'https://twitch.tv/zenixxdev' : undefined;
    const statusMsg = config.status || 'working for zenixx dev';

    client.user.setPresence({
      activities: [{
        name: statusMsg,
        type: actType,
        url: streamUrl
      }],
      status: 'online'
    });
    console.log(`🌐 Presence loaded: "${configuredType.toUpperCase()} - ${statusMsg}"`);
  } catch (err) {
    console.error('Could not apply presence stats on login:', err);
  }

  console.log(`\n💡 INSTRUCTION: Make sure to toggle on the "Message Content Intent" in your Discord Developer portal tab to process Prefix Commands.\n`);
});

// -----------------------------------------------------------------
// EVENT: Message Created (Prefix Commands Router)
// -----------------------------------------------------------------
client.on('messageCreate', async (message) => {
  // Ignore fellow bots and webhook messages
  if (message.author.bot || message.webhookId) return;

  // Read latest live prefix config (in case changed in real-time)
  config = readConfig();
  const prefix = config.prefix || '?';

  // Check prefix match
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  // Administrative restriction validation
  if (command.ownerOnly && message.author.username !== config.ownerUsername) {
    return message.reply(`❌ **Access Denied**: Only the project administrator, **\`${config.ownerUsername}\`**, can execute this command.`);
  }

  // Execute Command
  try {
    console.log(`[PrefixCmd] ${message.author.tag} executed: ${prefix}${commandName}`);
    await command.execute(message, args, client, config);
  } catch (error) {
    console.error(`Error executing prefix command: ${commandName}`, error);
    const errEmbed = new EmbedBuilder()
      .setTitle('⚠️ Operational Execution Failure')
      .setDescription(`An unexpected error occurred while processing command \`${commandName}\`.`)
      .addFields({ name: 'Error Info', value: `\`\`\`js\n${error.message}\n\`\`\`` })
      .setColor('#E74C3C')
      .setTimestamp();
    
    await message.reply({ embeds: [errEmbed] }).catch(() => {});
  }
});

// -----------------------------------------------------------------
// EVENT: Interaction Created (Slash Commands Router)
// -----------------------------------------------------------------
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) {
    return interaction.reply({ content: '❌ Command definition not registered on client memory.', ephemeral: true });
  }

  // Read latest configs
  config = readConfig();

  // Administrative restriction validation
  if (command.ownerOnly && interaction.user.username !== config.ownerUsername) {
    return interaction.reply({ 
      content: `❌ **Access Denied**: Only the project administrator, **\`${config.ownerUsername}\`**, can execute this command.`, 
      ephemeral: true 
    });
  }

  // Execute Slash command
  try {
    console.log(`[SlashCmd] ${interaction.user.tag} executed: /${interaction.commandName}`);
    
    // Check if the command doesn't have executeSlash (e.g., prefixOnly)
    if (!command.executeSlash || command.prefixOnly) {
      return interaction.reply({ 
        content: `❌ **Operational Error**: This setup command is marked as prefix-only. Use \`${config.prefix}${command.name}\` inside a text channel.`, 
        ephemeral: true 
      });
    }

    await command.executeSlash(interaction, client, config);
  } catch (error) {
    console.error(`Error executing slash command: ${interaction.commandName}`, error);
    
    const errEmbed = new EmbedBuilder()
      .setTitle('⚠️ Operational Execution Failure')
      .setDescription(`An unexpected error occurred while processing interaction \`/${interaction.commandName}\`.`)
      .addFields({ name: 'Error Info', value: `\`\`\`js\n${error.message}\n\`\`\`` })
      .setColor('#E74C3C')
      .setTimestamp();

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ embeds: [errEmbed] }).catch(() => {});
    } else {
      await interaction.reply({ embeds: [errEmbed], ephemeral: true }).catch(() => {});
    }
  }
});

// Login Bot client if Token is set
const token = process.env.DISCORD_TOKEN;
if (token && token !== 'YOUR_DISCORD_TOKEN_HERE' && token !== '') {
  client.login(token).catch(err => {
    console.error('❌ Failed to login Discord Bot client. Check if token is valid:', err.message);
  });
} else {
  console.log('ℹ️  STATUS: DISCORD_TOKEN is missing or empty in environment. Running offline companion services only.');
}

module.exports = client;
