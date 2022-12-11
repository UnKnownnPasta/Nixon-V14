const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const prefix = '>'
const { type, cmdList } = require('./botSecret.json');
const { customBots } = require('./Databases/dbinitilaize.js');
const Bots = customBots.models.Bots

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildWebhooks, GatewayIntentBits.MessageContent] });

// Commands respond
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'Commands')
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') && file != 'custom-bot.js')

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

client.once('ready', () => {
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
		return console.log(`(interaction) Ran into an error while running /${interaction.commandName}/:\n${error}`);
	}
});

client.on('messageCreate', async (message) => { // cb
    if(message.guildId === '938717266873303040') return;

    if(message.author.bot || message.channel.type === 'GUILD_PUBLIC_THREAD') return;
    if(!await Bots.findOne({ where: { user_id: message.author.id } })) return;

    const cb = require('./Commands/custom-bot.js').cb
    return cb(message,client)
})

client.login(type)
