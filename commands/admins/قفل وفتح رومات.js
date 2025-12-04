const { Intents, Collection, Client, GuildMember, MessageActionRow, WebhookClient,MessagePayload, GatewayIntentBits, MessageSelectMenu, Modal, MessageEmbed,MessageButton, MessageAttachment, Permissions, TextInputComponent} = require('discord.js');
const { client, db , settings} = require('../../index');
const { createEmbed } = require('../../function/function/Embed');
const cron = require('node-cron');
const { default: chalk } = require('chalk');

cron.schedule('0 22 * * *', async () => {
    console.log(chalk.red(`Time Close Rooms Sellers`));

    const channelsToEdit = settings.Close_Open.Rooms;

    for (let i = 0; i < channelsToEdit.length; i++) {
        const channelId = channelsToEdit[i];
        const channel = await client.channels.cache.get(channelId);

        if (channel) {
            const everyoneRole = channel.guild.roles.everyone;
            await channel.permissionOverwrites.edit(everyoneRole, {
                VIEW_CHANNEL: false
            });

            console.log(chalk.gray.bgBlack(`Done Close Room ${channel.name}`));
        } else {
            console.error(`Room Err (${channelId})`);
        }
    }

    const Server = await client.guilds.cache.get(settings.ServerInfo.serverID);
    const embed = createEmbed({
        title: 'تم اغلاق الرومات',
        description: `تم اغلاق الرومات , سيتم فتحها الساعه الـ8 بتوقيت صباحا بتوقيت السعودية`
    });

    const log = await Server.channels.cache.get(settings.Close_Open.log);
    if (log) {
        const messages = await log.messages.fetch();
        await log.bulkDelete(messages);
        await log.send({ embeds: [embed]});
        await log.send({ files: [settings.ServerInfo.line] });
    } else {
        console.error('Log channel not found');
    }
});

cron.schedule('0 6 * * *', async () => {
    console.log(chalk.green(`Time Open or Refresh Rooms Sellers`));
    const channelsToEdit = settings.Close_Open.Rooms;

    for (const channelId of channelsToEdit) {
        const channel = await client.channels.cache.get(channelId);
        if (!channel) {
            console.error(`Room Err (${channelId})`);
            continue;
        }

        const everyoneRole = channel.guild.roles.everyone;
        await channel.permissionOverwrites.edit(everyoneRole, {
            VIEW_CHANNEL: true
        });

        if (settings.Close_Open.refresh) {
            try {
                const fetchedMessages = await channel.messages.fetch({ limit: 100 });
                await channel.bulkDelete(fetchedMessages, true);
                console.log(chalk.yellow(`Cleared messages in ${channel.name}`));
            } catch (err) {
                console.error(`Error clearing messages in ${channel.name}:`, err);
            }
        }

        console.log(chalk.gray.bgBlack(`Done Open Room ${channel.name}`));
    }

    const embed = createEmbed({
        title : 'تجديد رومات النشر', 
        description : '** تم تجديد رومات النشر بنجاح **'
    });

    const Server = await client.guilds.cache.get(settings.ServerInfo.serverID);
    const log = await Server.channels.cache.get(settings.Close_Open.log);

    if (log) {
        const messages = await log.messages.fetch();
        await log.bulkDelete(messages);
        await log.send({ content: `@here`, embeds: [embed] });
        await log.send({ files: [settings.ServerInfo.line] });
    }
});