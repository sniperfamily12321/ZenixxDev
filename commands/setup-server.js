const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const CreateRoles = require('./create-roles');
const CreateChannels = require('./create-channels');
const SetPermissions = require('./set-permissions');
const SetRolePosition = require('./set-role-position');

module.exports = {
  name: 'setup-server',
  description: 'Pre-builds the entire premium structured guild environment (Owner Only - Prefix Only).',
  category: 'Build System',
  ownerOnly: true,
  prefixOnly: true, // Specific rule: Cannot be executed as a slash command
  slashOptions: [],

  async execute(message, args, client, config) {
    if (message.author.username !== config.ownerUsername) {
      return message.reply('❌ **Access Denied**: This administrative setup tool is strictly restricted to `zenixx.dev`.');
    }

    const progressMsg = await message.reply('⚙️ **Initiating Automate Setup Sequence for ZENIXX DEV...**\n*Processing sequence blocks in order...*');

    const guild = message.guild;

    // 1. Deploy styled roles
    await progressMsg.edit('⚙️ **[Step 1/4]** Deploying stylish color-coded custom roles...');
    const rolesReport = await CreateRoles.deployRoles(guild, config);

    // 2. Deploy channel trees
    await progressMsg.edit('⚙️ **[Step 2/4]** Erecting high-end channel category blocks and layouts...');
    const channelsReport = await CreateChannels.deployChannels(guild, config);

    // 3. Set permission gate rules
    await progressMsg.edit('⚙️ **[Step 3/4]** Synching server permissions, moderators, and everyone overrides...');
    const permissionsReport = await SetPermissions.deployPermissions(guild, config);

    // 4. Align role hierarchy positions
    await progressMsg.edit('⚙️ **[Step 4/4]** Adjusting vertical role list order and heights...');
    const positionReport = await SetRolePosition.alignRolePositions(guild, config);

    // Complete Embed Report Card
    const overviewEmbed = new EmbedBuilder()
      .setTitle('👑 ZENIXX DEV - Server Setup Autonomous Complete')
      .setDescription('Successfully structured the entire server. Roles, channel trees, security permissions, and sorted hierarchies are now operational!')
      .setColor('#FF0055')
      .addFields(
        { 
          name: '👥 Roles Installed', 
          value: `➕ Created: \`${rolesReport.created.length}\`\n🔄 Skipped: \`${rolesReport.skipped.length}\`\n⚠️ Warnings: \`${rolesReport.error.length}\``, 
          inline: true 
        },
        { 
          name: '📁 Channels Installed', 
          value: `➕ Categories: \`${channelsReport.createdCategories.length}\`\n📢 Channels: \`${channelsReport.createdChannels.length}\`\n🔄 Skipped: \`${channelsReport.skipped.length}\``, 
          inline: true 
        },
        { 
          name: '🛡️ Permissions & Sorting', 
          value: `🔐 Secured: \`${permissionsReport.successes.length}\`\n📶 Positioned: \`${positionReport.aligned.length}\`\n⚠️ Limit Logs: \`${positionReport.warnings.length}\``, 
          inline: false 
        }
      )
      .setFooter({ text: 'ZENIXX DEV Bot Setup Engine' })
      .setTimestamp();

    await progressMsg.edit({ content: '✨ **Server Build Sequence Completed Successfully!**', embeds: [overviewEmbed] });
  },

  async executeSlash(interaction, client, config) {
    // Left purposefully empty or locked, as requested to be Prefix-Only.
    await interaction.reply({ 
      content: '❌ **Restriction Error**: The `setup-server` command is designed exclusively as a prefix-only command. Please use `?setup-server` directly inside a text channel.', 
      ephemeral: true 
    });
  }
};
