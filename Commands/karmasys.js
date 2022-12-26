const { karmaDB, customBots } = require('../Databases/dbinitilaize');
const karma = karmaDB.models.Karmas
const { EmbedBuilder } = require('discord.js');
const { Sequelize } = require('sequelize');
const items = ['bot', 'role', 'progress']

module.exports = {
    async execute(message, client) {
        if ((await karma.findOne({ where: { user_id: message.author.id } })) === null) {
            await karma.create({
                user_id: message.author.id,
                balance: 0,
                prestige: 0,
                multiplier: 1.0,
                prestigePercent: 0.0,
                prestigeReq: 100.0,
                prestigeEmojis: '◾|||||◽'
            })
            console.log(`(sequelize) Created new karma DB for user ${message.author.username}.`)
        } else {
            var curUser = await karma.findOne({ where: { user_id: message.author.id } })
            await karma.update({ balance: Math.round(((curUser.balance + 10*curUser.multiplier))*100)/100 }, { where: { user_id: message.author.id } })
            await karma.update({ prestigePercent: Math.round((curUser.prestigePercent + 0.1*curUser.multiplier)*100)/100 }, { where: { user_id: `${message.author.id}` } })
            console.log('(sequelize) incremented from:', curUser.balance, curUser.prestigePercent)
        }

        await karma.sync()
        var curUser = await karma.findOne({ where: { user_id: message.author.id } })

        const presPerc = curUser.prestigePercent
        if (presPerc >= curUser.prestigeReq) { // Prestige rank up
            message.channel.send(`**${message.author.username}**, you have ranked up!`)
            curUser.update({ prestigePercent: 0.0, prestige: Sequelize.literal('prestige + 1'), multiplier: Sequelize.literal('multiplier + 0.2'),
                prestigeReq: Sequelize.literal('prestigeReq + 30.0') }, { where: { user_id: message.author.id } });
            await karma.sync()
        }

        if (message.content.startsWith('\'bal')) { // Balance command - rank/multi/bal
            var trashArr = Array(10).fill(curUser.prestigeEmojis.split('|||||').pop().trim())
            var abcx = curUser.prestigeEmojis.split('|||||').shift().trim()
            function ping() {
                if (message.mentions.members.first() != undefined) { return message.mentions.members.first().user;
                } else { return message.guild.members.cache.get(message.author.id).user; }
            }
            const mesPing = ping()
            var curUser = await karma.findOne({ where: { user_id: mesPing.id } })
            if (curUser == null) { return message.reply('User doesnt have a karma thingy idk') }
            for (i=0; i <= 10; i++) { // create progress bar of prestige
                var x = ((curUser.prestigeReq/10)-(i*curUser.multiplier))*10
                if (presPerc > x) {
                    trashArr.splice(i, 1, abcx)
                }
            }
            trashArr.reverse()
            console.log(trashArr)
            const balanceEmbed = new EmbedBuilder()
            .setAuthor({ name: mesPing.username, iconURL: mesPing.displayAvatarURL() })
            .setDescription(`-- **Balance:** ${curUser.balance}\n-- **Prestige Rank:** rank \`${curUser.prestige}\`\n-- **Multiplier:** x${curUser.multiplier}
            \n**Prestige Progress:**\n${trashArr.join('')}  [**${curUser.prestigePercent}%**]`)
            .setColor('DarkOrange');
            message.reply({ embeds: [balanceEmbed] })
        }

        else if (message.content.startsWith('\'lb')) { // leaderboard - lb/multi
            const lbFetch = await karma.findAll()
            var lbList = []
            for (i=0; i < lbFetch.length; i++) {
                lbList.push(`${lbFetch[i].balance}-0/0-${lbFetch[i].user_id}`)
            }
            function dep(a, b) {
                this.x = a.split('-0/0-')[0]
                this.y = b.split('-0/0-')[0]
                if (parseInt(this.x) == parseInt(this.y)) return 0
                return parseInt(this.x) > parseInt(this.y) ? -1 : 1
            }
            lbList = lbList.sort((dep))
            lbList = lbList.slice(0,5)
            const lbEmbed = new EmbedBuilder()
            .setAuthor({ name: 'Leaderboard', iconURL: message.guild.iconURL() })
            
            await message.guild.members.fetch({ force: true })
            for (i=0; i < lbList.length; i++) {
                var a = lbList[i].split('-0/0-')
                lbEmbed.addFields({ name: `${i+1}.   ${client.users.cache.get(a[1]).username}`, value: `**${a[0]}** | x**${(await karma.findOne({ where: { user_id: a[1] } })).multiplier}**` })
            }
            message.reply({ embeds: [lbEmbed] });
        }

        else if (message.content.startsWith('\'prestige')) { // Display all ranks and perks
            const prestEmbed = new EmbedBuilder()
            .setTitle('Rank System')
            .setDescription(`**Info:**
            Prestige by getting more karma from chatting, every next prestige you get + 0.2 times more karma per message (base 1.0). This also affects how fast u gain prestige % (increases from base 1k messages)
            **Ranks and perks:**`)
            for (i=0; i < 3; i++) {
                prestEmbed.addFields({ name: `rank ${i}`, value: `Multiplier: \`${1.0 + (i/10)}\` **|** Prestige requirement: ${1000 + (i*300)} messages` })
            }

            message.reply({embeds: [prestEmbed]})
        }
        
        else if (message.content.startsWith('\'shop')) {
            const shopEmbed = new EmbedBuilder()
            .setTitle('Shop')
            .addFields(
                { name: '1 | Custom role - Keyword: \`role\`', value: 'Role with name and color of your choice   **|**   \`6k\` karma', inline: true },
                { name: '2 | Custom Bot - Keyword: \`bot\`', value: 'Get your own custom bot   **|**   \`20k\` karma', inline: true },
                { name: '3 | Custom Progress bar - Keyword: \`progress\`', value: 'Change how prestige progress bar looks  **|** \`3k\` karma', inline: false }
            )
            .setFooter({ text: `Your balance: ${curUser.balance}`, iconURL: message.author.displayAvatarURL() })
            message.reply({ embeds: [shopEmbed] })
        }

        else if (message.content.startsWith('\'buy')) {
            var product = message.content.split(' ').splice(1)
            if (product.length == 0) { product = 'notfound' }
            else { // identifying input for what to buy
                for (i in product) {
                    if (items.indexOf(product[i]) != -1) {
                        product = items[i]
                        break
                    }
                    else if (['1', '2', '3'].indexOf(product[i]) != -1) {
                        product = parseInt(product[i])
                        break
                    }
                    if (i+1 == product.length) {
                        product == 'notfound'
                    }
                }
            }
            if (product == 'notfound') {
                return message.reply('Invalid item to purchase')
            }

            const filter = m => m.author.id == message.author.id
            switch (product) {
                case 'bot':
                case 2:
                    if (curUser.balance < 20000) { return message.reply(`Not enough balance. Need \`${20000 - Math.abs(curUser.balance)}\` more karma.`) }

                    const botCl = message.channel.createMessageCollector({ filter, time: 30000, max: 5 })
                    var [ dataList, x ] = [['', '', '', '', '', message.author], ['Name of the bot?', 'Avatar url for the bot: [needs to be a valid PNG]', 'Default command name?', 'Response to default command?', 'Finally, prefix of the bot:', 'Please wait..']]
                    var count = 0

                    message.channel.send({ content: x[count] })
                    botCl.on('collect', m => {
                        if (m.content == 'exit') {
                            botCl.stop()
                            return message.reply('Stopped.')
                        }
                        dataList.splice(count, 1, m.content)
                        count += 1
                        message.channel.send({ content: x[count] })
                    })
                    botCl.on('end', x => {
                        if (dataList.indexOf('') != -1) {
                            return message.reply('You took too long to respond.')
                        }
                        client.temp = dataList
                        require('./slashcmd/createcustombot').execute(message, client)
                    })

                break;

                case 'progress':
                case 3:
                    if (curUser.balance < 3000) { return message.reply(`Not enough balance. Need \`${3000 - Math.abs(curUser.balance)}\` more karma.`) }

                    message.channel.send('Choose a emoji for no progress [Default: \◾]')
                    var cout = 0
                    const progCl = message.channel.createMessageCollector({ filter, time: 30000, max: 2 })
                    var dataList = ['', '']
                    var xxx = ['', 'Choose a icon for progress [Default: \◽]', 'Please wait..']
                    progCl.on('collect', m => {
                        dataList.splice(cout, 1, m.content)
                        cout+=1
                        message.channel.send(xxx[cout])
                    })
                    progCl.on('end', async m => {
                        if (dataList.indexOf('') != -1) {
                            if (dataList[0] == '') dataList[0] = '◾'
                            if (dataList[1] == '') dataList[1] = '◽'
                        }
                        await karma.update({ prestigeEmojis: dataList.join('|||||'), balance: Sequelize.literal('balance - 3000') }, { where: { user_id: message.author.id } })
                        karma.sync()
                        console.log('(sequelize) Updated DB - Purchase of progress bar')
                        return message.reply('Success; Updated progress bar looks')
                    })
                break;
            }
        }

        else if (message.content.startsWith('\'drop')) {

        }
    }
}