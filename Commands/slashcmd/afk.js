const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { classicDB } = require('../../Databases/dbinitilaize')
const afkDB = classicDB.models.afks

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setafk')
		.setDescription('set an afk status')
        .addStringOption(option => option.setName('reason').setDescription('Reason for being afk')),
	async execute(interaction, client) {
		var givenReason = interaction.options.getString('reason')
		if (givenReason ==  null) {
			givenReason = 'no reason given'
		}
		if ((await afkDB.findOne({ where: { user_id: interaction.user.id } })) != null) {
			await afkDB.update({ message: givenReason }, { where: { user_id: interaction.user.id } })
		} else {
			await afkDB.create({
				user_id: interaction.user.id,
				message: givenReason,
				status: true
			})
		}
		return interaction.reply({ content: `You have now gone afk: **${givenReason}**`, ephemeral: true })
	},
};