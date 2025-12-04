const { Intents, Collection, Client, GuildMember, MessageActionRow, WebhookClient,MessagePayload, GatewayIntentBits, MessageSelectMenu, Modal, MessageEmbed,MessageButton, MessageAttachment, Permissions, TextInputComponent} = require('discord.js');
const { client, db , settings} = require('../../index');

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return
    if (interaction.customId == 'CancelButton'){

        await interaction.update({content : `**تم الغاء العملية بنجاح **`, embeds : [], components : []})

        setTimeout(() => {
            interaction.deleteReply()
        }, 2000);
        
    }
})