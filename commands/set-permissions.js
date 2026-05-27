const { EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
  name: 'set-permissions',
  description: 'Applies rigid best-practice permission gates to categories and channels (Owner Only).',
  category: 'Build System',
  ownerOnly: true,
  slashOptions: [],

  async execute(message, args, client, config) {
    if (message.author.username !== config.ownerUsername) {
      return message.reply('❌ **Access Denied**: This administrative utility is restricted to `zenixx.dev`.');
    }

    const report = await this.deployPermissions(message.guild, config);
    const embed = this.getEmbed(report);
    await message.reply({ embeds: [embed] });
  },

  async executeSlash(interaction, client, config) {
    if (interaction.user.username !== config.ownerUsername) {
      return interaction.reply({ content: '❌ **Access Denied**: This administrative utility is restricted to `zenixx.dev`.', ephemeral: true });
    }

    await interaction.deferReply();
    const report = await this.deployPermissions(interaction.guild, config);
    const embed = this.getEmbed(report);
    await interaction.editReply({ embeds: [embed] });
  },

  async deployPermissions(guild, config) {
    const report = { successes: [], skips: [], error: [] };

    const botMember = await guild.members.fetch(guild.client.user.id);
    if (!botMember.permissions.has(PermissionFlagsBits.ManageRoles) || !botMember.permissions.has(PermissionFlagsBits.ManageChannels)) {
      report.error.push('Bot requires both MANAGE_ROLES and MANAGE_CHANNELS to configure security gates.');
      return report;
    }

    // Resolve structural roles created earlier
    const rolesMap = {};
    for (const rDef of config.roles) {
      const serverRole = guild.roles.cache.find(r => r.name === rDef.name);
      if (serverRole) {
        rolesMap[rDef.type] = serverRole;
      }
    }

    const memberRole = rolesMap['member'];
    const staffRole = rolesMap['staff'];
    const modRole = rolesMap['moderator'];
    const ownerRole = rolesMap['owner'];
    const botRole = rolesMap['bot'];

    if (!memberRole) {
      report.error.push('Warning: `． Members ． <3` role was not detected. Please run ?create-roles first.');
    }

    // Process each configured category box
    const categoriesList = config.channels || [];

    for (const cat of categoriesList) {
      try {
        const categoryChannel = guild.channels.cache.find(
          c => c.name === cat.category && c.type === ChannelType.GuildCategory
        );

        if (!categoryChannel) {
          report.skips.push(`Category node \`${cat.category}\` was not found. Skipping.`);
          continue;
        }

        const overwrites = [
          // Base everyone permissions (General protection)
          {
            id: guild.roles.everyone.id,
            deny: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.AddReactions,
              PermissionFlagsBits.Connect
            ]
          }
        ];

        // Owner overrides
        if (ownerRole) {
          overwrites.push({
            id: ownerRole.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.SendTTSMessages,
              PermissionFlagsBits.ManageMessages,
              PermissionFlagsBits.EmbedLinks,
              PermissionFlagsBits.AttachFiles,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.MentionEveryone,
              PermissionFlagsBits.UseExternalEmojis,
              PermissionFlagsBits.AddReactions,
              PermissionFlagsBits.Connect,
              PermissionFlagsBits.Speak,
              PermissionFlagsBits.MuteMembers,
              PermissionFlagsBits.DeafenMembers,
              PermissionFlagsBits.MoveMembers,
              PermissionFlagsBits.UseVAD,
              PermissionFlagsBits.ManageChannels,
              PermissionFlagsBits.ManageRoles
            ]
          });
        }

        // Moderator overrides
        if (modRole) {
          overwrites.push({
            id: modRole.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ManageMessages,
              PermissionFlagsBits.EmbedLinks,
              PermissionFlagsBits.AttachFiles,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.MentionEveryone,
              PermissionFlagsBits.UseExternalEmojis,
              PermissionFlagsBits.AddReactions,
              PermissionFlagsBits.Connect,
              PermissionFlagsBits.Speak,
              PermissionFlagsBits.MuteMembers,
              PermissionFlagsBits.DeafenMembers,
              PermissionFlagsBits.MoveMembers,
              PermissionFlagsBits.UseVAD
            ]
          });
        }

        // Staff overrides
        if (staffRole) {
          overwrites.push({
            id: staffRole.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ManageMessages,
              PermissionFlagsBits.EmbedLinks,
              PermissionFlagsBits.AttachFiles,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.UseExternalEmojis,
              PermissionFlagsBits.AddReactions,
              PermissionFlagsBits.Connect,
              PermissionFlagsBits.Speak,
              PermissionFlagsBits.MoveMembers,
              PermissionFlagsBits.UseVAD
            ]
          });
        }

        // Bot overrides
        if (botRole) {
          overwrites.push({
            id: botRole.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.EmbedLinks,
              PermissionFlagsBits.AttachFiles,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.Connect,
              PermissionFlagsBits.Speak
            ]
          });
        }

        // Specific rules per Category type
        if (cat.category.includes('WELCOME') || cat.category.includes('SUPPORT')) {
          // Public announcement/Support zones: Members can view, but cannot type freely by default (Read-only / Ticket-only)
          if (memberRole) {
            overwrites.push({
              id: memberRole.id,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.ReadMessageHistory
              ],
              deny: [
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.AddReactions
              ]
            });
          }
        } else {
          // Public Chat and Voice zones
          if (memberRole) {
            overwrites.push({
              id: memberRole.id,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.EmbedLinks,
                PermissionFlagsBits.AttachFiles,
                PermissionFlagsBits.ReadMessageHistory,
                PermissionFlagsBits.AddReactions,
                PermissionFlagsBits.Connect,
                PermissionFlagsBits.Speak,
                PermissionFlagsBits.UseVAD
              ]
            });
          }
        }

        // Set overwrites and trigger sync down to child nodes
        await categoryChannel.permissionOverwrites.set(overwrites, 'ZENIXX DEV Permission Lock');
        
        // Sync text and voice channels that match this parent
        const children = guild.channels.cache.filter(c => c.parentId === categoryChannel.id);
        for (const [chId, childCh] of children) {
          try {
            await childCh.lockPermissions(); // natively syncs from parent
          } catch (syncErr) {
            console.error(`Could not sync permissions for child channel ${childCh.name}:`, syncErr);
          }
        }

        report.successes.push(`Secured Category \`${cat.category}\` (Synced Children)`);
      } catch (err) {
        console.error(`Error setting category permissions for ${cat.category}:`, err);
        report.error.push(`Could not secure \`${cat.category}\`: ${err.message}`);
      }
    }

    return report;
  },

  getEmbed(report) {
    const embed = new EmbedBuilder()
      .setTitle('🛡️ Security Gates Execution Report')
      .setDescription('Channel security overrides applied matching design spec:')
      .setColor('#2ECC71')
      .setTimestamp();

    if (report.successes.length > 0) {
      embed.addFields({ name: '🔐 Secured Zones (Locked)', value: report.successes.join('\n').slice(0, 1024) });
    }
    if (report.skips.length > 0) {
      embed.addFields({ name: '🔄 Skipped Gates', value: report.skips.join('\n').slice(0, 512) });
    }
    if (report.error.length > 0) {
      embed.addFields({ name: '⚠️ Execution Errors', value: report.error.join('\n').slice(0, 512) });
    }

    return embed;
  }
};
