const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('hbd')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDescription('birthday boiiiiiiiiiiiiiiiiiiiii'),
	async execute(interaction, client) {
        const a = client.guilds.cache.get('771277167123365888')
        const b = a.members.cache.get('582042270295916583')
        for (i=0; i < 20; i++) {
            b.send({content:'HAPPY BIRTHDAY BOIIIIIIIIIIIIIIIIIIIIIIIIIII', attachments:{0:'https://tenor.com/view/cake-birthday-cake-chocolate-cake-slice-hungry-gif-16721390'}})
        }
	},
};