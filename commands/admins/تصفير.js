const { Intents, Collection, Client, GuildMember, MessageActionRow, WebhookClient,MessagePayload, GatewayIntentBits, MessageSelectMenu, Modal, MessageEmbed,MessageButton, MessageAttachment, Permissions, TextInputComponent} = require('discord.js');
const { client, db ,dbpoint ,  settings} = require('../../index');
const { createEmbed  } = require('../../function/function/Embed')


client.on('messageCreate', async message => {
    if (message.author.bot) return
    if (message.content === `${settings.prefix}تصفير`) {
        if (!message.member.roles.cache.has(settings.Admins.DiscordLeder)) return


    const staffPoints = await dbpoint.get(`Points_Staff`);
    staffPoints.forEach(async (dataPoint) => {
        dataPoint.point = 0;
        dataPoint.Warn = 0;

    });
    await dbpoint.set(`Points_Staff`, staffPoints);

    const kdaaPoints = await dbpoint.get(`Points_Kdaa`);
    kdaaPoints.forEach(async (dataPoint) => {
        dataPoint.point = 0;
    });
    await dbpoint.set(`Points_Kdaa`, kdaaPoints);

    const embed = createEmbed({
        interaction: message , 
        title : `تمت عملية التصفير بنجاح`, 
        description : `تم تصفير نقاط القضاه والادارة بالكامل`
    })

    await message.reply({embeds : [embed]})

    }
})
