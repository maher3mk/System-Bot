const { MessageActionRow, MessageSelectMenu, MessageButton } = require('discord.js');
const { client, settings } = require('../../index');
const { createEmbed } = require('../../function/function/Embed');

const cancelButton = new MessageActionRow().addComponents(
    new MessageButton()
        .setCustomId('CancelButton')
        .setLabel('الغاء العملية؟')
        .setStyle('DANGER')
);

client.on('messageCreate', async (message) => {
    if (!message.content.startsWith(settings.prefix + 'helper')) return;
    if (!message.member.roles.cache.has(settings.Admins.DiscordStaff)) return;

    const embed = createEmbed({
        interaction: message,
        title: 'مساعد الادارة الذكي',
        description: `ازيك ي ${message.author}, اختار الخدمة اللي بدك تعملها.`,
    });

    const row = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId('RedBull_Helber')
                .setPlaceholder(`${message.author.displayName} محتاج مساعدة؟`)
                .addOptions([
                    { label: 'فحص تكت', value: 'فحص تكت' },
                    { label: 'فحص تحذير', value: 'فحص تحذير' },
                    { label: 'فحص بوست', value: 'فحص بوست' },
                    { label: 'دلائل البيع', value: 'دلائل البيع' }, // تم الإضافة
                ]),
        );

    await message.reply({ embeds: [embed], components: [row, cancelButton] });
});
