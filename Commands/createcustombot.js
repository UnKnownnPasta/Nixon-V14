const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { customBots } = require('../Databases/dbinitilaize.js')
const [ Cmds, CBProfile, Bots] = [ customBots.models.Cmds, customBots.models.CBProfile, customBots.models.Bots ]

module.exports = {
	data: new SlashCommandBuilder()
		.setName('createcustombot')
		.setDescription('Create a custom bot for a user with given info')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction, client) {
		const botOwner = interaction.options.getUser('botowner')
                    
		let testFind = await Bots.findOne({ where: { user_id: botOwner.id } })
		if(testFind) return interaction.reply(`User already has a bot.`)

		await interaction.deferReply({ fetchReply: true })
		const userName = interaction.options.getString('botname')
		const botAvatar = interaction.options.getString('botavatar')
		const testTrig = interaction.options.getString('testcmd')
		const testRes = interaction.options.getString('testresp')
		const botPrefix = interaction.options.getString('botprefix')

		if(await Bots.findOne({ where: {prefix: botPrefix} })) {
			return await interaction.editReply(`Prefix \`${botPrefix}\` cannot be used as it is already in use.`)
		}

		console.log(`(interaction) Recieved input: ${userName}, ${botPrefix} ||| ${testTrig} = ${testRes} ||| ${botAvatar} ||| ${botOwner.tag} ${botOwner.id} |`)

		let nameRegex = /[a-z0-9:/\- ]/gi
		let avatrRegex = /https?:\/\/.*\.(?:png|jpg)/
		if(nameRegex.test(userName) === false) return interaction.editReply('Given Username is invalid. [Minimum 3 normal characters]')
		if(avatrRegex.test(botAvatar) === false) return interaction.editReply('Given Avatar URL is invalid. [Invalid link format]')
		if(nameRegex.test(testTrig) === false) return interaction.editReply('Given command name is invalid. [Minimum 3 normal characters]')
		if(nameRegex.test(testRes) === false) return interaction.editReply('Given command response is invalid. [Minimum 3 normal characters]')

		try {
			const embedE = new EmbedBuilder();
			embedE.setDescription(`**${botOwner.tag}**, Created Custom Bot.\n**Name:** \`${userName}\`\n**Prefix:** \`${botPrefix}\``)
			embedE.setThumbnail(botAvatar)
			embedE.setColor('DarkPurple')
			embedE.addFields(
			{ name: 'Default Command', value: testTrig, inline: true },
			{ name: 'Command Response', value: testRes, inline: true }
			)
			
			Bots.create({
				user_id: botOwner.id,
				name: userName,
				avatarurl: botAvatar,
				prefix: botPrefix,
				test_cmd: testTrig,
				test_resp: testRes
			}).catch(() => {
				return interaction.editReply(`Database conflict error.`)
			})
			CBProfile.create({
				user_id: botOwner.id,
				quoteCmd: 'false',
				weatherCmd: 'false',
				bankCmd: 'false',
				bankBalance: '0',
				embedFeature: 'false',
				featureCmd: 'false',
				substFeature1: 'false',
				substFeature2: 'false',
			}).catch(() => {
				return interaction.editReply(`Database conflict error.`)
			})
			await customBots.sync();
			console.log('(sequelize) Updated bots DB.')
			interaction.editReply({ content: `Created bot.`, embeds: [embedE] })
		} catch (error) {
			if(error.type === 'SequelizeUniqueConstraintError') {
				return interaction.editReply(`Database conflict error.`)
			}
			console.log('(sequelize) ', error)
			return interaction.editReply('Failed to create bot.')
		}
	},
};
