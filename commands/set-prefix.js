const { EmbedBuilder } = require('discord.js');
const { readConfig, writeConfig } = require('../utils/configManager');

module.exports = {
  name: 'set-prefix',
  description: 'Modify the command registration symbol for prefix activations (Owner Only).',
  category: 'Configuration',
  ownerOnly: true,
  slashOptions: [
    {
      name: 'symbols',
      description: 'The new activation prefix (e.g. !, $, ?)',
      type: 3, // String type
      required: true
    }
  ],

  async execute(message, args, client, config) {
    if (message.author.username !== config.ownerUsername) {
      return message.reply('❌ **Access Denied**: This administrative utility is restricted to `zenixx.dev`.');
    }

    const newPrefix = args[0];
    if (!newPrefix) {
      return message.reply(`⭐ **Current Prefix**: \`${config.prefix}\`\nUse: \`${config.prefix}set-prefix <new_prefix>\` to modify.`);
    }

    if (newPrefix.length > 5) {
      return message.reply(`❌ **Input Overload**: Prefix length cannot exceed 5 characters.`);
    }

    const currentConfig = readConfig();
    currentConfig.prefix = newPrefix;
    writeConfig(currentConfig);

    // Dynamic cache update
    config.prefix = newPrefix;

    const embed = new EmbedBuilder()
      .setTitle('⚙️ System Configuration Saved')
      .setDescription(`Admin prefix updated successfully and saved in persistent storage.`)
      .addFields(
        { name: '🆕 New Trigger Prefix', value: `\`${newPrefix}\``, inline: true },
        { name: '📝 Example command', value: `\`${newPrefix}help\``, inline: true }
      )
      .setColor('#2ECC71')
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction, client, config) {
    if (interaction.user.username !== config.ownerUsername) {
      return interaction.reply({ content: '❌ **Access Denied**: This administrative utility is restricted to `zenixx.dev`.', ephemeral: true });
    }

    const newPrefix = interaction.options.getString('symbols');
    if (newPrefix.length > 5) {
      return interaction.reply({ content: `❌ **Input Overload**: Prefix length cannot exceed 5 characters.`, ephemeral: true });
    }

    const currentConfig = readConfig();
    currentConfig.prefix = newPrefix;
    writeConfig(currentConfig);

    config.prefix = newPrefix;

    const embed = new EmbedBuilder()
      .setTitle('⚙️ System Configuration Saved')
      .setDescription(`Admin prefix updated successfully and saved in persistent storage.`)
      .addFields(
        { name: '🆕 New Trigger Prefix', value: `\`${newPrefix}\``, inline: true },
        { name: '📝 Example command', value: `\`${newPrefix}help\``, inline: true }
      )
      .setColor('#2ECC71')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
