const { customBots } = require('../Databases/dbinitilaize.js')
customBots.authenticate()
const [ Cmds, Bots, CBProfile ] = [ customBots.models.Cmds, customBots.models.Bots, customBots.models.CBProfile ]
const { EmbedBuilder } = require('discord.js')

async function cb(message, client) {
    let textRegex = /[a-z0-9:/\- ]/gi
    try {
        const botinfo = await Bots.findOne({ where: { user_id: message.author.id } })
        const cbprofile = await CBProfile.findOne({ where: { user_id: message.author.id } })

        const lorem = client.channels.cache.get(message.channel.id)
        const channel = await lorem.fetchWebhooks(); if(!channel) return;
        const webhook = channel.find(wh => wh.token); if(!webhook) return;

        async function webRespond(input, embed) {
            embed = [embed] || []
            return await webhook.send({
                content: input,
                username: botinfo.name,
                avatarURL: botinfo.avatarurl,
                embeds: embed
            })
        }

        const ments = message.content.substring(botinfo.prefix.length).split(/ +/)
        
        if(message.content === `${botinfo.prefix} ${botinfo.test_cmd}`) { // default
            return webRespond(`${botinfo.test_resp}`)
        }

        if(!ments[1]) return;
        if(message.content?.startsWith(`${botinfo.prefix} newcmd`)) {
            const cmdname = ments[2]
            const cmdresp = ments.slice(3).join(" ")

            if(!cmdname || !cmdresp) { return webRespond(`Invalid Command name or response.`) }

            if(await Cmds.findOne({ where: {cmd_name: cmdname, user_id: message.author.id} }) || botinfo.test_cmd === cmdname) {
                return webRespond(`You have already created a command with the name \`${cmdname}\`.`) }

            if(+cbprofile.bankBalance < 500) {
                return webRespond(`You don\'t have enough balance to perform this action. [500 karma required]`)
            }

            await webRespond(`Do you want to create the command \`${cmdname}\` with response \`${cmdresp}\` for 500 karma? Reply with **yes** or **no**.`)

            message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, time: 15000, max: 1, errors: ['time'] }).then(async collected => {
                let r1 = collected.first().content.toLowerCase()
                if(r1.startsWith('ye')) {
                    await Cmds.create({
                        user_id: message.author.id,
                        cmd_name: cmdname,
                        cmd_response: cmdresp,
                        has_embed: false,
                    })
                    const newcmdbal = Math.floor(+cbprofile.bankBalance - 500)
                    await CBProfile.update({ bankBalance: newcmdbal }, { where: { user_id: message.author.id } })
                    customBots.sync()
                    console.log('(sequelize) Updated bots DB - Custom Bot')
                    return webRespond(`Created command \`${cmdname}\` successfully!`)
                }
                if(r1.startsWith('no')) { return webRespond(`o Commands will be created.`) }
                if(!r1.startsWith('ye') && !r1.startsWith('no')) { return webRespond(`You did not reply with yes or no.`) }
            }).catch(async () => {
                await webRespond(`You did not respond in time.`)
            })
        }

        if(message.content?.startsWith(`${botinfo.prefix} weather`)) {
            if(cbprofile.weatherCmd === 'false') { return webRespond(`You cannot use this command yet, you have to buy it.`) }
        var weatherLocation = ments[2]
        if(!weatherLocation || weatherLocation === '') {
            weatherLocation = 'Bengaluru, IN'
        }
        weather.find({search: weatherLocation, degreeType: 'C', }, async function(err, result) {
            if(err || result[0] === undefined) {
                return webRespond(`Given location was invalid.`)
            }
            
            var current = result[0].current
            var location = result[0].location
            const weatherEmbed = new EmbedBuilder()
            .setTitle(`Weather for ${current.observationpoint}`)
            .setThumbnail(current.imageUrl)
            .setDescription(current.skytext)
            .setColor('Blue')
            .addFields(
                { name: 'Temperature', value: `${current.temperature} C`, inline: true},
                { name: 'Degree Type', value: `Celcius`, inline: true},
                { name: 'Wind', value: `${current.winddisplay}`, inline: true},
                { name: 'Humidity', value: `${current.humidity}`, inline: true},
                { name: 'Timezone', value: `UTC ${location.timezone}`, inline: true},
                { name: 'Feels like', value: `${current.feelslike}°`, inline: true}
            );

            return webRespond(null, weatherEmbed)
            });
        }

        if(message.content?.startsWith(`${botinfo.prefix} gquote`)) {
            if(cbprofile.quoteCmd === 'false') { 
                return webRespond(`You cannot use this command yet, you have to buy it.`)
            }
            const quoteChnl = client.channels.cache.get('824986421554184233')

            await quoteChnl.messages.fetch({ limit: 60 }).then(async puotes => {
                const quotessss = await Array.from(puotes.values());
                const ivalue = await Math.floor(Math.random() * 71) // Math.floor(Math.random() * 40) + 1;

                const thequote = await quotessss[ivalue]

                var quoteEmedd = await thequote.embeds[0]
                return webRespond(`${thequote.content}`, quoteEmedd)
            })
        }

        if(message.content?.startsWith(`${botinfo.prefix} setavatar`)) {
            if(cbprofile.featureCmd === 'false') { 
                return webRespond(`You cannot use this command yet, you have to buy it.`)
            }
            if(cbprofile.bankBalance < 100) {
                return webRespond(`You don\'t have enough balance to perform this action. [100 karma required]`)
            }
            const avatrarRegex = /https?:\/\/.*\.(?:png|jpg)/
            const newAvatarUrl = ments.slice(2).join("")
            if(!newAvatarUrl || avatrarRegex.test(newAvatarUrl) === false) {
            return webRespond(`You didn\'t provide a valid url.`)
            }

            const wawawawwww = new EmbedBuilder()
            .setDescription('Are you sure you want to change your bot\'s name to **' + newAvatarUrl + '** ?')
            .setColor('Grey')
            .setFooter('Respond with yes or no.');
        
            await webRespond(null, wawawawwww)
        
            message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 7000, errors: ['time'] }).then(async newnametrue => {
            const repsaonvas = newnametrue.first().content.toLowerCase()
        
            switch (repsaonvas) {
                case 'yes':
                    const nameBalNewwwwwwwwwww = Math.floor(+cbprofile.bankBalance - 100)
                    await botinfo.update({ avatarurl: newAvatarUrl }, { where: { user_id: message.author.id } })
                    await CBProfile.update({ bankBalance: nameBalNewwwwwwwwwww }, { where: { user_id: message.author.id } })
                    customBots.sync()
                    console.log('(sequelize) Updated bots DB - Custom Bot')
                    await webRespond(`Changed your bot's name!`)
                break;
        
                case 'no':
                    await webRespond(`Did not change your bot's name.`)
                break;
        
                default:
                    return webRespond(`Invalid response`)
            }
            }).catch(async () => {
                return webRespond(`You ran out of time to respond.`)
                
            })
            
        }

        if(message.content?.startsWith(`${botinfo.prefix} profile`)) {
            const profileEmbed = new EmbedBuilder()
            .setAuthor({name:`${message.author.username} - Profile`, iconURL:`${message.author.displayAvatarURL()}`})
            .setDescription(`Bot Info:\n**Name:** ${botinfo.name}\n**Prefix:** ${botinfo.prefix}\nReplies "**${botinfo.test_cmd}**" with "**${botinfo.test_resp}**"\n`)
            .addFields(
                { name: `'gquote'`, value: `${cbprofile.quoteCmd === 'false' ? 'Disabled.' : 'Enabled.'}` },
                { name: `'weather'`, value: `${cbprofile.weatherCmd === 'false' ? 'Disabled.' : 'Enabled.'}` },
                { name: `'bank'`, value: `${cbprofile.bankCmd === 'false' ? 'Inactive: No karma savings.' : `Balance: ${cbprofile.bankBalance} karma saved.`}` },
                { name: `Feature Commands`, value: `${cbprofile.featureCmd === 'false' ? 'Disabled.' : 'Enabled.'}` },
            )
            .setColor('DarkPurple');

            return webRespond(null, profileEmbed)
        }

        if(message.content?.startsWith(`${botinfo.prefix} setname`)) {
        if(cbprofile.featureCmd === 'false') { 
            return webRespond(`You cannot use this command yet, you have to buy it.`)
        }
        if(cbprofile.bankBalance < 100) {
            return webRespond(`You don\'t have enough balance to perform this action. [100 karma required]`)      
        }
        const newnamelink = ments.slice(2).join(" ")
        if(!newnamelink || textRegex.test(newnamelink) === false) {
            return webRespond(`You didn\'t provide a valid bot name.`)
        }
        const wawawawwww = new EmbedBuilder()
        .setDescription('Are you sure you want to change your bot\'s name to **' + newnamelink + '** ?')
        .setColor('Grey')
        .setFooter('Respond with yes or no.');
        customBots.sync()
        console.log('(sequelize) Updated bots DB - Custom Bot')
        await webRespond(null, wawawawwww)

        message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 7000, errors: ['time'] }).then(async newnametrue => {
        const responsa = newnametrue.first().content.toLowerCase()

        switch (responsa) {
            case 'yes':
                const nameBalNew = Math.floor(+cbprofile.bankBalance - 100)
                await botinfo.update({ name: newnamelink }, { where: { user_id: message.author.id } })
                await CBProfile.update({ bankBalance: nameBalNew }, { where: { user_id: message.author.id } })
                await webRespond(`Changed your bot's name!`)
            break;

            case 'no':
                await webRespond(`Did not change your bot's name.`)
            break;

            default:
                return webRespond(`Invalid repsonse.`)
        }
        }).catch(async () => {
            await webRespond(`You ran out of time to respond.`)
        })

        }

        if(message.content?.startsWith(`${botinfo.prefix} setprefix`)) {
            if(cbprofile.featureCmd === 'false') { 
                return webRespond(`You cannot use this command yet, you have to buy it.`)
            }
            if(+cbprofile.bankBalance < 100) {
                return webRespond(`You don\'t have enough balance to perform this action. [100 karma required]`)
            }

            if(!ments[2]) return await webRespond(`No prefix given to change to.`)
            const newPrefix = ments[2].replace(/\s/g, "");

            if(await Bots.findOne({ where: {prefix: newPrefix} })) {
                return webRespond(`Prefix is already in use.`)
            }

            await webRespond(`Are You sure you want to change the prefix to **${newPrefix}** ?`)
            message.channel.awaitMessages({ filter: m => m.author.id == message.author.id, max: 1, time: 5000}).then(async mutated => {
                if (mutated.first().content.toLowerCase() == 'yes') {
                    const prefBalNew = Math.floor(+cbprofile.bankBalance - 100)
                    await botinfo.update({ prefix: newPrefix }, { where: { user_id: message.author.id } })
                    await CBProfile.update({ bankBalance: prefBalNew }, { where: { user_id: message.author.id } })
                    customBots.sync()
                    console.log('(sequelize) Updated bots DB - Custom Bot')
                    return webRespond(`__Set your bot's prefix to__ **${newPrefix}** !`)
            } else {
                if(mutated.first().content.toLowerCase() === 'no') {
                    return webRespond(`Prefix will not be changed.`)
                } else {
                return webRespond(`Invalid response! Prefix will not be changed.`)
            }
            }
            }).catch(async () => {
                return webRespond(`You ran out of time to respond.`)
            })
        }

        if(message.content?.startsWith(`${botinfo.prefix} deletebot`)) {

            const waw = new EmbedBuilder()
            .setTitle('Are you sure you want to delete your bot? **You cannot revert this process and any data you have about your bot will be gone.**')
            .setColor('Red')
            .setFooter({ text: 'Respond with yes or no.' });

            await webRespond(null, waw)

            await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 20000, errors: ['time'] }).then(async deletebot => {
                if(deletebot.first().content.toLowerCase() !== ['yes' && 'no']) {
                    return message.reply('Invalid response.')
                }
                else if(deletebot.first().content.toLowerCase() === 'yes') {
                    setTimeout(async () => {
                        await Bots.destroy({ where: { user_id: message.author.id } })
                        await CBProfile.destroy({ where: { user_id: message.author.id } })
                        await Cmds.destroy({ where: { user_id: message.author.id } })
                    }, 3000);
                    customBots.sync()
                    console.log(`(sequelize) Pruned DB of Bot [Owned by: ${message.author.tag}][${Date.now().toLocaleString()}]`)
                    setTimeout(() => {
                        return message.channel.send('Bot has been Deleted. All commands and progress cannot be brought back.')
                    }, 3500);
                }
                else if(deletebot.first().content.toLowerCase() === 'no') {
                    return webRespond(`Bot will not be deleted.`)
                }

            }).catch(async () => {
                return webRespond(`You ran out of time to respond.`)
            })    
        }

        if(message.content?.startsWith(`${botinfo.prefix} commands`)) {
            const cmdList = await Cmds.findAll({ where: { user_id: message.author.id } });
            const cmdString = cmdList.map(e => `\`${e.cmd_name}\` -> ${e.cmd_response}`).join('\n')
            return webRespond(`All commands:\n${cmdString}`)
        }

        if(message.content?.startsWith(`${botinfo.prefix} bank`)) {
            await client.guilds.cache.get('771277167123365888')
            let findUserCache = await message.guild.members.cache.get('821969847651008545').presence
            if(findUserCache === null || findUserCache.status === 'offline') {
                return webRespond(`Currently <@821969847651008545> is offline, so bank commands are disabled.`)
            }

            const amount = ments[3]
            const currentBalance = +cbprofile.bankBalance;

            switch (ments[2]) {
                case 'bal':
                case 'balance':
                    if(message.mentions.users.first() != null) {
                        const menID = message.mentions?.users.first().id;
                        const menBank = await CBProfile.findOne({ where: { user_id: menID } })
                        if(!menBank) {
                            return webRespond(`That user doesn't have a custom bot, or bank module hasn't been enabled yet.`)
                        } else {
                            return webRespond(`**${message.guild.members.cache.get(menID).user.username}'s Balance:** \`${menBank.bankBalance}\``)
                        }
                    } else {
                        await webRespond(`**Your Balance:** \`${currentBalance}\``)
                    }
                break;

                case 'dep':
                case 'deposit':
                    if(cbprofile.bankCmd === 'false') {
                        CBProfile.update({ bankCmd: 'true' }, { where: { user_id: message.author.id } })
                    }

                    if(isNaN(amount) || amount < 0 || (amount % 1) != 0) {
                        return webRespond(`Deposit amount must be a six digit natural number.`)
                    }

                    const karmaAChannel = client.channels.cache.get('834098006747250718')
                    await karmaAChannel.send(`'remove <@!${message.author.id}> ${amount}`)
                    const amtDep = Math.floor(+currentBalance + +amount)
                    await CBProfile.update({ bankBalance: amtDep }, { where: { user_id: message.author.id } })
                    customBots.sync()
                    console.log('(sequelize) Updated bots DB - Custom Bot')
                    await webRespond(`Transaction complete. Deposited \`${amount}\` karma into bank.`)
                break;

                case 'with':
                case 'withdraw':
                    if(isNaN(amount) || amount < 0 || (amount % 1) != 0) {
                        return webRespond(`Deposit amount must be a six digit natural number.`)
                    }

                    if(amount > currentBalance) {
                        return webRespond(`Withdraw amount must be less than or same your current balance.`)
                    }

                    const karmaRChannel = client.channels.cache.get('834098006747250718')
                    await karmaRChannel.send(`'add <@!${message.author.id}> ${amount}`)
                    const amtWith = Math.floor(+currentBalance - +amount)
                    await CBProfile.update({ bankBalance: amtWith }, { where: { user_id: message.author.id } })
                    customBots.sync()
                    console.log('(sequelize) Updated bots DB - Custom Bot')
                    await webRespond(`Transaction complete. Withdrew \`${amount}\` karma from bank.`)
                break;

                default:
                    const defEm = new EmbedBuilder()
                    .setDescription('All Bank Commands:\n\`-\` balance [Alias: bal]\n\`-\` deposit [Alias: dep]\n\`-\` withdraw [Alias: with]')
                    .setColor('Fuchsia');
                    return webRespond(null, defEm)
            }
        }

        if(message.content?.startsWith(`${botinfo.prefix} editcmd`)) {
            if(cbprofile.featureCmd === 'false') { 
                return webRespond(`You cannot use this command yet, you have to buy it.`)
            }

            if(!await Cmds.findOne({ where: { user_id: message.author.id, cmd_name: ments[2] } })) {
                return webRespond(`No such command with the name \`${ments[2]}\` exists.`)
            }

            const replacedto = ments.slice(3).join(" ")

            if(!ments[2] || !replacedto) {
                return webRespond(`Command name or new response not given.`)
            }

            await Cmds.update({ cmd_response: replacedto }, { where: { user_id: message.author.id, cmd_name: ments[2] } })
            customBots.sync()
            console.log('(sequelize) Updated bots DB - Custom Bot')
            await webRespond(`Edited the response of \`${ments[2]}\` command to \`${replacedto}\`!`)
        }

        if(message.content?.startsWith(`${botinfo.prefix} buycmd`)) {
            switch (ments[2]) {

                case 'feature':
                    if(cbprofile.featureCmd === 'true') {
                        return webRespond(`You already have feature commands enabled. These include \`setname\` and \`setprefix\` which do not need to be bought seperately.`)
                    }

                    if(cbprofile.bankBalance < 5000) {
                        return webRespond(`You do not have enough balance in your bank to perform this action. \`${5000 - +cbprofile.bankBalance}\` more karma required.`)
                    }

                    const featureBuy = Math.floor(+cbprofile.bankBalance - 5000)
                    customBots.sync()
                    console.log('(sequelize) Updated bots DB - Custom Bot')
                    await CBProfile.update({ featureCmd: 'true', bankBalance: featureBuy }, { where: { user_id: message.author.id } })
                    await webRespond(`Feature commands are now enabled! Use them through \`${botinfo.prefix} setprefix\` or \`${botinfo.prefix} setname\`!`)
                break;

                case 'gquote':
                    if(cbprofile.quoteCmd === 'true') {
                        return webRespond(`You already have \`gquote\` enabled.`)
                    }

                    if(cbprofile.bankBalance < 5000) {
                        return webRespond(`You do not have enough balance in your bank to perform this action. \`${25000 - +cbprofile.bankBalance}\` more karma required.`)
                    }

                    const quoteBuy = Math.floor(+cbprofile.bankBalance - 25000)
                    customBots.sync()
                    console.log('(sequelize) Updated bots DB - Custom Bot')
                    await CBProfile.update({ quoteCmd: 'true', bankBalance: quoteBuy }, { where: { user_id: message.author.id } })
                    await webRespond(`\`gquote\` is now enabled! Use it through \`${botinfo.prefix} gquote\`!`)
                break;

                case 'weather':
                    if(cbprofile.weatherCmd === 'true') {
                        return webRespond(`You already have \`weather\` enabled.`)
                    }

                    if(cbprofile.bankBalance < 5000) {
                        return webRespond(`You do not have enough balance in your bank to perform this action. \`${25000 - +cbprofile.bankBalance}\` more karma required.`)
                    }

                    const weatherBuy = Math.floor(+cbprofile.bankBalance - 25000)
                    customBots.sync()
                    console.log('(sequelize) Updated bots DB - Custom Bot')
                    await CBProfile.update({ weatherCmd: 'true', bankBalance: weatherBuy }, { where: { user_id: message.author.id } })
                    await webRespond(`\`weather\` is now enabled! Use it through \`${botinfo.prefix} weather\`!`)
                break;

                default:
                    await webRespond(`Unknown command name. Available Commands:\n- \`feature\` [Includes Feature Commands like \`setname\` and \`setprefix\`] - **5,000 karma**\n- \`gquote\`, \`weather\` - **25,000 karma** each`)
                break;
            }
        }

        // custom command
        if(!await Cmds.findOne({ where: { user_id: message.author.id, cmd_name: ments[1] } })) return;
        const findCmd = await Cmds.findOne({ where: { user_id: message.author.id, cmd_name: ments[1] } })
        if(message.content?.startsWith(`${botinfo.prefix} ${findCmd.cmd_name}`)) {
            await webRespond(findCmd.cmd_response)
            findCmd.increment('usage_count')
        }

    } catch (error) {
        console.log(error)
        message.reply(`Hmm. Something went wrong.\n\`${error.description}\``).then(msg => {
                try { 
                    setTimeout(() => { msg.delete() }, 6000)
            } catch (err) {
                return console.log(err) 
            }
        })
    }
}

module.exports = { cb }
