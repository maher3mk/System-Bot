const { Intents, Collection, Client, GuildMember, MessageActionRow, WebhookClient,MessagePayload, GatewayIntentBits, MessageSelectMenu, Modal, MessageEmbed,MessageButton, MessageAttachment, Permissions, TextInputComponent} = require('discord.js');
const { client, db , settings} = require('../../index');

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return
    if (interaction.commandName == 'close-open'){

     const Type = interaction.options.getString('role')
     if (!settings.Owners.includes(interaction.user.id)) return 
     await interaction.deferReply({})
                       

     
     await interaction.editReply({content : `**تم بنجاح ${Type} الرومات**`})

    }
})