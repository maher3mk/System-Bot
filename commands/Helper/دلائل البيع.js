const fs = require('fs');
const path = require('path');
const { MessageActionRow, MessageButton, Modal, TextInputComponent } = require('discord.js');
const { client, db, settings } = require('../../index');
const { createEmbed } = require('../../function/function/Embed');

const dataPath = path.join(__dirname, '../../data', 'proofs.json');
function loadData() {
  if (!fs.existsSync(dataPath)) return { proofs: [], openRooms: {} };
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

const cancelButton = new MessageActionRow().addComponents(
    new MessageButton()
        .setCustomId('CancelButton')
        .setLabel('الغاء العملية؟')
        .setStyle('DANGER')
);

// ------------------------------------------------
//              Select Menu Handler
// ------------------------------------------------
client.on('interactionCreate', async interaction => {
    if (!interaction.isSelectMenu()) return;
    if (interaction.customId !== 'RedBull_Helber') return;

    const selectedValue = interaction.values[0];
    if (selectedValue !== 'دلائل البيع') return;

    if (!interaction.member.roles.cache.has(settings.Admins.DiscordStaff))
        return interaction.reply({ content: '**انت ادارة ؟ 😅**' });

    // إنشاء Modal
    const modal = new Modal()
        .setCustomId('CheckProofs')
        .setTitle('فحص دلائل البيع');

    const input = new TextInputComponent()
        .setCustomId('userId')
        .setLabel('ادخل ايدي العضو لفحص دلائله')
        .setStyle('SHORT')
        .setPlaceholder('مثال: 123456789012345678')
        .setRequired(true);

    const row = new MessageActionRow().addComponents(input);
    modal.addComponents(row);

    return interaction.showModal(modal);
});

// ------------------------------------------------
//              Modal Submit Handler
// ------------------------------------------------
client.on('interactionCreate', async interaction => {
    if (!interaction.isModalSubmit()) return;
    if (interaction.customId !== 'CheckProofs') return;

    try {
        // نستخدم deferReply بدون ephemeral
        await interaction.deferReply();

        const userId = interaction.fields.getTextInputValue('userId');

        // جلب دلائل البيع من ملف proofs.json
        const proofData = loadData();
        const userProofs = proofData.proofs.filter(p => p.userId === userId);

        const embed = createEmbed({
            interaction,
            title: 'دلائل البيع',
            description: `المستخدم: <@${userId}>\nعدد الدلائل: **${userProofs.length}**`,
            color: settings.لون_الامبيد
        });

        // الرد يظهر للجميع
        await interaction.editReply({ embeds: [embed], components: [cancelButton] });

    } catch (error) {
        console.error(error);
        if (!interaction.replied) await interaction.reply({ content: '❌ حدث خطأ.' });
        else await interaction.editReply({ content: '❌ حدث خطأ.' });
    }
});
