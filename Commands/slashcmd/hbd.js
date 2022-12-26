const { SlashCommandBuilder, AttachmentBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('hbd')
		.setDescription('birthday boiiiiiiiiiiiiiiiiiiiii')
		.addUserOption(option => option.setName('user').setDescription('User to wish hbday').setRequired(true)),
	async execute(interaction, client) {
        const userID = interaction.options.getUser('user').id;

        if (client.hrlim.get(interaction.user.id) == 1) {
            return interaction.reply('Ratelimited.')
        }

        if (userID == client.user.id) return interaction.reply('No');

        try {
            const a = client.guilds.cache.get(interaction.guild.id)
            var b = a.members.cache.get(userID)
            interaction.reply('Found user. Sending wishes (no response from this)')
        } catch (error) {
            console.log(`(interaction) Error: Couldn't find a valid member using id: ${userID}`)
            interaction.reply({ content: `Interaction failed - perhaps a invalid user id?` })
        }

        client.hrlim.set(interaction.user.id, 1)
        setTimeout(() => {
            client.hrlim.delete(interaction.user.id)
        }, 90000); 

        try {
            const attach = new AttachmentBuilder('bday.gif');
            for (var i = 0; i < 2; i++) {
                b.send({content:'***HAPPY BIRTHDAY BOIIIIIIIIIIIIIIIIIIIIIIIIIII***', files: [attach] });
            }
        } catch (error) {
            return console.log(`(interaction) hbd finished at: ${i}\n(interaction) Error: ${error.description}`)
        }
	},
};