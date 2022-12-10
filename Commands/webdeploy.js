const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('webdeploy')
		.setDescription('Create a webhook.')
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers | PermissionFlagsBits.BanMembers),
	async execute(interaction, client) {
        const channel = interaction.channel
		channel.createWebhook({
			name: 'WTB MSG WEBHOOK',
			avatar: client.user.avatarURL(),
		})
			.then(webhook => {
				console.log(`Created webhook ${webhook}`)
				interaction.reply({ content: `Created webhook /${webhook.name}/ successfully.` })
			})
			.catch(console.error);
	},
};