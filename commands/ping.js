const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ping',
  description: 'Check the bot latency and connection statistics.',
  category: 'Utility',
  ownerOnly: false,
  slashOptions: [],

  async execute(message, args, client, config) {
    const sentMessage = await message.reply('⚡ Measuring latency...');
    const latency = sentMessage.createdTimestamp - message.createdTimestamp;
    const wsLatency = client.ws.ping;

    const embed = new EmbedBuilder()
      .setTitle('📊 ZENIXX DEV Connection Ping')
      .setColor('#3498DB')
      .addFields(
        { name: '🤖 Command Latency', value: `\`${latency}ms\``, inline: true },
        { name: '🌐 Discord Gateway', value: `\`${wsLatency}ms\``, inline: true }
      )
      .setFooter({ text: 'ZENIXX DEV Bot Core' })
      .setTimestamp();

    await sentMessage.edit({ content: null, embeds: [embed] });
  },

  async executeSlash(interaction, client, config) {
    const wsLatency = client.ws.ping;
    const startTime = Date.now();

    await interaction.reply({ content: '⚡ Measuring latency...', fetchReply: true });
    const latency = Date.now() - startTime;

    const embed = new EmbedBuilder()
      .setTitle('📊 ZENIXX DEV Connection Ping')
      .setColor('#3498DB')
      .addFields(
        { name: '🤖 Interaction Latency', value: `\`${latency}ms\``, inline: true },
        { name: '🌐 Discord Gateway', value: `\`${wsLatency}ms\``, inline: true }
      )
      .setFooter({ text: 'ZENIXX DEV Bot Core' })
      .setTimestamp();

    await interaction.editReply({ content: null, embeds: [embed] });
  }
};
