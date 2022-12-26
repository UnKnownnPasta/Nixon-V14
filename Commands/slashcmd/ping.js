const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Sends uptime/ping of the client.'),
	async execute(interaction, client) {
        const res = Date.now() - interaction.createdTimestamp
        const uptime = client.uptime/1000
        const timeSet = {
            d: `${Math.floor(uptime/86400)}`,
            h: `${Math.floor(uptime%86400/3600)}`,
            m: `${Math.floor(uptime%86400%3600/60)}`
        }

        const pingEmbed = new EmbedBuilder()
        .setColor('2f3136')
        .setAuthor({ iconURL: `${client.guilds.cache.get(interaction.guildId).iconURL()}`, name: 'Pong! 🏓' })
        .addFields(
            { name: `Uptime:`, value: `Days: ${timeSet.d} // Hours: ${timeSet.h} // Minutes: ${timeSet.m}` },
            { name: `Response time:`, value: `\`${res}\`ms` }
        )
        return await interaction.reply({ embeds: [pingEmbed] })
	},
};