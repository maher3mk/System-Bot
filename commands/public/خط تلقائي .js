const { Intents, Collection, Client, GuildMember, MessageActionRow, WebhookClient,MessagePayload, GatewayIntentBits, MessageSelectMenu, Modal, MessageEmbed,MessageButton, MessageAttachment, Permissions, TextInputComponent} = require('discord.js');
const { client, db , settings} = require('../../index');

client.on('messageCreate', async message => {
    if (message.author.bot) return
    if (settings.AutoLine.includes(message.channel.id)){

        await message.channel.send({files : [settings.ServerInfo.line]})

    }
})