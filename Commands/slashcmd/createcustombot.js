const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { Sequelize } = require('sequelize');
const karmaDB = require('../../Databases/dbinitilaize.js').karmaDB
const customBots = require('../../Databases/dbinitilaize.js').customBots
const [ Cmds, CBProfile, Bots, karma ] = [ customBots.models.Cmds, customBots.models.CBProfiles, customBots.models.Bots, karmaDB.models.Karmas ]

module.exports = {
	data: new SlashCommandBuilder()
		.setName('createcustombot')
		.setDescription('Create a custom bot for a user.')
		.addStringOption(option => option.setName('botname').setDescription('Bot name').setRequired(true))
		.addStringOption(option => option.setName('botavatar').setDescription('Bot avatar link').setRequired(true))
		.addStringOption(option => option.setName('defcmd').setDescription('Default command').setRequired(true))
		.addStringOption(option => option.setName('defresponse').setDescription('Default response').setRequired(true))
		.addStringOption(option => option.setName('botprefix').setDescription('Bot prefix').setRequired(true))
		.addUserOption(option => option.setName('botowner').setDescription('Bot owner (user)').setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction, client) {                    
		var userName, botAvatar, testTrig, testRes, botPrefix, botOwner;
		
		if (interaction.author != undefined) {
			var hold = client.temp
			userName = hold[0]
			botAvatar = hold[1]
			testTrig = hold[2]
			testRes = hold[3]
			botPrefix = hold[4]
			botOwner = hold[5]
		} else {
			1+1
			userName = interaction.options.getString('botname')
			botAvatar = interaction.options.getString('botavatar')
			testTrig = interaction.options.getString('testcmd')
			testRes = interaction.options.getString('testresp')
			botPrefix = interaction.options.getString('botprefix')
			botOwner = interaction.options.getUser('botowner')
		}

		let testFind = await Bots.findOne({ where: { user_id: botOwner.id } })
		if(testFind) return interaction.reply(`User already has a bot.`)

		if(await Bots.findOne({ where: {prefix: botPrefix} })) {
			return await interaction.reply(`Prefix \`${botPrefix}\` cannot be used as it is already in use.`)
		}

		console.log(`(custombot / interaction) ${userName} | ${botPrefix} ||| ${testTrig} = ${testRes} ||| ${botOwner.tag} ${botOwner.id} |||  ${botAvatar}`)

		let nameRegex = /[a-z0-9:/\- ]/gi
		let avatrRegex = /https?:\/\/.*\.(?:png|jpg|webp)/
		if(nameRegex.test(userName) === false) return interaction.reply('Given Username is invalid. [Minimum 3 normal characters]')
		if(avatrRegex.test(botAvatar) === false) return interaction.reply('Given Avatar URL is invalid. [Invalid link format]')
		if(nameRegex.test(testTrig) === false) return interaction.reply('Given command name is invalid. [Minimum 3 normal characters]')
		if(nameRegex.test(testRes) === false) return interaction.reply('Given command response is invalid. [Minimum 3 normal characters]')

		try {
			const embedE = new EmbedBuilder();
			embedE.setDescription(`**${botOwner.tag}**, Created Custom Bot.\n**Name:** \`${userName}\`\n**Prefix:** \`${botPrefix}\``)
			embedE.setThumbnail(botAvatar)
			embedE.setColor('DarkPurple')
			embedE.addFields(
			{ name: 'Default Command', value: `${testTrig}`, inline: true },
			{ name: 'Command Response', value: `${testRes}`, inline: true }
			)
			
			try {
				await Bots.create({
					user_id: botOwner.id,
					name: userName,
					avatarurl: botAvatar,
					prefix: botPrefix,
					test_cmd: testTrig,
					test_resp: testRes
				})
				await CBProfile.create({
					user_id: botOwner.id,
					quoteCmd: 'false',
					weatherCmd: 'false',
					bankCmd: 'false',
					bankBalance: '0',
					embedFeature: 'false',
					featureCmd: 'false',
					substFeature1: 'false',
					substFeature2: 'false',
				})
			} catch (e) {
				await Bots.destroy({ where: { user_id: botOwner.id } })
				await CBProfile.destroy({ where: { user_id: botOwner.id } }) // its confusing ok so just delete in case
				message.reply('Something went wrong..')
				return console.log(`(sequelize) Error: ${e}`)
			}
			
			await customBots.sync();

			console.log('(sequelize) Updated bots DB.')
			interaction.reply({ content: `Created bot.`, embeds: [embedE] })

			const foundItem = await karma.findOne({ where: { user_id: botOwner.id } });
			if (!foundItem) {
				await karma.create({
					user_id: botOwner.id,
					balance: 0,
					prestige: 0,
					multiplier: 1.0,
					prestigePercent: 0.0,
					prestigeReq: 100.0
				})
			 }
			await karma.update({ balance: Sequelize.literal('balance - 20000') }, { where: { user_id: botOwner.id } });
			console.log('(sequelize) Removed 20k for creating a bot from user', botOwner.username)
		} catch (error) {
			if(error.type === 'SequelizeUniqueConstraintError') {
				return interaction.reply(`Something went wrong. ${error.description}`)
			}
			console.log('(sequelize) Error:', error)
			return interaction.reply('Failed to create bot.')
		}
	},
};
