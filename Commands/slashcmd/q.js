const { SlashCommandBuilder, EmbedBuilder, WebhookClient } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('q')
        .setDescription('Snap a message to #quotes')
        .addStringOption(option => option.setName('msgid').setDescription('Message id of msg to be quoted').setRequired(false)),
    async execute(interaction, client) {
      interaction.deferReply({ ephemeral: true })
        try {
          const channel = client.guilds.cache.get('771277167123365888').channels.cache.get('1006155557008330782')
          const wbhk = await channel.fetchWebhooks()
          const webhooks = wbhk.find(wh => wh.token)
          var webhookClient = new WebhookClient({id: webhooks.id, token: webhooks.token});
        } catch (err) {
          interaction.editReply('Something went wrong.')
        }

        async function webSend(emb) {
          await webhookClient.send({
              content: `**${interaction.user.username} quoted:**`,
              username: 'class11 Utilities',
              avatarURL: 'https://cdn.discordapp.com/avatars/821969847651008545/51cd3c234ef9f12fe1a0f14a2449c954.webp?size=80',
              embeds: [emb]
          });
          interaction.editReply({ content: 'Quoted!', ephemeral: true })
        }

        const intRecieved = interaction.options.getString('msgid')
        if (intRecieved != null) { // quoting given message id
          if (/^\d+$/.test(intRecieved) == false) return interaction.editReply('Invalid message id');
          interaction.channel.messages.fetch(intRecieved).then(fetchedMessage => {
            if (fetchedMessage == null) return interaction.editReply('Invalid message id.')
            var quoteEmbed = new EmbedBuilder()
            .setTitle(`" ${fetchedMessage.content} " - ${fetchedMessage.author.username}`)
            .setFooter({ text: `In ${interaction.channel.name}` })
            .setURL(fetchedMessage.url);
  
            if (fetchedMessage.attachments.size == 0) return webSend(quoteEmbed);
            if (fetchedMessage.embeds[0] == null) {
              fetchedMessage.attachments.forEach(attachment => { // fetching all images on message
                const ImageLink = attachment.proxyURL;
                console.log(`(interaction) Recieved Image: ${ImageLink}`)
                quoteEmbed.setImage(`${ImageLink}`);
                return webSend(quoteEmbed);
              })
            } else { return webSend(fetchedMessage.embeds[0]) };
          });
        } else {
          interaction.channel.messages.fetch({limit: 2})
          .then(interactionMappings => {
            let mint = Array.from(interactionMappings.values());
            let prevInteraction = mint[0];

            if(prevInteraction.attachments.size > 0 || prevInteraction.embeds[0]) {
              if(prevInteraction.embeds[0] != null) { // Quoting plain text
                  webSend(prevInteraction.embeds[0]);
              } else { // Quoting a image
                  prevInteraction.attachments.forEach(attachment => { // fetching all images on message
                    const ImageLink = attachment.proxyURL;
                    console.log(`(interaction) Recieved Image: ${ImageLink}`)

                    const quoteEmbed1 = new EmbedBuilder()
                      .setTitle(`" ${prevInteraction.content} " - ${prevInteraction.author.tag}`)
                      .setFooter({ text: `In ${interaction.channel.name}` })
                      .setURL(prevInteraction.url)
                      .setImage(`${ImageLink}`);
                    webSend(quoteEmbed1);
                });
              };
            } else { // Quoting a embed
              const quoteEmbed2 = new EmbedBuilder()
                .setTitle(`" ${prevInteraction.content} " - ${prevInteraction.author.tag}`)
                .setURL(prevInteraction.url)
                .setFooter({ text: `In ${interaction.channel.name}` });
              webSend(quoteEmbed2);
            };
          })
        }
    },
};