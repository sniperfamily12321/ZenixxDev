const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'role-styler',
  description: 'Audits and updates existing roles to match premium formatting spec (Owner Only).',
  category: 'Build System',
  ownerOnly: true,
  slashOptions: [],

  async execute(message, args, client, config) {
    if (message.author.username !== config.ownerUsername) {
      return message.reply('❌ **Access Denied**: This administrative utility is restricted to `zenixx.dev`.');
    }

    const report = await this.styleRoles(message.guild, config);
    const embed = this.getEmbed(report);
    await message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction, client, config) {
    if (interaction.user.username !== config.ownerUsername) {
      return interaction.reply({ content: '❌ **Access Denied**: This administrative utility is restricted to `zenixx.dev`.', ephemeral: true });
    }

    await interaction.deferReply();
    const report = await this.styleRoles(interaction.guild, config);
    const embed = this.getEmbed(report);
    await interaction.editReply({ embeds: [embed] });
  },

  async styleRoles(guild, config) {
    const report = { styled: [], intact: [], errors: [] };

    const botMember = await guild.members.fetch(guild.client.user.id);
    if (!botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
      report.errors.push('Bot lacks manage roles permissions.');
      return report;
    }

    const myPosition = botMember.roles.highest.position;

    for (const rDef of config.roles) {
      try {
        const foundRole = guild.roles.cache.find(r => r.name === rDef.name);
        
        if (!foundRole) {
          report.errors.push(`Role \`${rDef.name}\` not found in other list (Deploy roles first).`);
          continue;
        }

        if (foundRole.position >= myPosition) {
          report.errors.push(`Cannot style \`${rDef.name}\` (Above bot integration index).`);
          continue;
        }

        // Check if matching spec
        const needsUpdate = foundRole.hexColor.toLowerCase() !== rDef.color.toLowerCase() ||
          foundRole.hoist !== rDef.hoist ||
          foundRole.mentionable !== rDef.mentionable;

        if (needsUpdate) {
          await foundRole.edit({
            color: rDef.color,
            hoist: rDef.hoist,
            mentionable: rDef.mentionable,
            reason: 'ZENIXX DEV automated role styler alignment'
          });
          report.styled.push(`Aligned styling of \`${rDef.name}\` with design specification.`);
        } else {
          report.intact.push(`\`${rDef.name}\` already matches design spec.`);
        }
      } catch (err) {
        console.error(`Error aligning role ${rDef.name}:`, err);
        report.errors.push(`Could not edit \`${rDef.name}\`: ${err.message}`);
      }
    }

    return report;
  },

  getEmbed(report) {
    const embed = new EmbedBuilder()
      .setTitle('🎨 Premium Role Styler Audit')
      .setDescription('Results of verifying role decorations and layout styling rules:')
      .setColor('#FF0055')
      .setTimestamp();

    if (report.styled.length > 0) {
      embed.addFields({ name: '🛠️ Conformed Roles', value: report.styled.join('\n').slice(0, 512) });
    }
    if (report.intact.length > 0) {
      embed.addFields({ name: '✨ Safe Roles (Direct Spec)', value: report.intact.join('\n').slice(0, 512) });
    }
    if (report.errors.length > 0) {
      embed.addFields({ name: '⚠️ Stylist Warnings', value: report.errors.join('\n').slice(0, 512) });
    }

    return embed;
  }
};
