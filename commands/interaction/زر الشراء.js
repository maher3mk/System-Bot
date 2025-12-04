const { Client, MessageActionRow, MessageSelectMenu, MessageEmbed, MessageButton } = require('discord.js');
const { client, db, settings } = require('../../index');

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'BuyShop') {

        const row = new MessageActionRow().addComponents(
            new MessageSelectMenu()
                .setCustomId('select_Buy')
                .setPlaceholder(`حابب تشتري اي ؟ ${interaction.member.displayName}`)
                .addOptions([
                    {
                        label: "الرتب",
                        description: "لـ شراء الرتب العامة او ازالة تحذير او نقل رتب",
                        value: "Buy_Role",
                    },
                    {
                        label: "الأعلانات",
                        description: "لـ شراء اعلان لسيرفرك",
                        value: "Buy_Ads_Mention",
                    },
                    {
                        label: "المنشورات المميزة",
                        description: "لـ شراء منشور مميز",
                        value: "Buy_Post",
                    },
                    {
                        label: "الرومات الخاصة",
                        description: "لـ شراء روم خاص او تجديد روم خاص",
                        value: "Buy_Privte_Room",
                    },
                ])
        );

        const but = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('CancelButton')
                .setLabel('الغاء العملية ؟')
                .setStyle('DANGER')
        );

        const Emmed = new MessageEmbed()
            .setColor(settings.لون_الامبيد)
            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setDescription(`**- الرتب : شراء الرتب العامة او ازالة تحذيرات او نقل الرتب
- المنشورات المميزة : شراء منشور مميز
- الاعلانات : شراء اعلان لسيرفرك
- الرومات الخاصة : شراء روم خاص لنشر منتجاتك**`);

        await interaction.reply({
            embeds: [Emmed],
            components: [row, but],
        });
    }
});
