const { Intents, Collection, Client, GuildMember, MessageActionRow, WebhookClient,MessagePayload, GatewayIntentBits, MessageSelectMenu, Modal, MessageEmbed,MessageButton, MessageAttachment, Permissions, TextInputComponent} = require('discord.js');
const { client, db , settings} = require('../../index');


client.on('messageCreate', async message => {
    if (message.author.bot) return;
    const prefix = settings.prefix;
    const command = `${prefix}say`;
    if (message.content.startsWith(command)) {
        if (!message.member.roles.cache.has(settings.Admins.DiscordLeder)) return;

        const content = message.content.slice(command.length).trim();
        let image = null;

        if (message.attachments.size > 0) {
            const attachment = message.attachments.first();
            image = attachment.url;
        }

        await message.delete();
        await message.channel.send({ content: `${content}`, files: image || null });

    }
});
