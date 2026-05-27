const { EmbedBuilder, version: djsVersion } = require('discord.js');
const os = require('os');

module.exports = {
  name: 'bot-info',
  description: 'Displays professional metrics, version states, and statistics of ZENIXX DEV.',
  category: 'Utility',
  ownerOnly: false,
  slashOptions: [],

  async execute(message, args, client, config) {
    const embed = this.getEmbed(client, config);
    await message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction, client, config) {
    const embed = this.getEmbed(client, config);
    await interaction.reply({ embeds: [embed] });
  },

  getEmbed(client, config) {
    const uptime = os.uptime();
    const days = Math.floor(uptime / (3600 * 24));
    const hours = Math.floor((uptime % (3600 * 24)) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    
    const uptimeStr = `${days}d ${hours}h ${minutes}m`;
    const memory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    
    return new EmbedBuilder()
      .setTitle('🛡️ ZENIXX DEV Bot Statistics')
      .setDescription('Production-ready multi-mode administrative agent for virtual server management.')
      .setColor('#FF0055')
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        { name: '🤖 Bot Client', value: `\`${client.user.tag}\``, inline: true },
        { name: '🛠️ Core Developer', value: `\`zenixx.dev\``, inline: true },
        { name: '⚙️ Active Prefix', value: `\`${config.prefix}\``, inline: true },
        { name: '📁 Managed Guilds', value: `\`${client.guilds.cache.size}\``, inline: true },
        { name: '👥 Reachable Users', value: `\`${client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0)}\``, inline: true },
        { name: '🧠 Ram Usage', value: `\`${memory} MB\``, inline: true },
        { name: '📦 Environment', value: `Node.js \`${process.version}\`\nDiscord.js \`v${djsVersion}\``, inline: false },
        { name: '⌛ Host Uptime', value: `\`${uptimeStr}\``, inline: true },
        { name: '🌐 Server Platform', value: `\`${os.platform()} (${os.arch()})\``, inline: true }
      )
      .setFooter({ text: 'ZENIXX DEV Bot System Management' })
      .setTimestamp();
  }
};
