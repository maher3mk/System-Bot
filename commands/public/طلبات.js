const { Intents, Collection, Client, GuildMember, MessageActionRow, WebhookClient,MessagePayload, GatewayIntentBits, MessageSelectMenu, Modal, MessageEmbed,MessageButton, MessageAttachment, Permissions, TextInputComponent} = require('discord.js');
const { client, db , settings} = require('../../index');

const { createEmbed  } = require('../../function/function/Embed')


client.on('messageCreate', async message => {
    if (message.author.bot) return
    if (message.content == `${settings.prefix}setup-order`){

        if (!settings.Owners.includes(message.author.id)) return;


        const embed = createEmbed({
            interaction : message , 
            title : `يمكمك طلب ما تريد من هنا`, 
            description : `**
قوانين الطلبات

1-ممنوع طلب منتجات 18+
2-ممنوع طلب اعضاء او بارتنر
3-ممنوع طلب طرق نيترو و كريديت
4-ممنوع طلب اشياء في اماكن خطأ مثل : (تطلب نيترو في روم برمجيات او تصاميم)
5-ممنوع بيع اي شي           
**`, 
image : settings.ServerInfo.Orders
        })

        const buttons = new MessageActionRow().addComponents(

    new MessageSelectMenu()
        .setCustomId('SelectOrderType')
        .setPlaceholder('اختار نوع الطلب')
        .addOptions([
            { label: 'منتجات', value: 'Montgat' },
            { label: 'تصاميم', value: 'Tsamem' },
            { label: 'برمجيات', value: 'Devss' }
        ])

);

        await message.delete()
        await message.channel.send({embeds : [embed ], components : [buttons]})


    }
})


client.on('interactionCreate', async interaction => {
    if (!interaction.isSelectMenu()) return;
    if (interaction.customId !== 'SelectOrderType') return;

    const selectedValue = interaction.values[0];

    if (selectedValue === 'Montgat') {
        const OrderModal = new Modal()
            .setCustomId('OrderModalMontgat')
            .setTitle('اكمال عملية الطلب');

        const request = new TextInputComponent()
            .setCustomId('request')
            .setLabel("ما هو طلبك؟")
            .setStyle('PARAGRAPH');

        const firstActionRow = new MessageActionRow().addComponents(request);
        OrderModal.addComponents(firstActionRow);

        await interaction.showModal(OrderModal);
    }

    if (selectedValue === 'Devss') {
        const OrderModal = new Modal()
            .setCustomId('OrderModalDevss')
            .setTitle('اكمال عملية الطلب');

        const request = new TextInputComponent()
            .setCustomId('request')
            .setLabel("ما هو طلبك؟")
            .setStyle('PARAGRAPH');

        const firstActionRow = new MessageActionRow().addComponents(request);
        OrderModal.addComponents(firstActionRow);

        await interaction.showModal(OrderModal);
    }

    if (selectedValue === 'Tsamem') {
        const OrderModal = new Modal()
            .setCustomId('OrderModalTsamem')
            .setTitle('اكمال عملية الطلب');

        const request = new TextInputComponent()
            .setCustomId('request')
            .setLabel("ما هو طلبك؟")
            .setStyle('PARAGRAPH');

        const firstActionRow = new MessageActionRow().addComponents(request);
        OrderModal.addComponents(firstActionRow);

        await interaction.showModal(OrderModal);
    }
});

/// ارسال الطلب بعد الارسال من المودال - منتجات
client.on('interactionCreate', async interaction => {
    if (!interaction.isModalSubmit() || interaction.customId !== 'OrderModalMontgat') return;

    const Order = interaction.fields.getTextInputValue('request');
    await interaction.reply({ content: `تم ارسال طلبك بنجاح  | ✅`, ephemeral: true });

    const embed = createEmbed({
        interaction,
        title: `طلب جديد`,
        description: `- صاحب الطلب : ${interaction.user}\n\n\`\`\`${Order}\`\`\``,
    });

    const buttons = new MessageActionRow().addComponents(
        new MessageButton()
            .setCustomId('DeleteOrder')
            .setLabel('حذف الطلب')
            .setStyle('SECONDARY')
    );

    const Log = await interaction.guild.channels.fetch(settings.Orders.montgat.room);
    await Log.send({ content: `<@&${settings.Orders.montgat.role}>`, embeds: [embed], components: [buttons] });
    await Log.send({ files: [settings.ServerInfo.line] });
});

/// ارسال الطلب - برمجيات
client.on('interactionCreate', async interaction => {
    if (!interaction.isModalSubmit() || interaction.customId !== 'OrderModalDevss') return;

    const Order = interaction.fields.getTextInputValue('request');
    await interaction.reply({ content: `تم ارسال طلبك بنجاح  | ✅`, ephemeral: true });

    const embed = createEmbed({
        interaction,
        title: `طلب جديد`,
        description: `- صاحب الطلب : ${interaction.user}\n\n\`\`\`${Order}\`\`\``,
    });

    const buttons = new MessageActionRow().addComponents(
        new MessageButton()
            .setCustomId('DeleteOrder')
            .setLabel('حذف الطلب')
            .setStyle('SECONDARY')
    );

    const Log = await interaction.guild.channels.fetch(settings.Orders.devss.room);
    await Log.send({ content: `<@&${settings.Orders.devss.role}>`, embeds: [embed], components: [buttons] });
    await Log.send({ files: [settings.ServerInfo.line] });
});

