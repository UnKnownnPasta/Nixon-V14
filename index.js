const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { type, cmdList } = require('./botSecret.json');
const { customBots, classicDB } = require('./Databases/dbinitilaize.js');
const Bots = customBots.models.Bots
const afkDB = classicDB.models.afks
const Karma = require('./Databases/dbinitilaize').karmaDB
const karma = Karma.models.Karmas

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildWebhooks, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });
client.hrlim = new Collection();

// Commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, './Commands/slashcmd')
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') && file != 'custom-bot.js')

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

client.once('ready', async () => {
    client.user.setPresence({ status: 'dnd' });
    console.log(`(login) Logged into: ${client.user.tag}\n(login) At: ${new Date().toLocaleString()}`)
})
	
client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = client.commands.get(interaction.commandName); if (!command) return; 

	try {
		await command.execute(interaction, client);
	} catch (error) {
		await interaction.channel.send({ content: `Oops <@${interaction.user.id}>, \`${interaction.commandName}\` ran into a error.`, ephemeral: true });
		return console.log(`(interaction) Ran into an error while running **${interaction.commandName}**:\n${error}`);
	}
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || message.channel.type === 'GUILD_PUBLIC_THREAD') return; 

	if ((await afkDB.findOne({ where: { user_id: message.author.id } })) != null) {
		await afkDB.destroy({ where: { user_id: message.author.id } })
		await afkDB.sync(); message.reply(`Welcome back, **${message.author.username}**!`)
	};
	if (message.mentions.users.first() != null) {
		message.mentions.users.forEach(async mem => {
			if ((await afkDB.findOne({ where: { user_id: mem.id } })) != null) {
				message.channel.send({ content: `${mem.username} is currently afk: ${(await afkDB.findOne({ where: { user_id: mem.id } })).message }`})
			}
		})
	}; 
    if(!(await Bots.findOne({ where: { user_id: message.author.id } }))) {} else {
		require('./Commands/custom-bot.js').execute(message, client);
	} // dont question it, this simply works

	require('./Commands/karmasys').execute(message, client); 
})

client.login(type)
