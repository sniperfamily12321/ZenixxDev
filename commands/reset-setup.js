const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'reset-setup',
  description: 'Wipes out channels, categories, and roles specified in config.json (Owner Only).',
  category: 'Build System',
  ownerOnly: true,
  slashOptions: [],

  async execute(message, args, client, config) {
    if (message.author.username !== config.ownerUsername) {
      return message.reply('❌ **Access Denied**: This administrative utility is restricted to `zenixx.dev`.');
    }

    const report = await this.purgeServerStructure(message.guild, config);
    const embed = this.getEmbed(report);
    await message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction, client, config) {
    if (interaction.user.username !== config.ownerUsername) {
      return interaction.reply({ content: '❌ **Access Denied**: This administrative utility is restricted to `zenixx.dev`.', ephemeral: true });
    }

    await interaction.deferReply();
    const report = await this.purgeServerStructure(interaction.guild, config);
    const embed = this.getEmbed(report);
    await interaction.editReply({ embeds: [embed] });
  },

  async purgeServerStructure(guild, config) {
    const report = { deletedChannels: 0, deletedCategories: 0, deletedRoles: 0, warnings: [] };

    const botMember = await guild.members.fetch(guild.client.user.id);
    if (!botMember.permissions.has(PermissionFlagsBits.ManageChannels) || !botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
      report.warnings.push('Bot lacks "MANAGE_CHANNELS" or "MANAGE_ROLES" permissions to execute full reset.');
      return report;
    }

    // 1. Delete Channels and Categories
    const categoriesList = config.channels || [];
    for (const cat of categoriesList) {
      // Find sub channels
      const items = cat.items || [];
      for (const item of items) {
        const foundCh = guild.channels.cache.find(c => c.name === item.name);
        if (foundCh) {
          try {
            await foundCh.delete('Purging ZENIXX DEV setup');
            report.deletedChannels++;
          } catch (err) {
            console.error(`Error deleting channel ${item.name}:`, err);
            report.warnings.push(`Could not delete channel #${item.name}: ${err.message}`);
          }
        }
      }

      // Find parent category channel
      const foundCat = guild.channels.cache.find(c => c.name === cat.category && c.type === 4); // Category type is 4
      if (foundCat) {
        try {
          await foundCat.delete('Purging ZENIXX DEV setup');
          report.deletedCategories++;
        } catch (err) {
          console.error(`Error deleting category ${cat.category}:`, err);
          report.warnings.push(`Could not delete category [${cat.category}]: ${err.message}`);
        }
      }
    }

    // 2. Delete Roles
    const rolesList = config.roles || [];
    const myPosition = botMember.roles.highest.position;

    for (const rDef of rolesList) {
      const foundRole = guild.roles.cache.find(r => r.name === rDef.name);
      if (foundRole) {
        if (foundRole.position >= myPosition) {
          report.warnings.push(`Skipped deleting role \`${foundRole.name}\` (Above bot integration index in guild).`);
          continue;
        }

        try {
          await foundRole.delete('Purging ZENIXX DEV setup');
          report.deletedRoles++;
        } catch (err) {
          console.error(`Error deleting role ${foundRole.name}:`, err);
          report.warnings.push(`Could not delete role \`${foundRole.name}\`: ${err.message}`);
        }
      }
    }

    return report;
  },

  getEmbed(report) {
    const embed = new EmbedBuilder()
      .setTitle('🗑️ Hard-Reset Execution Report')
      .setDescription('Autonomous teardown sequence completed:')
      .setColor('#E74C3C')
      .addFields(
        { name: '📁 Purged Categories', value: `\`${report.deletedCategories}\``, inline: true },
        { name: '📢 Purged Channels', value: `\`${report.deletedChannels}\``, inline: true },
        { name: '👥 Purged Custom Roles', value: `\`${report.deletedRoles}\``, inline: true }
      )
      .setTimestamp();

    if (report.warnings.length > 0) {
      embed.addFields({ name: '⚠️ Teardown Logs / Diagnostics', value: report.warnings.join('\n').slice(0, 1024) });
    } else {
      embed.setFooter({ text: 'All created assets wiped cleanly from server memory.' });
    }

    return embed;
  }
};
