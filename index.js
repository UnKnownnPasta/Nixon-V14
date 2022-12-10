const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const prefix = '>'
const { type, cmdList } = require('./botSecret.json');
const { customBots } = require('./Databases/dbinitilaize.js');
const [ Cmds, Bots, CBProfile ] = [ customBots.models.Cmds, customBots.models.Cmds, customBots.models.CBProfile ]

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildWebhooks, GatewayIntentBits.MessageContent] });

// Commands respond
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'Commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

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
    console.log('reached 1')
    if(message.guildId === '938717266873303040') return;
    if(message.author.id === '740536348166848582' && message.content === 'cweb') {
        message.delete();
        const hannel = client.channels.cache.get(message.channel.id)
        hannel.createWebhook('Custom-bot', {
            avatar: 'https://cdn.discordapp.com/avatars/842408762126893077/1b86c03debb8c22bfef2bda92f5ef2a7.webp?size=80',
        })
            .then(webhook => console.log(`Created webhook ${webhook}`))
            .catch(console.error);
    }

    if(message.author.bot || message.channel.type === 'GUILD_PUBLIC_THREAD') return;
    if(!await Bots.findOne({ where: { user_id: message.author.id } })) return;

    let textRegex = /[a-z0-9:/\- ]/gi
    console.log('reached 2')

    try {
        const botinfo = await Bots.findOne({ where: { user_id: message.author.id } })
        const cbprofile = await CBProfile.findOne({ where: { userID: message.author.id } })
        const lorem = client.channels.cache.get(message.channel.id)
        const channel = await lorem.fetchWebhooks()
        if(!channel) return;
        const webhook = channel.find(wh => wh.token)
        if(!webhook) return;

        const ments = message.content.substring(botinfo.prefix.length).split(/ +/)
        
        if(message.content === `${botinfo.prefix} ${botinfo.test_cmd}`) { // default
            return await webhook.send({
                content: `${botinfo.test_resp}`,
                username: botinfo.name,
                avatarURL: botinfo.avatarurl,
            })
        }

        if(!ments[1]) return;
        if(message.content?.startsWith(`${botinfo.prefix} newcmd`)) {
            const cmdname = ments[2]
            const cmdresp = ments.slice(3).join(" ")

            if(!cmdname || !cmdresp) {
                return await webhook.send({
                    content: 'Invalid Command name or response.',
                    avatarURL: botinfo.avatarurl,
                    username: botinfo.name
                })
            }

            if(await Cmds.findOne({ where: {cmd_name: cmdname, userid: message.author.id} }) || botinfo.test_cmd === cmdname) {
                return await webhook.send({
                    content: `You have already created a command with the name \`${cmdname}\`.`,
                    avatarURL: botinfo.avatarurl,
                    username: botinfo.name
                })
            }

            if(+cbprofile.bankBalance < 500) {
                return await webhook.send({
                    content: `You don\'t have enough balance to perform this action. [500 karma required]`,
                    avatarURL: botinfo.avatarurl,
                    username: botinfo.name
                })
            }

            await webhook.send({
                username: botinfo.name,
                avatarURL: botinfo.avatarurl,
                content: `Do you want to create the command \`${cmdname}\` with response \`${cmdresp}\` for 500 karma? Reply with **yes** or **no**.`
            })

            message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, time: 15000, max: 1, errors: ['time'] }).then(async collected => {
                let r1 = collected.first().content.toLowerCase()
                if(r1.startsWith('ye')) {
                    await Cmds.create({
                        userid: message.author.id,
                        cmd_name: cmdname,
                        cmd_response: cmdresp,
                        has_embed: false,
                    })
                    const newcmdbal = Math.floor(+cbprofile.bankBalance - 500)
                    await CBProfile.update({ bankBalance: newcmdbal }, { where: { userID: message.author.id } })
                    await webhook.send({
                        username: botinfo.name,
                        avatarURL: botinfo.avatarurl,
                        content: `Created command \`${cmdname}\` successfully!`
                    })
                }
                if(r1.startsWith('no')) {
                    await webhook.send({
                        username: botinfo.name,
                        avatarURL: botinfo.avatarurl,
                        content: `No Commands will be created.`
                    })
                }
                if(!r1.startsWith('ye') && !r1.startsWith('no')) {
                    await webhook.send({
                        username: botinfo.name,
                        avatarURL: botinfo.avatarurl,
                        content: `You did not reply with yes or no.`
                    })
                }
            }).catch(async () => {
                await webhook.send({
                    username: botinfo.name,
                    avatarURL: botinfo.avatarurl,
                    content: `You did not respond in time.`
                })
            })
        }

        if(message.content?.startsWith(`${botinfo.prefix} weather`)) {
            if(cbprofile.weatherCmd === 'false') { 
                return webhook.send({
                    content: 'You cannot use this command yet, you have to buy it.',
                    avatarURL: botinfo.avatarurl,
                    username: botinfo.name,
            })
            }
        var weatherLocation = ments[2]
        if(!weatherLocation || weatherLocation === '') {
            weatherLocation = 'Bengaluru, IN'
        }
        weather.find({search: weatherLocation, degreeType: 'C', }, async function(err, result) {
            if(err || result[0] === undefined) {
                return await webhook.send({
                    content: `Given location was invalid.`,
                    avatarURL: botinfo.avatarurl,
                    username: botinfo.name,
                })
            }
            
            var current = result[0].current
            var location = result[0].location
            const weatherEmbed = new Discord.MessageEmbed()
            .setTitle(`Weather for ${current.observationpoint}`)
            .setThumbnail(current.imageUrl)
            .setDescription(current.skytext)
            .setColor('BLUE')
            .addFields(
                { name: 'Temperature', value: `${current.temperature} C`, inline: true},
                { name: 'Degree Type', value: `Celcius`, inline: true},
                { name: 'Wind', value: `${current.winddisplay}`, inline: true},
                { name: 'Humidity', value: `${current.humidity}`, inline: true},
                { name: 'Timezone', value: `UTC ${location.timezone}`, inline: true},
                { name: 'Feels like', value: `${current.feelslike}°`, inline: true}
            );
    
            webhook.send({
                avatarURL: botinfo.avatarurl,
                username: botinfo.name,
                embeds: [weatherEmbed]
            })
            });
        }

        if(message.content?.startsWith(`${botinfo.prefix} gquote`)) {
            if(cbprofile.quoteCmd === 'false') { 
                return webhook.send({
                    content: 'You cannot use this command yet, you have to buy it.',
                    avatarURL: botinfo.avatarurl,
                    username: botinfo.name,
            })
            }
            const quoteChnl = client.channels.cache.get('824986421554184233')

            await quoteChnl.messages.fetch({ limit: 60 }).then(async puotes => {
                const quotessss = await Array.from(puotes.values());
                const ivalue = await Math.floor(Math.random() * 71) // Math.floor(Math.random() * 40) + 1;

                const thequote = await quotessss[ivalue]

                var quoteEmedd = await thequote.embeds[0]

                await webhook.send({
                    content: `${thequote.content}`,
                    avatarURL: botinfo.avatarurl,
                    username: botinfo.name,
                    embeds: [quoteEmedd]
                })
            })
        }

        if(message.content?.startsWith(`${botinfo.prefix} setavatar`)) {
            if(cbprofile.featureCmd === 'false') { 
                return webhook.send({
                    content: 'You cannot use this command yet, you have to buy it.',
                    avatarURL: botinfo.avatarurl,
                    username: botinfo.name,
                })
            }
            if(cbprofile.bankBalance < 100) {
                return webhook.send({
                    content: 'You don\'t have enough balance to perform this action. [100 karma required]',
                    avatarURL: botinfo.avatarurl,
                    username: botinfo.name,
                })
            }
            const avatrarRegex = /https?:\/\/.*\.(?:png|jpg)/
            const newAvatarUrl = ments.slice(2).join("")
            if(!newAvatarUrl || avatrarRegex.test(newAvatarUrl) === false) {
            return webhook.send({
                content: 'You didn\'t provide a valid url.',
                avatarURL: botinfo.avatarurl,
                username: botinfo.name,
            })
            }

            const wawawawwww = new Discord.MessageEmbed()
            .setDescription('Are you sure you want to change your bot\'s name to **' + newAvatarUrl + '** ?')
            .setColor('GREY')
            .setFooter('Respond with yes or no.');
        
            await webhook.send({
                avatarURL: botinfo.avatarurl,
                username: botinfo.name,
                embeds: [wawawawwww]
            })
        
            message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 7000, errors: ['time'] }).then(async newnametrue => {
            const repsaonvas = newnametrue.first().content.toLowerCase()
        
            switch (repsaonvas) {
                case 'yes':
                    const nameBalNewwwwwwwwwww = Math.floor(+cbprofile.bankBalance - 100)
                    await botinfo.update({ avatarurl: newAvatarUrl }, { where: { user_id: message.author.id } })
                    await CBProfile.update({ bankBalance: nameBalNewwwwwwwwwww }, { where: { userID: message.author.id } })
                    // db.subtract(`bankBal${message.author.id}`, 100)
                    await webhook.send({
                        content: "Changed your bot's name!",
                        avatarURL: botinfo.avatarurl,
                        username: botinfo.name,
                })
                break;
        
                case 'no':
                    await webhook.send({
                        content: "Did not change your bot's name.",
                        avatarURL: botinfo.avatarurl,
                        username: botinfo.name,
                })
                break;
        
                default:
                    await webhook.send({
                        content: `Invalid response.`,
                        avatarURL: botinfo.avatarurl,
                        username: botinfo.name,
                    })
            }
            }).catch(async () => {
                await webhook.send({
                    content: `You ran out of time to respond.`,
                    avatarURL: botinfo.avatarurl,
                    username: botinfo.name,
                })
                
            })
            
        }

        if(message.content?.startsWith(`${botinfo.prefix} profile`)) {
            const profileEmbed = new Discord.MessageEmbed()
            .setAuthor(`${message.author.username} - Profile`, `${message.author.displayAvatarURL()}`)
            .setDescription(`Bot Info:\n**Name:** ${botinfo.name}\n**Prefix:** ${botinfo.prefix}\nReplies "**${botinfo.test_cmd}**" with "**${botinfo.test_resp}**"\n`)
            .addFields(
                { name: `'gquote'`, value: `${cbprofile.quoteCmd === 'false' ? 'Disabled.' : 'Enabled.'}` },
                { name: `'weather'`, value: `${cbprofile.weatherCmd === 'false' ? 'Disabled.' : 'Enabled.'}` },
                { name: `'bank'`, value: `${cbprofile.bankCmd === 'false' ? 'Inactive: No karma savings.' : `Balance: ${cbprofile.bankBalance} karma saved.`}` },
                { name: `Feature Commands`, value: `${cbprofile.featureCmd === 'false' ? 'Disabled.' : 'Enabled.'}` },
            )
            .setColor('BLURPLE');

            webhook.send({
                avatarURL: botinfo.avatarurl,
                username: botinfo.name,
                embeds: [profileEmbed]
            })
        }

        if(message.content?.startsWith(`${botinfo.prefix} setname`)) {
        if(cbprofile.featureCmd === 'false') { 
            return webhook.send({
                content: 'You cannot use this command yet, you have to buy it.',
                avatarURL: botinfo.avatarurl,
                username: botinfo.name,
            })
        }
        if(cbprofile.bankBalance < 100) {
            return webhook.send({
                content: 'You don\'t have enough balance to perform this action. [100 karma required]',
                avatarURL: botinfo.avatarurl,
                username: botinfo.name,
            })            
        }
        const newnamelink = ments.slice(2).join(" ")
        if(!newnamelink || textRegex.test(newnamelink) === false) {
        return webhook.send({
            content: 'You didn\'t provide a valid bot name.',
            avatarURL: botinfo.avatarurl,
            username: botinfo.name,
        })
        }
        const wawawawwww = new Discord.MessageEmbed()
        .setDescription('Are you sure you want to change your bot\'s name to **' + newnamelink + '** ?')
        .setColor('GREY')
        .setFooter('Respond with yes or no.');

        await webhook.send({
            avatarURL: botinfo.avatarurl,
            username: botinfo.name,
            embeds: [wawawawwww]
        })

        message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 7000, errors: ['time'] }).then(async newnametrue => {
        const responsa = newnametrue.first().content.toLowerCase()

        switch (responsa) {
            case 'yes':
                const nameBalNew = Math.floor(+cbprofile.bankBalance - 100)
                await botinfo.update({ name: newnamelink }, { where: { user_id: message.author.id } })
                await CBProfile.update({ bankBalance: nameBalNew }, { where: { userID: message.author.id } })
                // db.subtract(`bankBal${message.author.id}`, 100)
                await webhook.send({
                    content: "Changed your bot's name!",
                    avatarURL: botinfo.avatarurl,
                    username: botinfo.name,
            })
            break;

            case 'no':
                await webhook.send({
                    content: "Did not change your bot's name.",
                    avatarURL: botinfo.avatarurl,
                    username: botinfo.name,
            })
            break;

            default:
                await webhook.send({
                    content: `Invalid response.`,
                    avatarURL: botinfo.avatarurl,
                    username: botinfo.name,
                })
        }
        }).catch(async () => {
            await webhook.send({
                content: `You ran out of time to respond.`,
                avatarURL: botinfo.avatarurl,
                username: botinfo.name,
            })
            
        })

        }

        if(message.content?.startsWith(`${botinfo.prefix} setprefix`)) {
            if(cbprofile.featureCmd === 'false') { 
                return webhook.send({
                    content: 'You cannot use this command yet, you have to buy it.',
                    avatarURL: botinfo.avatarurl,
                    username: botinfo.name,
                })
            }
            if(+cbprofile.bankBalance < 100) {
                return webhook.send({
                    content: 'You don\'t have enough balance to perform this action. [100 karma required]',
                    avatarURL: botinfo.avatarurl,
                    username: botinfo.name,
                })            
            }

            if(!ments[2]) return await webhook.send({
                content: 'No new prefix given to change to. L',
                avatarURL: botinfo.avatarurl,
                username: botinfo.name,
            })
            const newPrefix = ments[2].replace(/\s/g, "");

            if(await Bots.findOne({ where: {prefix: newPrefix} })) {
                return await webhook.send({
                    content: 'Prefix is already in use.',
                    avatarURL: botinfo.avatarurl,
                    username: botinfo.name,
                })
            }

            await webhook.send({
                content: `Are You sure you want to change the prefix to **${newPrefix}** ?`,
                avatarURL: botinfo.avatarurl,
                username: botinfo.name,
            })
            message.channel.awaitMessages({ filter: m => m.author.id == message.author.id, max: 1, time: 5000}).then(async mutated => {
                if (mutated.first().content.toLowerCase() == 'yes') {
                    const prefBalNew = Math.floor(+cbprofile.bankBalance - 100)
                    await botinfo.update({ prefix: newPrefix }, { where: { user_id: message.author.id } })
                    await CBProfile.update({ bankBalance: prefBalNew }, { where: { userID: message.author.id } })

                    await webhook.send({
                        content: `__Set your bot's prefix to__ **${newPrefix}** !`,
                        avatarURL: botinfo.avatarurl,
                        username: botinfo.name,
                    })
            } else {
                if(mutated.first().content.toLowerCase() === 'no') {
                    await webhook.send({
                        content: 'Prefix will not be changed.',
                        avatarURL: botinfo.avatarurl,
                        username: botinfo.name,
                    })
                } else {
                await webhook.send({
                    content: `Invalid response! Prefix will not be changed.`,
                    avatarURL: botinfo.avatarurl,
                    username: botinfo.name,
                })
            }
            }
            }).catch(async () => {
                await webhook.send({
                    content: `You ran out of time to respond.`,
                    avatarURL: botinfo.avatarurl,
                    username: botinfo.name,
                })
            })
        }

        if(message.content?.startsWith(`${botinfo.prefix} deletebot`)) {

            const waw = new Discord.MessageEmbed()
            .setTitle('Are you sure you want to delete your bot? **You cannot revert this process and any data you have about your bot will be gone.**')
            .setColor('RED')
            .setFooter('Respond with yes or no.');

            await webhook.send({
                avatarURL: botinfo.avatarurl,
                username: botinfo.name,
                embeds: [waw]
            })

            await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 20000, errors: ['time'] }).then(async deletebot => {
                if(deletebot.first().content.toLowerCase() === 'yes') {
                    setTimeout(async () => {
                        await Bots.destroy({ where: { user_id: message.author.id } })
                        await CBProfile.destroy({ where: { userID: message.author.id } })
                        await Cmds.destroy({ where: { userid: message.author.id } })
                    }, 3000);

                    setTimeout(() => {
                        return message.channel.send('Bot has been Deleted. All commands and progress cannot be brought back.')
                    }, 3500);
                }
                if(deletebot.first().content.toLowerCase() === 'no') {
                    return await webhook.send({
                        content: 'Bot will not be deleted.',
                        avatarURL: botinfo.avatarurl,
                        username: botinfo.name,
                    })
                }

                if(deletebot.first().content.toLowerCase() !== ['yes' && 'no']) {
                    return message.reply('Invalid response.')
                }

            }).catch(async () => {
                await webhook.send({
                    content: `You ran out of time to respond.`,
                    avatarURL: botinfo.avatarurl,
                    username: botinfo.name,
                })
            })    
        }

        if(message.content?.startsWith(`${botinfo.prefix} commands`)) {
            const cmdList = await Cmds.findAll({ where: { userid: message.author.id } });
            const cmdString = cmdList.map(e => `\`${e.cmd_name}\` -> ${e.cmd_response}`).join('\n')

            return webhook.send({
                content: `All commands:\n${cmdString}`,
                avatarURL: botinfo.avatarurl,
                username: botinfo.name,
            })
        }

        if(message.content?.startsWith(`${botinfo.prefix} bank`)) {
            await client.guilds.cache.get('771277167123365888')
            let findUserCache = await message.guild.members.cache.get('821969847651008545').presence
            if(findUserCache === null || findUserCache.status === 'offline') {
                return await webhook.send({
                    content: 'Currently <@821969847651008545> is offline, so bank commands are disabled.',
                    avatarURL: botinfo.avatarurl,
                    username: botinfo.name
                })
            }

            const amount = ments[3]
            const currentBalance = +cbprofile.bankBalance;

            switch (ments[2]) {
                case 'bal':
                case 'balance':
                    if(message.mentions.users.first() != null) {
                        const menID = message.mentions?.users.first().id;
                        const menBank = await CBProfile.findOne({ where: { userID: menID } })
                        if(!menBank) {
                            await webhook.send({
                                avatarURL: botinfo.avatarurl,
                                username: botinfo.name,
                                content: `That user doesn't have a custom bot, or bank module hasn't been enabled yet.`
                            })
                        } else {
                            await webhook.send({
                                avatarURL: botinfo.avatarurl,
                                username: botinfo.name,
                                content: `**${message.guild.members.cache.get(menID).user.username}'s Balance:** \`${menBank.bankBalance}\``,
                            })
                        }
                    } else {
                    await webhook.send({
                            avatarURL: botinfo.avatarurl,
                            username: botinfo.name,
                            content: `**Your Balance:** \`${currentBalance}\``,
                        })
                    }
                break;

                case 'dep':
                case 'deposit':
                    if(cbprofile.bankCmd === 'false') {
                        CBProfile.update({ bankCmd: 'true' }, { where: { userID: message.author.id } })
                    }

                    if(isNaN(amount) || amount < 0 || (amount % 1) != 0) {
                        return await webhook.send({
                            avatarURL: botinfo.avatarurl,
                            username: botinfo.name,
                            content: `Deposit amount must be a six digit natural number.`,
                        })
                    }

                    const karmaAChannel = client.channels.cache.get('834098006747250718')
                    await karmaAChannel.send(`'remove <@!${message.author.id}> ${amount}`)
                    const amtDep = Math.floor(+currentBalance + +amount)
                    await CBProfile.update({ bankBalance: amtDep }, { where: { userID: message.author.id } })

                    await webhook.send({
                        avatarURL: botinfo.avatarurl,   
                        username: botinfo.name,
                        content: `Transaction complete. Deposited \`${amount}\` karma into bank.`
                    })
                break;

                case 'with':
                case 'withdraw':
                    if(isNaN(amount) || amount < 0 || (amount % 1) != 0) {
                        return await webhook.send({
                            avatarURL: botinfo.avatarurl,
                            username: botinfo.name,
                            content: `Deposit amount must be a six digit natural number.`,
                        })
                    }

                    if(amount > currentBalance) {
                        return await webhook.send({
                            avatarURL: botinfo.avatarurl,
                            username: botinfo.name,
                            content: `Withdraw amount must be less than or same your current balance.`
                        })
                    }

                    const karmaRChannel = client.channels.cache.get('834098006747250718')
                    await karmaRChannel.send(`'add <@!${message.author.id}> ${amount}`)
                    const amtWith = Math.floor(+currentBalance - +amount)
                    await CBProfile.update({ bankBalance: amtWith }, { where: { userID: message.author.id } })

                    await webhook.send({
                        avatarURL: botinfo.avatarurl,
                        username: botinfo.name,
                        content: `Transaction complete. Withdrew \`${amount}\` karma from bank.`
                    })
                break;

                default:
                    const defEm = new Discord.MessageEmbed()
                    .setDescription('All Bank Commands:\n\`-\` balance [Alias: bal]\n\`-\` deposit [Alias: dep]\n\`-\` withdraw [Alias: with]')
                    .setColor('GREYPLE');
                    await webhook.send({
                        avatarURL: botinfo.avatarurl,
                        username: botinfo.name,
                        embeds: [defEm]
                    })
            }
        }

        if(message.content?.startsWith(`${botinfo.prefix} editcmd`)) {
            if(cbprofile.featureCmd === 'false') { 
                return webhook.send({
                    content: 'You cannot use this command yet, you have to buy it.',
                    avatarURL: botinfo.avatarurl,
                    username: botinfo.name,
                })
            }

            if(!await Cmds.findOne({ where: { userid: message.author.id, cmd_name: ments[2] } })) {
                return await webhook.send({
                    content: `No such command with the name \`${ments[2]}\` exists.`,
                    avatarURL: botinfo.avatarurl,
                    username: botinfo.username
                })
            }

            const replacedto = ments.slice(3).join(" ")

            if(!ments[2] || !replacedto) {
                return await webhook.send({
                    content: `Command name or new response not given.`,
                    avatarURL: botinfo.avatarurl,
                    username: botinfo.username
                })
            }

            await Cmds.update({ cmd_response: replacedto }, { where: { userid: message.author.id, cmd_name: ments[2] } })
            await webhook.send({
                content: `Edited the response of \`${ments[2]}\` command to \`${replacedto}\`!`,
                avatarURL: botinfo.avatarurl,
                username: botinfo.username
            })
        }

        if(message.content?.startsWith(`${botinfo.prefix} buycmd`)) {
            switch (ments[2]) {

                case 'feature':
                    if(cbprofile.featureCmd === 'true') {
                        return await webhook.send({
                            avatarURL: botinfo.avatarurl,
                            username: botinfo.name,
                            content: `You already have feature commands enabled. These include \`setname\` and \`setprefix\` which do not need to be bought seperately.`,
                        })
                    }

                    if(cbprofile.bankBalance < 5000) {
                        return await webhook.send({
                            avatarURL: botinfo.avatarurl,
                            username: botinfo.name,
                            content: `You do not have enough balance in your bank to perform this action. \`${5000 - +cbprofile.bankBalance}\` more karma required.`,
                        })
                    }

                    const featureBuy = Math.floor(+cbprofile.bankBalance - 5000)

                    await CBProfile.update({ featureCmd: 'true', bankBalance: featureBuy }, { where: { userID: message.author.id } })
                    await webhook.send({
                        avatarURL: botinfo.avatarurl,
                        username: botinfo.name,
                        content: `Feature commands are now enabled! Use them through \`${botinfo.prefix} setprefix\` or \`${botinfo.prefix} setname\`!`,
                    })
                break;

                case 'gquote':
                    if(cbprofile.quoteCmd === 'true') {
                        return await webhook.send({
                            avatarURL: botinfo.avatarurl,
                            username: botinfo.name,
                            content: `You already have \`gquote\` enabled.`,
                        })
                    }

                    if(cbprofile.bankBalance < 5000) {
                        return await webhook.send({
                            avatarURL: botinfo.avatarurl,
                            username: botinfo.name,
                            content: `You do not have enough balance in your bank to perform this action. \`${25000 - +cbprofile.bankBalance}\` more karma required.`,
                        })
                    }

                    const quoteBuy = Math.floor(+cbprofile.bankBalance - 25000)

                    await CBProfile.update({ quoteCmd: 'true', bankBalance: quoteBuy }, { where: { userID: message.author.id } })
                    await webhook.send({
                        avatarURL: botinfo.avatarurl,
                        username: botinfo.name,
                        content: `\`gquote\` is now enabled! Use it through \`${botinfo.prefix} gquote\`!`,
                    })
                break;

                case 'weather':
                    if(cbprofile.weatherCmd === 'true') {
                        return await webhook.send({
                            avatarURL: botinfo.avatarurl,
                            username: botinfo.name,
                            content: `You already have \`weather\` enabled.`,
                        })
                    }

                    if(cbprofile.bankBalance < 5000) {
                        return await webhook.send({
                            avatarURL: botinfo.avatarurl,
                            username: botinfo.name,
                            content: `You do not have enough balance in your bank to perform this action. \`${25000 - +cbprofile.bankBalance}\` more karma required.`,
                        })
                    }

                    const weatherBuy = Math.floor(+cbprofile.bankBalance - 25000)

                    await CBProfile.update({ weatherCmd: 'true', bankBalance: weatherBuy }, { where: { userID: message.author.id } })
                    await webhook.send({
                        avatarURL: botinfo.avatarurl,
                        username: botinfo.name,
                        content: `\`weather\` is now enabled! Use it through \`${botinfo.prefix} weather\`!`,
                    })
                break;

                default:
                    await webhook.send({
                        avatarURL: botinfo.avatarurl,
                        username: botinfo.name,
                        content: `Unknown command name. Available Commands:\n- \`feature\` [Includes Feature Commands like \`setname\` and \`setprefix\`] - **5,000 karma**\n- \`gquote\`, \`weather\` - **25,000 karma** each`,
                    })
                break;
            }
        }

        // custom command
        if(!await Cmds.findOne({ where: { userid: message.author.id, cmd_name: ments[1] } })) return;
        const findCmd = await Cmds.findOne({ where: { userid: message.author.id, cmd_name: ments[1] } })
        if(message.content?.startsWith(`${botinfo.prefix} ${findCmd.cmd_name}`)) {
            await webhook.send({
                username: botinfo.name,
                avatarURL: botinfo.avatarurl,
                content: findCmd.cmd_response
            })
            findCmd.increment('usage_count')
        }

    } catch (error) {
        console.log(error)
        message.reply(`Hmm. Something went wrong.\n\`${error.description}\``).then(msg => {
             try { 
                 setTimeout(() => { msg.delete() }, 10000)
            } catch (err) {
                return console.log(err) 
            }
        })
    }
})

client.login(type)
