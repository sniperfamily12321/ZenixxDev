const { EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'create-channels',
  description: 'Deploys all category boxes and premium-styled channels from config.json (Owner Only).',
  category: 'Build System',
  ownerOnly: true,
  slashOptions: [],

  async execute(message, args, client, config) {
    if (message.author.username !== config.ownerUsername) {
      return message.reply('❌ **Access Denied**: This administrative utility is restricted to `zenixx.dev`.');
    }

    const report = await this.deployChannels(message.guild, config);
    const embed = this.getEmbed(report);
    await message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction, client, config) {
    if (interaction.user.username !== config.ownerUsername) {
      return interaction.reply({ content: '❌ **Access Denied**: This administrative utility is restricted to `zenixx.dev`.', ephemeral: true });
    }

    await interaction.deferReply();
    const report = await this.deployChannels(interaction.guild, config);
    const embed = this.getEmbed(report);
    await interaction.editReply({ embeds: [embed] });
  },

  async deployChannels(guild, config) {
    const report = { createdCategories: [], createdChannels: [], skipped: [], error: [] };

    const botMember = await guild.members.fetch(guild.client.user.id);
    if (!botMember.permissions.has(PermissionFlagsBits.ManageChannels)) {
      report.error.push('Bot lacks "MANAGE_CHANNELS" permission in this server.');
      return report;
    }

    const categoriesList = config.channels || [];

    for (const cat of categoriesList) {
      try {
        let categoryChannel = guild.channels.cache.find(
          c => c.name === cat.category && c.type === ChannelType.GuildCategory
        );

        if (!categoryChannel) {
          categoryChannel = await guild.channels.create({
            name: cat.category,
            type: ChannelType.GuildCategory,
            reason: 'ZENIXX DEV automation workspace category setup'
          });
          report.createdCategories.push(`Category \`${cat.category}\``);
        } else {
          report.skipped.push(`Category \`${cat.category}\` (existing)`);
        }

        const items = cat.items || [];
        for (const item of items) {
          const channelType = item.type === 'GuildVoice' ? ChannelType.GuildVoice : ChannelType.GuildText;
          
          let existingChannel = guild.channels.cache.find(
            c => c.name === item.name && c.parentId === categoryChannel.id && c.type === channelType
          );

          if (!existingChannel) {
            const chOptions = {
              name: item.name,
              type: channelType,
              parent: categoryChannel.id,
              reason: 'ZENIXX DEV automation channel setup'
            };

            if (channelType === ChannelType.GuildText && item.topic) {
              chOptions.topic = item.topic;
            }

            const createdChannel = await guild.channels.create(chOptions);
            report.createdChannels.push(`Channel #${item.name} inside Category \`${cat.category}\``);
          } else {
            report.skipped.push(`#${item.name} (existing under \`${cat.category}\`)`);
          }
        }
      } catch (err) {
        console.error(`Error deploying channel hierarchy:`, err);
        report.error.push(`Failed setup block for \`${cat.category}\`: ${err.message}`);
      }
    }

    return report;
  },

  getEmbed(report) {
    const embed = new EmbedBuilder()
      .setTitle('📁 Channels & Hierarchy Deployment Report')
      .setDescription('Autonomous channel architecture installation status:')
      .setColor('#3498DB')
      .setTimestamp();

    if (report.createdCategories.length > 0) {
      embed.addFields({ name: '✅ Created Categories', value: report.createdCategories.join('\n').slice(0, 512) });
    }
    if (report.createdChannels.length > 0) {
      embed.addFields({ name: '📢 Created Channels', value: report.createdChannels.join('\n').slice(0, 1024) });
    }
    if (report.skipped.length > 0) {
      embed.addFields({ name: '🔄 Skipped Nodes (Existing)', value: `${report.skipped.length} existing nodes skipped to prevent duplicate slop.` });
    }
    if (report.error.length > 0) {
      embed.addFields({ name: '⚠️ Deployment Warnings', value: report.error.join('\n').slice(0, 512) });
    }

    return embed;
  }
};
