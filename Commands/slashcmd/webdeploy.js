const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('webdeploy')
		.setDescription('Create a webhook.')
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers | PermissionFlagsBits.BanMembers),
	async execute(interaction, client) {
        const channel = interaction.channel
		channel.createWebhook({
			name: 'MSG WEBHOOK',
			avatar: client.user.avatarURL(),
		})
		.then(webhook => {
			console.log(`(interaction) Created webhook ${webhook.name}`)
		})
		.catch(console.error);
		interaction.reply({ content: `Created webhook successfully.` })
	}
};