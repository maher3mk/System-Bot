const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { client, db, TC, dbTickets, settings } = require('../../index');

client.on('interactionCreate', async interaction => {
    if (!interaction.isSelectMenu()) return;
    if (interaction.customId !== 'open_Waseet') return;

    const selectedValue = interaction.values[0]; 
    const wasetNumber = selectedValue.replace('Waseet', ''); 

    if (!['1', '2', '3', '4', '5'].includes(wasetNumber)) return;

    const categoryID = settings.Wasset[`wasset${wasetNumber}cat`];
    if (!categoryID) {
        return await interaction.reply({ content: `❌ لا يمكن العثور على التصنيف المناسب لهذا الاختيار.`, ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });
    await interaction.message.edit({ components: interaction.message.components });

    const blacklist = await db.get(`BlackList`);
    const isBlacklisted = blacklist?.find(t => t.userid === interaction.user.id && t.type === 'تكت');
    if (isBlacklisted) {
        return await interaction.editReply({ content: `**لديك بلاك ليست تكت , لا يمكنك انشاء تذكره | ❌**` });
    }

    const ticketKey = `waset${wasetNumber}`;
    const ticketDBKey = `Tickets_waset${wasetNumber}`;
    const DataCount = await TC.get(ticketKey);
    const DataTicket = await dbTickets.get(ticketDBKey);
    const existing = DataTicket?.find(t => t.userid === interaction.user.id);

    if (existing && existing.type === 'open') {
        return await interaction.editReply({ content: `**لديك تذكرة بالفعل يجب إغلاقها أولا <#${existing.Ticket}> | 😅**` });
    }

    await interaction.editReply({ content: `**جاري انشاء التذكرة الان | 🥰**` });

    const count = DataCount?.count || 1;
    const channel = await interaction.guild.channels.create(`med-${count}`, {
        type: 'GUILD_TEXT',
        parent: categoryID,
        permissionOverwrites: [
            {
                id: interaction.guild.roles.everyone.id,
                deny: ['VIEW_CHANNEL'],
            },
            {
                id: interaction.user.id,
                allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES'],
            },
            {
                id: settings.Admins.DiscordStaff,
                allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES'],
            }
        ]
    });

    if (DataCount) {
        DataCount.count++;
        await TC.set(ticketKey, DataCount);
    } else {
        await TC.set(ticketKey, { count: 1 });
    }

    const embed = new MessageEmbed()
        .setColor(settings.لون_الامبيد)
        .setAuthor(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
        .setFooter(interaction.guild.name, interaction.guild.iconURL({ dynamic: true }))
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setImage('https://media.discordapp.net/attachments/1207553954515255327/1207598850710183936/18.png')
        .setDescription(`**- مرحبا بك عزيزي العضو في تكت الوسيط. \n\n برجاء مليء البيان الذي في الاسفل لكي تتم عمليه الوساطه*`);

    const buttons = new MessageActionRow().addComponents(
        new MessageButton()
            .setCustomId('Byan')
            .setLabel('مليء البيانات')
            .setStyle('SUCCESS'),
        new MessageButton()
            .setCustomId(`WasetHelp${wasetNumber}`)
            .setLabel('مساعد الوسيط')
            .setStyle('SECONDARY'),
        new MessageButton()
            .setCustomId('ClaimTicket')
            .setLabel('استلام التذكرة')
            .setStyle('SECONDARY'),
        new MessageButton()
            .setCustomId('CloseTicket')
            .setLabel('احذف التذكرة')
            .setStyle('DANGER'),
    );

    await dbTickets.push(ticketDBKey, {
        userid: interaction.user.id,
        time: `<t:${Math.floor(Date.now() / 1000)}:R>`,
        claim: null,
        transcrept: null,
        Buys: null,
        NameTicket: channel.name,
        Ticket: channel.id,
        type: selectedValue
    });

    await channel.send({
        content: `${interaction.user} || <@&${settings.Admins.DiscordStaff}>`,
        embeds: [embed],
        components: [buttons]
    });

    if (interaction.message.attachments.size > 0) {
        const files = interaction.message.attachments.map(a => a.url);
        await channel.send({ files });
    }

    await channel.send({ files: [settings.ServerInfo.line] });

    await interaction.editReply({ content: `**تم انشاء التذكرة بنجاح ${channel} | ✅**` });
});
