const { SlashCommandBuilder, EmbedBuilder, WebhookClient } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quote')
        .setDescription('Snap a message to #quotes'),
    async execute(interaction, client) {
        const channel = client.channels.cache.get(interaction.channelId)
        const wbhook = await channel.fetchWebhooks()
        const webhooks = wbhook.find(wh => wh.token)
        if (!webhooks) {
          return console.log('No available Webhooks.')
        } // temporary for testing

        // initialize a webhook
        const webhookClient = new WebhookClient({id: webhooks.id, token: webhooks.token}, );		
        interaction.channel.messages.fetch({limit: 2})
        .then(interactionMappings => {
          let mint = Array.from(interactionMappings.values());
          let previousinteraction = mint[0];

            if(previousinteraction.attachments.size > 0 || previousinteraction.embeds[0]) {

              if(previousinteraction.embeds[0] != null) { // Quoting plain text
                    webhookClient.send({
                    content: `**${interaction.user.username} quoted:**`,
                    username: 'class11 Utilities',
                    avatarURL: 'https://cdn.discordapp.com/avatars/821969847651008545/51cd3c234ef9f12fe1a0f14a2449c954.webp?size=80',
                    embeds: [previousinteraction.embeds[0]]
                });

                } else { // Quoting a image
                  previousinteraction.attachments.forEach(attachment => {
                    const ImageLink = attachment.proxyURL;
                    console.log(`  Recieved Image: ${ImageLink}`)
                    const quoteEmbed1 = new EmbedBuilder()
                      .setTitle(`" ${previousinteraction.content} " - ${previousinteraction.author.tag}`)
                      .setFooter({ text: `In ${interaction.channel.name}` })
                      .setURL(previousinteraction.url)
                      .setImage(`${ImageLink}`);

                    webhookClient.send({
                        content: `**${interaction.user.username} quoted:**`,
                        username: 'class11 Utilities',
                        avatarURL: 'https://cdn.discordapp.com/avatars/821969847651008545/51cd3c234ef9f12fe1a0f14a2449c954.webp?size=80',
                        embeds: [quoteEmbed1],
                    });
                });
            }

                } else { // Quoting a embed
                  const quoteEmbed2 = new EmbedBuilder()
                  .setTitle(`" ${previousinteraction.content} " - ${previousinteraction.author.tag}`)
                  .setURL(previousinteraction.url)
                  .setFooter({ text: `In ${interaction.channel.name}` });
          
                  webhookClient.send({
                      content: `**${interaction.user.username} quoted:**`,
                      username: 'class11 Utilities',
                      avatarURL: 'https://cdn.discordapp.com/avatars/821969847651008545/51cd3c234ef9f12fe1a0f14a2449c954.webp?size=80',
                      embeds: [quoteEmbed2],
                  });
                };
        })
        interaction.reply({ content: 'Quoted!', ephemeral: true })
    },
};

/*

 const webhookClient = new WebhookClient({id: '844932187886190612', token: 'JPNOKPbl4jZLn2ejJtDS02Ne0oDwpmkSpoVZBVxvkjSw2bTMdXUIalL35xoLISnqNgy9'}, );

        interaction.channel.messages.fetch({limit: 2})
        .then(interactionMappings => {
        let mint = Array.from(interactionMappings.values());
        let previousinteraction = mint[0];

            //   if(previousinteraction.author.id === interaction.user.id) return interaction.reply('nope')
            if(previousinteraction.attachments.size > 0 || previousinteraction.embeds[0]) {
    
              if(previousinteraction.embeds[0] != null) {
    
                    webhookClient.send({
                    content: `**${interaction.user.username} quoted:**`,
                    username: 'class10 Utilities',
                    avatarURL: 'https://cdn.discordapp.com/avatars/821969847651008545/288fedaba96a166a0ccea7ac90c0ce6b.webp',
                    embeds: [previousinteraction.embeds[0]]
                });
    
                } else {
                  previousinteraction.attachments.forEach(attachment => {
                  const ImageLink = attachment.proxyURL;
                  console.log(ImageLink)
                  const quoteEmbed1 = new MessageEmbed()
                    .setTitle(`" ${previousinteraction.content} " - ${previousinteraction.author.tag}`)
                    .setFooter(`In ${interaction.channel.name}`)
                    .setURL(previousinteraction.url)
                    .setImage(`${ImageLink}`);
    
                  webhookClient.send({
                      content: `**${interaction.user.username} quoted:**`,
                      username: 'class10 Utilities',
                      avatarURL: 'https://cdn.discordapp.com/avatars/821969847651008545/51cd3c234ef9f12fe1a0f14a2449c954.webp?size=80',
                      embeds: [quoteEmbed1],
                  });
                });
            }
    
                } else {
                  const quoteEmbed2 = new MessageEmbed()
                  .setTitle(`" ${previousinteraction.content} " - ${previousinteraction.author.tag}`)
                  .setURL(previousinteraction.url)
                  .setFooter(`In ${interaction.channel.name}`);
          
                  webhookClient.send({
                      content: `**${interaction.user.username} quoted:**`,
                      username: 'class10 Utilities',
                      avatarURL: 'https://cdn.discordapp.com/avatars/821969847651008545/51cd3c234ef9f12fe1a0f14a2449c954.webp?size=80',
                      embeds: [quoteEmbed2],
                  });
                }
            
            //   if(previousinteraction.author.id === interaction.user.id) return interaction.reply('nope')
        
        
    })
        interaction.reply({ content: 'Quoted!', ephemeral: true })



*/