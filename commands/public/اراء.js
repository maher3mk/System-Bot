const { Intents, Collection, Client, GuildMember, MessageActionRow, WebhookClient,MessagePayload, GatewayIntentBits, MessageSelectMenu, Modal, MessageEmbed,MessageButton, MessageAttachment, Permissions, TextInputComponent} = require('discord.js');
const { client, db , settings} = require('../../index');

const { createEmbed  } = require('../../function/function/Embed')

client.on('messageCreate', async message => {
    if (message.channel.id == settings.Rooms.Feedback){
    if (message.author.bot) return

    let FeedbackContent = message.content;
    await message.delete();

    const embed = createEmbed({
        interaction : message , 
        title : `شكرا لرأيك يعسل 🤎`, 
        description : `**- ${message.author}\n- FeedBack : ${FeedbackContent}**`
    })
   const T = await message.channel.send({embeds : [embed]})
   await message.channel.send({files : [settings.ServerInfo.line]})


 }
})