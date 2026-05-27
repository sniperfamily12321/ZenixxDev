const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'create-roles',
  description: 'Create the premium structured roles defined in config.json (Owner Only).',
  category: 'Build System',
  ownerOnly: true,
  slashOptions: [],

  async execute(message, args, client, config) {
    if (message.author.username !== config.ownerUsername) {
      return message.reply('❌ **Access Denied**: This administrative utility is restricted to `zenixx.dev`.');
    }

    const report = await this.deployRoles(message.guild, config);
    const embed = this.getEmbed(report);
    await message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction, client, config) {
    if (interaction.user.username !== config.ownerUsername) {
      return interaction.reply({ content: '❌ **Access Denied**: This administrative utility is restricted to `zenixx.dev`.', ephemeral: true });
    }

    await interaction.deferReply();
    const report = await this.deployRoles(interaction.guild, config);
    const embed = this.getEmbed(report);
    await interaction.editReply({ embeds: [embed] });
  },

  async deployRoles(guild, config) {
    const report = { created: [], skipped: [], error: [] };
    
    // Check bot hierarchy permissions
    const botMember = await guild.members.fetch(guild.client.user.id);
    if (!botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
      report.error.push('Bot lacks "MANAGE_ROLES" permission in this server.');
      return report;
    }

    const definedRoles = config.roles || [];

    for (const rDef of definedRoles) {
      try {
        const existing = guild.roles.cache.find(role => role.name === rDef.name);
        if (existing) {
          report.skipped.push(`Role \`${rDef.name}\` already exists.`);
          continue;
        }

        const permissions = (rDef.permissions || []).map(p => {
          if (PermissionFlagsBits[p]) {
            return PermissionFlagsBits[p];
          }
          return p;
        });

        const createdRole = await guild.roles.create({
          name: rDef.name,
          color: rDef.color || '#95A5A6',
          hoist: rDef.hoist !== undefined ? rDef.hoist : false,
          mentionable: rDef.mentionable !== undefined ? rDef.mentionable : false,
          permissions: permissions,
          reason: 'ZENIXX DEV automated build setup'
        });

        report.created.push(`Role \`${createdRole.name}\` successfully deployed.`);
      } catch (err) {
        console.error(`Error deploying role ${rDef.name}:`, err);
        report.error.push(`Failed to create \`${rDef.name}\`: ${err.message}`);
      }
    }

    return report;
  },

  getEmbed(report) {
    const embed = new EmbedBuilder()
      .setTitle('👑 Roles Deployment Report')
      .setDescription('Autonomous role creator execution status:')
      .setColor('#FF0055')
      .setTimestamp();

    if (report.created.length > 0) {
      embed.addFields({ name: '✅ Newly Created Roles', value: report.created.join('\n').slice(0, 1024) });
    }
    if (report.skipped.length > 0) {
      embed.addFields({ name: '🔄 Pre-existing Roles (Skipped)', value: report.skipped.join('\n').slice(0, 1024) });
    }
    if (report.error.length > 0) {
      embed.addFields({ name: '⚠️ Deployment Warnings', value: report.error.join('\n').slice(0, 1024) });
    }

    if (report.created.length === 0 && report.skipped.length === 0 && report.error.length === 0) {
      embed.setDescription('No role definitions found in config.json.');
    }

    return embed;
  }
};
