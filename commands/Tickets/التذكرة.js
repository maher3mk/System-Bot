const { 
    MessageActionRow,
    MessageSelectMenu,
    MessageEmbed
} = require('discord.js');

const { client, db, settings } = require('../../index');

client.on('messageCreate', message => {

    if (message.content !== settings.prefix + 'setup-ticket') return;
    if (!settings.Owners.includes(message.author.id)) return;

    const embed = new MessageEmbed()
        .setColor(settings.لون_الامبيد)
        .setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }))
        .setFooter(message.guild.name, message.guild.iconURL({ dynamic: true }))
        .setThumbnail(message.guild.iconURL({ dynamic: true }))
        .setImage('https://media.discordapp.net/attachments/1207553954515255327/1207598850710183936/18.png')
        .setDescription(`**اذا عندك سؤال , عايز تشتري رتبة / اعلان / منشور مميز الخ.. اختار الدعم الفني

ملاحظات :

تفتح شكوى و تكون على حد مش من طاقم الادارة = مخالفة
استهبال بالتكتات = مخالفة
تفتح تكت ملهاش علاقة بالي عايزه = مخالفة**`);

    // --- بناء الخيارات ---
    const options = [];

    if (settings.Tickets?.TicketSupport)
        options.push({ label: 'الدعم الفني', value: 'TicketSupport' });

    if (settings.Tickets?.TicketComplain)
        options.push({ label: 'شكوى إدارة', value: 'TicketComplain' });

    if (settings.Tickets?.TicketsKdaa)
        options.push({ label: 'طلب قاضي', value: 'TicketKdaa' });

    if (settings.Tickets?.TicketsMzad)
        options.push({ label: 'طلب مزاد', value: 'TicketMzad' });

    if (options.length === 0)
        return message.reply("❌ لا يوجد أي خيار تكت مفعل في الإعدادات.");

    // --- القائمة ---
    const row = new MessageActionRow().addComponents(
        new MessageSelectMenu()
            .setCustomId('open_Ticket')
            .setPlaceholder('اختر نوع التذكرة 👇')
            .addOptions(options)
    );

    message.channel.send({
        embeds: [embed],
        components: [row]
    });

});
