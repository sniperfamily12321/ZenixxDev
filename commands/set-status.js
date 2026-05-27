const { EmbedBuilder, ActivityType } = require('discord.js');
const { readConfig, writeConfig } = require('../utils/configManager');

module.exports = {
  name: 'set-status',
  description: 'Adjust the current bot client activity and status message (Owner Only).',
  category: 'Configuration',
  ownerOnly: true,
  slashOptions: [
    {
      name: 'type',
      description: 'The type of presence activity',
      type: 3, // String
      required: true,
      choices: [
        { name: 'Playing', value: 'playing' },
        { name: 'Watching', value: 'watching' },
        { name: 'Listening', value: 'listening' },
        { name: 'Streaming', value: 'streaming' }
      ]
    },
    {
      name: 'status_text',
      description: 'Status message to display',
      type: 3, // String
      required: true
    }
  ],

  async execute(message, args, client, config) {
    if (message.author.username !== config.ownerUsername) {
      return message.reply('❌ **Access Denied**: This administrative utility is restricted to `zenixx.dev`.');
    }

    const typeArg = args[0]?.toLowerCase();
    const statusText = args.slice(1).join(' ');

    const validTypes = ['playing', 'watching', 'listening', 'streaming'];

    if (!typeArg || !statusText || !validTypes.includes(typeArg)) {
      return message.reply(`⭐ **Current Status**: \`${config.statusType}\` - "${config.status}"\nUse: \`${config.prefix}set-status <playing|watching|listening|streaming> <status text>\``);
    }

    this.setStatus(client, config, typeArg, statusText);

    const embed = new EmbedBuilder()
      .setTitle('🌐 Presence Activity Adjusted')
      .setDescription(`The client's presence status has been updated and saved.`)
      .addFields(
        { name: '🎮 Activity Type', value: `\`${typeArg.toUpperCase()}\``, inline: true },
        { name: '💬 Custom Text', value: `"${statusText}"`, inline: true }
      )
      .setColor('#9B59B6')
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction, client, config) {
    if (interaction.user.username !== config.ownerUsername) {
      return interaction.reply({ content: '❌ **Access Denied**: This administrative utility is restricted to `zenixx.dev`.', ephemeral: true });
    }

    const typeArg = interaction.options.getString('type');
    const statusText = interaction.options.getString('status_text');

    this.setStatus(client, config, typeArg, statusText);

    const embed = new EmbedBuilder()
      .setTitle('🌐 Presence Activity Adjusted')
      .setDescription(`The client's presence status has been updated and saved.`)
      .addFields(
        { name: '🎮 Activity Type', value: `\`${typeArg.toUpperCase()}\``, inline: true },
        { name: '💬 Custom Text', value: `"${statusText}"`, inline: true }
      )
      .setColor('#9B59B6')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },

  setStatus(client, config, typeStr, text) {
    let actType = ActivityType.Playing;
    if (typeStr === 'watching') actType = ActivityType.Watching;
    else if (typeStr === 'listening') actType = ActivityType.Listening;
    else if (typeStr === 'streaming') actType = ActivityType.Streaming;

    const streamUrl = typeStr === 'streaming' ? 'https://twitch.tv/zenixxdev' : undefined;

    client.user.setPresence({
      activities: [{
        name: text,
        type: actType,
        url: streamUrl
      }],
      status: 'online'
    });

    // Write back to persist configuration
    const currentConfig = readConfig();
    currentConfig.status = text;
    currentConfig.statusType = typeStr.toUpperCase();
    writeConfig(currentConfig);

    // Update operational config reference
    config.status = text;
    config.statusType = typeStr.toUpperCase();
  }
};
