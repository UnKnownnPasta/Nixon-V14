const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('grab')
		.setDescription('Fetch formula sheets'),
	async execute(interaction, client) {
        const selected = interaction.options.data[0].value

        switch (selected) {
            case 'trignometry':
                const f1 = new AttachmentBuilder('./files/trig/trig1.png')
                const tE1 = new EmbedBuilder()
                .setTitle('Trignometry')
                .setImage('attachment://trig1.png')
                .setColor('Aqua')

                const f2 = new AttachmentBuilder('./files/trig/trig2.png')
                const tE2 = new EmbedBuilder()
                .setImage('attachment://trig2.png')
                .setColor('Aqua')

                const f3 = new AttachmentBuilder('./files/trig/trig3.png')
                const tE3 = new EmbedBuilder()
                .setImage('attachment://trig3.png')
                .setColor('Aqua')

                interaction.reply({ embeds: [tE1, tE2, tE3], files: [f1, f2, f3] })
            break;

            case 'sets':
                const ff1 = new AttachmentBuilder('./files/sets/sets1.png')
                const sE1 = new EmbedBuilder()
                .setTitle('Set Theory')
                .setImage('attachment://sets1.png')
                .setColor('Aqua')

                const ff2 = new AttachmentBuilder('./files/sets/sets2.png')
                const sE2 = new EmbedBuilder()
                .setImage('attachment://sets2.png')
                .setColor('Aqua')

                const ff3 = new AttachmentBuilder('./files/sets/sets3.png')
                const sE3 = new EmbedBuilder()
                .setImage('attachment://sets3.png')
                .setColor('Aqua')

                interaction.reply({ embeds: [sE1, sE2, sE3], files: [ff1, ff2, ff3] })
            break;
        }
	},
};