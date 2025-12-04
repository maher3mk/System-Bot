const { Intents, Collection, Client, GuildMember, MessageActionRow, WebhookClient,MessagePayload, GatewayIntentBits, MessageSelectMenu, Modal, MessageEmbed,MessageButton, MessageAttachment, Permissions, TextInputComponent} = require('discord.js');
const { client, db , settings} = require('../../index');
const { createEmbed } = require('../../function/function/Embed')

client.on('messageCreate', async message => {
    if (message.author.bot) return
    if (message.content == `${settings.prefix}setup-tashfer`){
        if (!settings.Owners.includes(message.author.id)) return;

        const embed = createEmbed({
            interaction : message , 
            title : `تشفير ريدبول`, 
            description : `**لتشفير منشورك يرجى ضغط الزر ووضع منشورك**`, 
            image : settings.ServerInfo.tashfer
        })

        const buttons = new MessageActionRow().addComponents(
            new MessageButton()
            .setCustomId('Tashfeer')
            .setLabel('شفر منشورك الان')
            .setStyle('SECONDARY'), 
        )

        await message.delete()
        await message.channel.send({embeds : [embed ], components : [buttons]})
    }
})

const wordReplacements = {
    "متجر": "متـgـر",
    "حساب": "7ـساب",
    "بيع": "بـيـ3",
    "شراء": "شـrـراء",
    "شوب": "شـ9ب",
    "ديسكورد": "ديسـkورد",
    "سعر": "سـ3ـر",
    "متوفر": "متـ9فر",
    "بوست": "بـ9ست",
    "نيترو": "نيـtـرو",
    "توكنات": "تـ9ـكنات ",
};

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton() && !interaction.isModalSubmit()) return;

    const { customId } = interaction;

    // فتح المودال
    if (customId === 'Tashfeer') {
        const TashfeerModal = new Modal()
            .setCustomId('TashfeerModal')
            .setTitle('شفر منشورك الان');

        const ThePost = new TextInputComponent()
            .setCustomId('ThePost')
            .setLabel("منشورك")
            .setPlaceholder('اكتب منشورك هنا')
            .setStyle('PARAGRAPH');

        const firstActionRow = new MessageActionRow().addComponents(ThePost);
        TashfeerModal.addComponents(firstActionRow);

        return await interaction.showModal(TashfeerModal);
    }

    // معالجة التشفير
    if (customId === 'TashfeerModal') {
        await interaction.deferReply({ ephemeral: true });

        const originalPost = interaction.fields.getTextInputValue('ThePost');

        if (!originalPost.trim()) {
            return interaction.editReply({ content: 'لا يمكن أن يكون حقل النص فارغاً، الرجاء المحاولة مرة أخرى.' });
        }

        // تشفير
        const modifiedPost = originalPost.replace(
            new RegExp(Object.keys(wordReplacements).join('|'), 'gi'),
            match => wordReplacements[match.toLowerCase()] || match
        );

        // إذا ما تغير شيء
        if (modifiedPost === originalPost) {
            return interaction.editReply({
                content: `✔ منشورك خالي من الكلمات المخالفة.`
            });
        }

        // إنشاء زر نسخ النص
        const copyButton = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('CopyPost')
                .setLabel('انسخ النص')
                .setStyle('PRIMARY')
        );

        // إرسال المنشور المشفر + زر النسخ
        return interaction.editReply({
            content: `- منشورك بعد التشفير:\n${modifiedPost}`,
            components: [copyButton]
        });
    }

    // عند الضغط على زر "نسخ النص"
    // عند الضغط على زر "نسخ النص" - يرسل للخاص
if (customId === 'CopyPost') {
    const encryptedText = interaction.message.content.replace("- منشورك بعد التشفير:\n", "");

    try {
        // إرسال الخاص
        await interaction.user.send(`📩 **نصك المشفّر:**\n${encryptedText}`);

        return interaction.reply({
            content: "✔ تم إرسال النص المشفّر إلى الخاص.",
            ephemeral: true
        });

    } catch (err) {
        return interaction.reply({
            content: "❌ لا يمكن إرسال رسالة إلى الخاص، يبدو أن الخاص لديك مقفل.",
            ephemeral: true
        });
    }
}

});
