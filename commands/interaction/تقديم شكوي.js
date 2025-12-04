const { Client, GatewayIntentBits, MessageActionRow, Modal, TextInputComponent, MessageEmbed, Permissions, MessageButton } = require('discord.js');
const { client, db, settings } = require('../../index');
const config = require('../../config/settings');
const { createEmbed } = require('../../function/function/Embed');
const fs = require('fs');
const path = require('path');

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'Complaint') {
        const modal = new Modal()
            .setCustomId('reportmodal')
            .setTitle('تقديم بلاغ علي اداري');

        const StaffID = new TextInputComponent()
            .setCustomId('StaffID')
            .setLabel("ايدي الاداري")
            .setPlaceholder("حط هنا ايدي الاداري وليس يوزره")
            .setStyle('SHORT');
        const story = new TextInputComponent()
            .setCustomId('story')
            .setLabel("القصة")
            .setPlaceholder("حط القصة هنا")
            .setStyle('PARAGRAPH');
        
        const firstActionRow = new MessageActionRow().addComponents(StaffID);
        const secondActionRow = new MessageActionRow().addComponents(story);
        modal.addComponents(firstActionRow, secondActionRow);

        await interaction.showModal(modal);

    }

});

client.on('interactionCreate', async interaction => {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId === 'reportmodal') {
        const StaffID = interaction.fields.getTextInputValue('StaffID');
        
        const story = interaction.fields.getTextInputValue('story');
        

        const embed = createEmbed({
            interaction: interaction,
            title: 'بلاغ على اداري',
            color: settings.لون_الامبيد,
            description: `**
        - الاداري: <@${StaffID}> | (\`${StaffID}\`)
        
        \`\`\`${story}\`\`\`
        **`,
            footer: { text: `تم التقديم بواسطة ${interaction.user.tag}` }
        });
        const addStaffBtn = new MessageButton()
        .setCustomId(`add_staff_${StaffID}`)
        .setLabel('اضافة الاداري')
        .setStyle('PRIMARY');

    const row = new MessageActionRow().addComponents(addStaffBtn);

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: false });
}
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId.startsWith('add_staff_')) {
        await interaction.deferUpdate().catch(console.error); 

        const staffId = interaction.customId.split('add_staff_')[1];

        if (!settings.Admins.DiscordLeder.includes(interaction.member.id)) {
            return interaction.channel.send({ content: "ليس لديك صلاحية استخدام هذا الزر." });
        }

        try {
            await interaction.channel.permissionOverwrites.edit(staffId, {
                VIEW_CHANNEL: true,
                SEND_MESSAGES: true,
                READ_MESSAGE_HISTORY: true
            });

            const addedEmbed = new MessageEmbed()
                .setColor(settings.لون_الامبيد)
                .setDescription(`**تم اضافة الإداري <@${staffId}> إلى التذكرة بنجاح.**`)
                .setFooter({ text: `بواسطة: ${interaction.user.tag}` })
                .setTimestamp();

            await interaction.channel.send({ embeds: [addedEmbed] });
        } catch (err) {
            console.error(err);
            return interaction.channel.send({ content: "حدث خطأ أثناء محاولة إضافة الإداري." });
        }
    }
});
