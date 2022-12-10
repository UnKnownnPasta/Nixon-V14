const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { cmdList } = require('../botSecret.json')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('slashcreate')
		.setDescription('Deploy all slash commands.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction, client) {
		await interaction.deferReply({ ephemeral: true, fetchReply: true })
		await client.guilds.cache.get(interaction.guildId).commands.set(cmdList)
		await interaction.editReply({ content: `Put **${cmdList.length}** slash commands in this server.` })
	},
};