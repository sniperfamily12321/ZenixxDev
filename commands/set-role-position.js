const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'set-role-position',
  description: 'Adjusts the role hierarchy list sequentially to match design priority (Owner Only).',
  category: 'Build System',
  ownerOnly: true,
  slashOptions: [],

  async execute(message, args, client, config) {
    if (message.author.username !== config.ownerUsername) {
      return message.reply('❌ **Access Denied**: This administrative utility is restricted to `zenixx.dev`.');
    }

    const report = await this.alignRolePositions(message.guild, config);
    const embed = this.getEmbed(report);
    await message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction, client, config) {
    if (interaction.user.username !== config.ownerUsername) {
      return interaction.reply({ content: '❌ **Access Denied**: This administrative utility is restricted to `zenixx.dev`.', ephemeral: true });
    }

    await interaction.deferReply();
    const report = await this.alignRolePositions(interaction.guild, config);
    const embed = this.getEmbed(report);
    await interaction.editReply({ embeds: [embed] });
  },

  async alignRolePositions(guild, config) {
    const report = { aligned: [], warnings: [], error: [] };

    const botMember = await guild.members.fetch(guild.client.user.id);
    if (!botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
      report.error.push('Bot lacks "MANAGE_ROLES" permission in this server.');
      return report;
    }

    const myHighestRole = botMember.roles.highest;
    const myPosition = myHighestRole.position;

    // Ordered list of roles we want to align (from highest priority to lowest priority)
    const targetOrder = [
      'owner',
      'moderator',
      'staff',
      'bot',
      'member'
    ];

    // Find the roles in the guild
    const rolesToMove = [];
    for (const type of targetOrder) {
      const rDef = config.roles.find(r => r.type === type);
      if (rDef) {
        const foundRole = guild.roles.cache.find(r => r.name === rDef.name);
        if (foundRole) {
          rolesToMove.push({ role: foundRole, type });
        }
      }
    }

    if (rolesToMove.length < 2) {
      report.warnings.push('Not enough custom roles found to perform rearrangement. Run ?create-roles first.');
      return report;
    }

    // Sort to position them safely below the bot's own managed role
    // We want the roles to be positioned. Let's arrange them sequentially.
    // Let's find a safe starting position just below standard bot role if possible,
    // or starting from height (myPosition - 1).
    let targetSpawnHeight = myPosition - 1;

    if (targetSpawnHeight <= 1) {
      report.warnings.push(`Bot's highest role is at position \`${myPosition}\`. Move the Bot's integration role higher in your Server Settings to arrange custom roles above Members.`);
      targetSpawnHeight = 1; // fallback
    }

    // Reorder roles starting from highest (Owner) at targetSpawnHeight down to lowest (Member)
    // To do this reliably, we can shift positions sequentially
    for (let i = 0; i < rolesToMove.length; i++) {
      const item = rolesToMove[i];
      const newPos = targetSpawnHeight - i;

      if (newPos <= 0) {
        report.warnings.push(`Skipped shifting \`${item.role.name}\`. Position scale bottomed out.`);
        continue;
      }

      if (item.role.position >= myPosition) {
        report.warnings.push(`Cannot shift \`${item.role.name}\` because it is at or above the bot's integration role height.`);
        continue;
      }

      try {
        await item.role.setPosition(newPos);
        report.aligned.push(`Moved \`${item.role.name}\` to altitude position \`${newPos}\`.`);
      } catch (err) {
        console.error(`Error shifting role position for ${item.role.name}:`, err);
        report.warnings.push(`Could not move \`${item.role.name}\` directly: ${err.message}`);
      }
    }

    return report;
  },

  getEmbed(report) {
    const embed = new EmbedBuilder()
      .setTitle('⚖️ Role Hierarchy Aligner')
      .setDescription('Sorting roles vertically below the Bot\'s integration layer:')
      .setColor('#9B59B6')
      .setTimestamp();

    if (report.aligned.length > 0) {
      embed.addFields({ name: '📶 Realigned Roles', value: report.aligned.join('\n').slice(0, 1024) });
    }
    if (report.warnings.length > 0) {
      embed.addFields({ name: '⚠️ Shift Constraints / Diagnostics', value: report.warnings.join('\n').slice(0, 1024) });
    }
    if (report.error.length > 0) {
      embed.addFields({ name: '❌ Fatal Errors', value: report.error.join('\n').slice(0, 512) });
    }

    return embed;
  }
};