/// ارسال الطلب - تصاميم
client.on('interactionCreate', async interaction => {
    if (!interaction.isModalSubmit() || interaction.customId !== 'OrderModalTsamem') return;

    const Order = interaction.fields.getTextInputValue('request');
    await interaction.reply({ content: `تم ارسال طلبك بنجاح  | ✅`, ephemeral: true });

    const embed = createEmbed({
        interaction,
        title: `طلب جديد`,
        description: `- صاحب الطلب : ${interaction.user}\n\n\`\`\`${Order}\`\`\``,
    });

    const buttons = new MessageActionRow().addComponents(
        new MessageButton()
            .setCustomId('DeleteOrder')
            .setLabel('حذف الطلب')
            .setStyle('SECONDARY')
    );

    const Log = await interaction.guild.channels.fetch(settings.Orders.tsamem.room);
    await Log.send({ content: `<@&${settings.Orders.tsamem.role}>`, embeds: [embed], components: [buttons] });
    await Log.send({ files: [settings.ServerInfo.line] });
});



client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;
    if (interaction.customId !== 'DeleteOrder') return;
    if (!interaction.member.roles.cache.has(settings.Admins.DiscordStaff)) return;

    const userId = interaction.message.embeds[0]?.description?.match(/<@!?(\d+)>/)?.[1];

    if (!userId) return;

    const embed = new MessageEmbed()
        .setDescription(`**
اهلا بك عزيزي الاداري ${interaction.user} بـ ميوتات الطلبات .
يُرجى منك اختيار سبب الميوت لـ مخالفة الشخص بـ الميوت .
ولِـ استلامك نقطة من قسم نقاط ميوتات الطلبات .
**`)

        .setColor('YELLOW');
    const select = new MessageActionRow().addComponents(
        new MessageSelectMenu()
            .setCustomId(`MuteReason_${userId}`)
            .setPlaceholder('اختر سبب الميوت')
            .addOptions([
                { label: 'طلب بروم غلط', value: 'wrong_channel' },
                { label: 'طلب اعضاء أو بارتنرز', value: 'ads' },
                { label: 'طلب منتجات 18+', value: 'adult' },
                { label: 'طلب ممنوع', value: 'forbidden' },
                { label: 'بيع داخل الطلب', value: 'selling' },
            ])
    );

    await interaction.reply({ embeds: [embed], components: [select], ephemeral: true });

});

const ms = require('ms'); // لازم تثبت المكتبة: npm install ms

client.on('interactionCreate', async interaction => {
    if (!interaction.isSelectMenu()) return;
    if (!interaction.customId.startsWith('MuteReason_')) return;

    const userId = interaction.customId.split('_')[1];
    const member = await interaction.guild.members.fetch(userId).catch(() => null);
    if (!member) return interaction.reply({ content: 'لم أتمكن من العثور على العضو.', ephemeral: true });

    const reason = interaction.values[0];
    const muteTimeString = settings.Orders.Time[reason];
    const muteRoleId = settings.Orders.Time.orderMute;

    if (!muteTimeString || !muteRoleId) return interaction.reply({ content: 'مدة الميوت أو الرتبة غير معرفة في الإعدادات.', ephemeral: true });

    const ms = require('ms');
    const muteTime = ms(muteTimeString);

    // إعطاء الرتبة مؤقتًا
    await member.roles.add(muteRoleId);
    setTimeout(async () => {
        await member.roles.remove(muteRoleId).catch(() => {});
    }, muteTime);

    // تأكيد للإداري
    await interaction.update({
        content: '**تم معاقبة العضو بنجاح ✅**',
        components: [],
        embeds: [],
        ephemeral: true
    });

    // -----------------------------------------
    // تسجيل اللوق
    // -----------------------------------------
    const logChannel = await interaction.guild.channels.fetch(settings.Rooms.LogOrders).catch(() => null);
    if (logChannel) {
        const targetUser = `<@${userId}> (\`${userId}\`)`;
        const staffUser = `<@${interaction.user.id}> (\`${interaction.user.id}\`)`;

        let orderContent = 'لم يتم استخراج الطلب.';
        if (interaction.message.embeds[0]) {
            const embedDesc = interaction.message.embeds[0].description || '';
            const match = embedDesc.match(/```([^`]*)```/);
            if (match) orderContent = match[1];
        }

        const reasons = {
            wrong_channel: 'طلب بروم غلط',
            ads: 'طلب اعضاء أو بارتنرز',
            adult: 'طلب منتجات 18+',
            forbidden: 'طلب ممنوع',
            selling: 'بيع داخل الطلب',
        };
        const reasonLabel = reasons[reason] || 'غير معروف';

        const logEmbed = new MessageEmbed()
            .setTitle('📌 تم تحذير العضو')
            .setDescription(
                `**العضو:** ${targetUser}\n**الإداري:** ${staffUser}\n**الطلب:** ${orderContent}\n**سبب التحذير:** ${reasonLabel}\n**الوقت:** <t:${Math.floor(Date.now()/1000)}:R>`
            )
            .setColor('RED');

        await logChannel.send({ embeds: [logEmbed] }).catch(() => {});
    }

    // -----------------------------------------
    // نقاط الإدارة
    // -----------------------------------------
    const dbpoint = require('../../index').dbpoint; // تأكد من تعريف dbpoint في ملف index.js
    const DataPoints = await dbpoint.get(`Points_Staff`);
    const Exit = DataPoints?.find(t => t.userid == interaction.user.id);

    if (Exit) {
        Exit.Mutes = (Exit.Mutes || 0) + 1;
        await dbpoint.set('Points_Staff', DataPoints);
    } else {
        await dbpoint.push('Points_Staff', {
            userid: interaction.user.id,
            Mutes: 1,
            point: 0,
        });
    }
});
