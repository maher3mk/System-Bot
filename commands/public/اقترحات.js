const { Intents, Collection, Client, GuildMember, MessageActionRow, WebhookClient,MessagePayload, GatewayIntentBits, MessageSelectMenu, Modal, MessageEmbed,MessageButton, MessageAttachment, Permissions, TextInputComponent} = require('discord.js');
const { client, db , settings} = require('../../index');
const { createEmbed  } = require('../../function/function/Embed')

client.on('messageCreate', async message => {
    if (message.channel.id == settings.Rooms.Sug){
    if (message.author.bot) return

    let SuggestContent = message.content;
    await message.delete();

    const embed = createEmbed({
        interaction : message , 
        title : `اقتراح جديد`, 
        description : `**- اقتراح من : ${message.author}\n\n\`\`\`${SuggestContent}\`\`\`**`
    })

   const T = await message.channel.send({embeds : [embed]})
   await message.channel.send({files : [settings.ServerInfo.line]})
   await T.react(`<:Like:1208038716539539456>`)
   await T.react(`<:Dislike:1208038718259335198>`)

 }
})