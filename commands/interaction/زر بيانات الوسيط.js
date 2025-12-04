const { Modal, TextInputComponent, MessageActionRow, MessageButton } = require('discord.js');
const { client, settings } = require('../../index');

client.on('interactionCreate', async interaction => {
    // لما يضغط الزر Byan
    if (interaction.isButton() && interaction.customId === 'Byan') {
        const modal = new Modal()
            .setCustomId('ByanModal')
            .setTitle('بيانات الوساطة')
            .addComponents(
                new MessageActionRow().addComponents(
                    new TextInputComponent()
                        .setCustomId('buyer')
                        .setLabel('المشتري (ID فقط)')
                        .setPlaceholder('مثال: 123456789012345678')
                        .setStyle('SHORT')
                        .setRequired(true)
                ),
                new MessageActionRow().addComponents(
                    new TextInputComponent()
                        .setCustomId('seller')
                        .setLabel('البايع (ID فقط)')
                        .setPlaceholder('مثال: 876543210987654321')
                        .setStyle('SHORT')
                        .setRequired(true)
                ),
                new MessageActionRow().addComponents(
                    new TextInputComponent()
                        .setCustomId('item')
                        .setLabel('السلعة')
                        .setStyle('SHORT')
                        .setRequired(true)
                ),
                new MessageActionRow().addComponents(
                    new TextInputComponent()
                        .setCustomId('price')
                        .setLabel('الثمن')
                        .setStyle('SHORT')
                        .setRequired(true)
                )
            );

        await interaction.showModal(modal);
    }

    // لما يرسل البيانات
    if (interaction.isModalSubmit() && interaction.customId === 'ByanModal') {
        await interaction.deferReply({ ephemeral: false });

        const buyerId = interaction.fields.getTextInputValue('buyer');
        const sellerId = interaction.fields.getTextInputValue('seller');
        const item = interaction.fields.getTextInputValue('item');
        const price = interaction.fields.getTextInputValue('price');

        const detailsMessage = `**
- المشتري: <@${buyerId}> \`(${buyerId})\`
- البايع: <@${sellerId}> \`(${sellerId})\`
- السلعة: ${item}
- الثمن: ${price}
**`;

        const notesMessage = `**ملاحظات مهمه:
- يرجي انتظار الوسيط بدون ازعاج
- يرجي عدم تحويل الي اي حساب الا فقط الي حساب الوسيط
- يرجي قراءه القوانين قبل بدأ عملية الوساطه
- تحويل المبلغ الي الوسيط يشمل ضريبة الوسيط
- لم نتحمل مسؤوليه تحويل الي حساب اخر غير الوسيط
**`;

        const chlog = interaction.channel;

        await chlog.send({ content: detailsMessage });
        await chlog.send({ content: notesMessage });
        await chlog.send({ files: [settings.ServerInfo.line] });

        const message = await interaction.message.fetch();
        const components = message.components.map(row => {
            return new MessageActionRow().addComponents(
                row.components.map(component => {
                    if (component.customId === 'Byan') {
                        return new MessageButton()
                            .setCustomId(component.customId)
                            .setLabel(component.label)
                            .setStyle(component.style)
                            .setDisabled(true);
                    }
                    return component;
                })
            );
        });
        
        await message.edit({ components });

        await interaction.editReply({ content: '✅ تم إرسال البيانات .', ephemeral: true });
    }
});