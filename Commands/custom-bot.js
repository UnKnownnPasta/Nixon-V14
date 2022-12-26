const { customBots, karmaDB } = require('../Databases/dbinitilaize.js')
const [ Cmds, Bots, CBProfile, Karmas ] = [ customBots.models.Cmds, customBots.models.Bots, customBots.models.CBProfiles, karmaDB.models.Karmas ]
const { EmbedBuilder } = require('discord.js')
const { Sequelize } = require('sequelize')

module.exports = {
    async execute(message, client) {
        let textRegex = /[a-z0-9:/\- ]/gi
        try {
            const botinfo = await Bots.findOne({ where: { user_id: message.author.id } })
            const cbprofile = await CBProfile.findOne({ where: { user_id: message.author.id } })
            const karma = await Karmas.findOne({ where: { user_id: message.author.id } })

            const lorem = client.channels.cache.get(message.channel.id)
            const channel = await lorem.fetchWebhooks(); if(!channel) return;
            const webhook = channel.find(wh => wh.token); if(!webhook) return;

            async function webRespond(input, embed) {
                if (input == null) {
                    return await webhook.send({
                        username: botinfo.name,
                        avatarURL: botinfo.avatarurl,
                        embeds: [embed]
                    })
                } else {
                    return await webhook.send({
                        content: input,
                        username: botinfo.name,
                        avatarURL: botinfo.avatarurl,
                    })
                }

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

                if(karma.balance < 500) { return webRespond(`You don\'t have enough balance to perform this action. [500 karma required]`) }

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
                        await karma.update({ balance: Sequelize.literal('balance - 500') }, { where: { user_id: message.author.id } })
                        karma.sync()
                        console.log('(sequelize) Updated bots DB')
                        return webRespond(`Created command \`${cmdname}\` successfully!`)
                    }
                    if(r1.startsWith('no')) { return webRespond(`No commands will be created.`) }
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
                weather.find({search: weatherLocation, degreeType: 'C', }, async (err, result) => {
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

                await quoteChnl.messages.fetch({ limit: 60 }).then(async q => {
                    const quotessss = Array.from(q.values());
                    const ivalue = Math.floor(Math.random() * 71) // Math.floor(Math.random() * 40) + 1;
                    const thequote = await quotessss[ivalue]
                    var quoteEmedd;
                    if (thequote.embeds[0] == undefined) { quoteEmedd = new EmbedBuilder().setImage(thequote.attachments.first().url) }
                    else { quoteEmedd = thequote.embeds[0] }
                    return webRespond(null, quoteEmedd)
                })
            }

            if(message.content?.startsWith(`${botinfo.prefix} setavatar`)) {
                if(cbprofile.featureCmd === 'false') { 
                    return webRespond(`You cannot use this command yet, you have to buy it.`)
                }
                if(karma.balance < 100) {
                    return webRespond(`You don\'t have enough balance to perform this action. [100 karma required]`)
                }
                const avatrarRegex = /https?:\/\/.*\.(?:png|jpg)/
                const newAvatarUrl = ments.slice(2).join("")
                if (!newAvatarUrl || avatrarRegex.test(newAvatarUrl) === false) { return webRespond(`You didn\'t provide a valid url.`); }

                const confirmSN = new EmbedBuilder()
                .setDescription('Are you sure you want to change your bot\'s name to **' + newAvatarUrl + '** ?')
                .setColor('Grey')
                .setFooter({text: 'Respond with yes or no.'});
            
                await webRespond(null, confirmSN)
            
                message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 7000, errors: ['time'] }).then(async newnametrue => {
                    switch (newnametrue.first().content.toLowerCase()) {
                        case 'yes':
                            await botinfo.update({ avatarurl: newAvatarUrl }, { where: { user_id: message.author.id } })
                            await karma.update({ balance: Sequelize.literal('balance - 100') }, { where: { user_id: message.author.id } })
                            customBots.sync()
                            console.log('(sequelize) Updated bots DB')
                            await webRespond(`Changed your bot's name!`)
                        break;
                
                        case 'no': await webRespond(`Did not change your bot's name.`)
                        break;
                
                        default: return webRespond(`Invalid response`)
                    }
                }).catch(async () => {
                    return webRespond(`You ran out of time to respond.`)
                    
                })
                
            }

            if(message.content?.startsWith(`${botinfo.prefix} profile`)) {
                const profileEmbed = new EmbedBuilder()
                .setAuthor({name:`${message.author.username} - Profile`, iconURL:`${message.author.displayAvatarURL()}`})
                .setDescription(`Bot Info:\n**Name:** ${botinfo.name}\n**Prefix:** ${botinfo.prefix}\nReplies "**${botinfo.prefix} ${botinfo.test_cmd}**" with "**${botinfo.test_resp}**"\n`)
                .addFields(
                    { name: `- gquote`, value: `${cbprofile.quoteCmd === 'false' ? 'Disabled.' : 'Enabled.'}`, inline: true },
                    { name: `- weather`, value: `${cbprofile.weatherCmd === 'false' ? 'Disabled.' : 'Enabled.'}`, inline: true },
                    { name: `- embeds`, value: `${cbprofile.embedFeature === 'false' ? 'Disabled.' : 'Enabled.'}`, inline: true },
                    { name: `Feature Commands`, value: `${cbprofile.featureCmd === 'false' ? 'Disabled.' : 'Enabled.'}`, inline: true },
                )
                .setColor('DarkPurple');

                return webRespond(null, profileEmbed)
            }

            if(message.content?.startsWith(`${botinfo.prefix} setname`)) {
                if(cbprofile.featureCmd === 'false') { 
                    return webRespond(`You cannot use this command yet, you have to buy it.`)
                }
                if(karma.balance < 100) {
                    return webRespond(`You don\'t have enough balance to perform this action. [100 karma required]`)      
                }
                const newnamelink = ments.slice(2).join(" ")
                if(!newnamelink || textRegex.test(newnamelink) === false) {
                    return webRespond(`You didn\'t provide a valid bot name.`)
                }
                const confirmSN = new EmbedBuilder()
                .setDescription('Are you sure you want to change your bot\'s name to **' + newnamelink + '** ?')
                .setColor('Grey')
                .setFooter({ text: 'Respond with yes or no.' });

                await webRespond(null, confirmSN)

                message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 7000, errors: ['time'] }).then(async newnametrue => {
                    switch (newnametrue.first().content.toLowerCase()) {
                        case 'yes':
                            await botinfo.update({ name: newnamelink }, { where: { user_id: message.author.id } })
                            await karma.update({ balance: Sequelize('balance - 100') }, { where: { user_id: message.author.id } })
                            customBots.sync()
                            console.log('(sequelize) Updated bots DB')
                            await webRespond(`Changed your bot's name!`)
                        break;

                        case 'no': await webRespond(`Did not change your bot's name.`)
                        break;

                        default: return webRespond(`Invalid repsonse.`)
                    }
                }).catch(async () => {
                    await webRespond(`You ran out of time to respond.`)
                })

            }

            if(message.content?.startsWith(`${botinfo.prefix} setprefix`)) {
                if(cbprofile.featureCmd === 'false') { 
                    return webRespond(`You cannot use this command yet, you have to buy it.`)
                }
                if(karma.balance < 100) {
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
                        await botinfo.update({ prefix: newPrefix }, { where: { user_id: message.author.id } })
                        await karma.update({ balance: Sequelize.literal('balance - 100') }, { where: { user_id: message.author.id } })
                        customBots.sync()
                        console.log('(sequelize) Updated bots DB')
                        return webRespond(`__Set your bot's prefix to__ **${newPrefix}** !`)
                    } else {
                        if (mutated.first().content.toLowerCase() === 'no') { return webRespond(`Prefix will not be changed.`);
                        } else {
                        return webRespond(`Invalid response! Prefix will not be changed.`);
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
                    if (deletebot.first().content.toLowerCase() !== ['yes' && 'no']) {
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
                return webRespond(`**All commands:**\n${cmdString}`)
            }

            if(message.content?.startsWith(`${botinfo.prefix} editcmd`)) {
                if(cbprofile.featureCmd === 'false') { 
                    return webRespond(`You cannot use this command yet, you have to buy it.`)
                }

                const replacedto = ments.slice(3).join(" ")
                if(!ments[2] || !replacedto) {
                    return webRespond(`Command name or new response not given.`)
                }

                if(!(await Cmds.findOne({ where: { user_id: message.author.id, cmd_name: ments[2] } }))) {
                    return webRespond(`No such command with the name \`${ments[2]}\` exists.`)
                }

                await Cmds.update({ cmd_response: replacedto }, { where: { user_id: message.author.id, cmd_name: ments[2] } })
                customBots.sync()
                console.log('(sequelize) Updated bots DB')
                await webRespond(`Edited the response of \`${ments[2]}\` command to \`${replacedto}\`!`)
            }

            if(message.content?.startsWith(`${botinfo.prefix} buycmd`)) {
                switch (ments[2]) {
                    case 'feature':
                        if(cbprofile.featureCmd === 'true') {
                            return webRespond(`You already have feature commands enabled. These include \`setname\` and \`setprefix\` which do not need to be bought seperately.`)
                        }

                        if(karma.balance < 2000) {
                            return webRespond(`You do not have enough balance in your bank to perform this action. \`${2000 - karma.balance}\` more karma required.`)
                        }

                        const featureBuy = Math.floor(karma.balance - 2000)
                        await CBProfile.update({ featureCmd: 'true' }, { where: { user_id: message.author.id } })
                        await karma.update({ balance: Sequelize.literal('balance - 2000') })
                        customBots.sync()
                        console.log('(sequelize) Updated bots DB')
                        await webRespond(`Feature commands are now enabled! Use them through \`${botinfo.prefix} setprefix\` or \`${botinfo.prefix} setname\`!`)
                    break;

                    case 'gquote':
                        if(cbprofile.quoteCmd === 'true') {
                            return webRespond(`You already have \`gquote\` enabled.`)
                        }

                        if(karma.balance < 25000) {
                            return webRespond(`You do not have enough balance in your bank to perform this action. \`${25000 - karma.balance}\` more karma required.`)
                        }

                        await CBProfile.update({ quoteCmd: 'true' }, { where: { user_id: message.author.id } })
                        await karma.update({ balance: Sequelize.literal('balance - 25000') }, { where: { user_id: message.author.id } })
                        customBots.sync()
                        console.log('(sequelize) Updated bots DB')
                        await webRespond(`\`gquote\` is now enabled! Use it through \`${botinfo.prefix} gquote\`!`)
                    break;

                    case 'weather':
                        if(cbprofile.weatherCmd === 'true') {
                            return webRespond(`You already have \`weather\` enabled.`)
                        }

                        if(karma.balance < 5000) {
                            return webRespond(`You do not have enough balance in your bank to perform this action. \`${5000 - karma.balance}\` more karma required.`)
                        }


                        await CBProfile.update({ weatherCmd: 'true' }, { where: { user_id: message.author.id } })
                        await karma.update({ balance: Sequelize.literal('balance - 5000') }, { where: { user_id: message.author.id } })
                        customBots.sync()
                        console.log('(sequelize) Updated bots DB')
                        await webRespond(`\`weather\` is now enabled! Use it through \`${botinfo.prefix} weather\`!`)
                    break;

                    default:
                        await webRespond(`Unknown command name. Available Commands:\n- \`feature\` [Includes Feature Commands like \`setname\` and \`setprefix\`] - **5,000 karma**\n- \`gquote\` - **25,000 karma**, \`weather\` - **5,000 karma**`)
                    break;
                }
            }

            // custom command
            if(!(await Cmds.findOne({ where: { user_id: message.author.id, cmd_name: ments[1] } }))) return;
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
                    return console.log(err);
                }
            })
        }
    },
}
