const { Intents, Collection, Client, GuildMember, MessageActionRow, WebhookClient,MessagePayload, GatewayIntentBits, MessageSelectMenu, Modal, MessageEmbed,MessageButton, MessageAttachment, Permissions, TextInputComponent} = require('discord.js');
const { client, db , settings} = require('../../index');
const { createEmbed  } = require('../../function/function/Embed')


client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (message.content.startsWith(`${settings.prefix}embed`)) {
        if (!message.member.roles.cache.has(settings.Admins.DiscordLeder)) return;

        const content = message.content.slice(`${settings.prefix}embed`.length).trim();
        let image = null;

        if (message.attachments.size > 0) {
            const attachment = message.attachments.first();
            image = attachment.url;
        }

        const embed = createEmbed({
            interaction: message,
            description: content,
            image: image,
        });

        await message.delete()
        await message.channel.send({embeds : [embed]})
    }
});
