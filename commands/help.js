const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Displays available commands based on user clearance.',
  category: 'Utility',
  ownerOnly: false,
  slashOptions: [],

  async execute(message, args, client, config) {
    const isOwner = message.author.username === config.ownerUsername;
    const embed = this.getHelpEmbed(isOwner, config, client);
    await message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction, client, config) {
    const isOwner = interaction.user.username === config.ownerUsername;
    const embed = this.getHelpEmbed(isOwner, config, client);
    await interaction.reply({ embeds: [embed] });
  },

  getHelpEmbed(isOwner, config, client) {
    if (!isOwner) {
      return new EmbedBuilder()
        .setTitle('🔒 ZENIXX DEV - Closed System')
        .setDescription('No commands are currently available to non-administrative staff.\n\nOnly the project administrator **`zenixx.dev`** has access to building, staging, and deploying server infrastructure.')
        .addFields(
          { name: '🌐 Project Link', value: 'Working for ZENIXX DEV' },
          { name: '🛡️ Authorization Needed', value: 'If you believe this is an error, contact `zenixx.dev` directly.' }
        )
        .setColor('#7F8C8D')
        .setFooter({ text: 'ZENIXX DEV Bot Core' })
        .setTimestamp();
    }

    return new EmbedBuilder()
      .setTitle('👑 ZENIXX DEV - Complete Admin Console & Commands')
      .setDescription(`Welcome back, **${config.ownerUsername}**! Here is the full capability listing for managing server arrays.`)
      .setColor('#FF0055')
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        {
          name: '⚙️ Core Management Commands',
          value: [
            `\`${config.prefix}help\` / \`/help\` - Displays this management panel.`,
            `\`${config.prefix}bot-info\` / \`/bot-info\` - Displays technical details about the client.`,
            `\`${config.prefix}ping\` / \`/ping\` - Check system connection latency.`,
            `\`${config.prefix}set-prefix <new_prefix>\` / \`/set-prefix\` - Set command activation characters.`,
            `\`${config.prefix}set-status <watching|playing|listening|streaming> <text>\` / \`/set-status\` - Modifies current bot presence activity.`
          ].join('\n')
        },
        {
          name: '🚀 Server Build Automation Commands',
          value: [
            `\`${config.prefix}setup-server\` (**Prefix Only** 👑) - Auto-creates the standardized workspace category framework, structured custom premium roles, and channels with specific overrides.`,
            `\`${config.prefix}create-roles\` - Creates all high-end styled roles automatically.`,
            `\`${config.prefix}create-channels\` - Deploys entire directory structure of premium category/channels.`,
            `\`${config.prefix}set-permissions\` - Establishes lock-tight access overrides and permissions automatically.`,
            `\`${config.prefix}set-role-position\` - Places and sorts created roles matching proper hierarchy order.`,
            `\`${config.prefix}role-styler\` - Formats and brands specific existing roles matching styled styles.`,
            `\`${config.prefix}reset-setup\` - Removes all channels and roles built by this bot so you can cleanly start fresh.`
          ].join('\n')
        },
        {
          name: '✨ Premium Name Styles',
          value: `• Channels look like: \`📢・server・updates\` / \`🎫・open・ticket\`\n• Roles look like: \`👑 ． OWNER ． <3\` / \`． Members ． <3\``
        }
      )
      .setFooter({ text: 'ZENIXX DEV - Fully Operational Console' })
      .setTimestamp();
  }
};
