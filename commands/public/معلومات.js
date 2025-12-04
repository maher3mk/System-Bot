const { Intents, Collection, Client, GuildMember, MessageActionRow, WebhookClient, MessagePayload, GatewayIntentBits, MessageSelectMenu, Modal, MessageEmbed, MessageButton, MessageAttachment, Permissions, TextInputComponent } = require('discord.js');
const { client, db, settings } = require('../../index');
const fs = require('fs');
const { createEmbed } = require('../../function/function/Embed');

const dataFile = 'infoData.json';
let infoData = fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile, 'utf8')) : {};

const createSelectMenu = (customId) => {
    return new MessageActionRow().addComponents(
        new MessageSelectMenu()
            .setCustomId(customId)
            .setPlaceholder("اختر من القائمة")
            .addOptions([
                { label: "رتب عامة", value: "general_roles" },
                { label: "رتب نادرة", value: "rare_roles" },
                { label: "رومات خاصة", value: "private_rooms" },
                { label: "إعلانات", value: "announcements" },
                { label: "منشورات مميزة", value: "featured_posts" },
                { label: "إضافات", value: "addons" },
                { label: "إعادة تعيين", value: "reset" }
            ])
    );
};

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith(`${settings.prefix}setup-info`)) {
        if (!settings.Owners.includes(message.author.id)) return;

        const embed = new MessageEmbed()
            .setTitle(`# ${message.guild.name}`)
            .setDescription(`
            📌 **المعلومات**
            🔹 لرؤية معلومات **الرتب العامة** اختر "رتب عامة"
            🔹 لرؤية معلومات **الرتب النادرة** اختر "رتب نادرة"
            🔹 لرؤية معلومات **الرومات الخاصة** اختر "رومات خاصة"
            🔹 لرؤية معلومات **الإعلانات** اختر "إعلانات"
            🔹 لرؤية معلومات **المنشورات المميزة** اختر "منشورات مميزة"
            🔹 لرؤية معلومات **الإضافات** اختر "إضافات"
            🔄 لإعادة ضبط القائمة اختر "إعادة تعيين"
            `)
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setColor(settings.لون_الامبيد);

        message.channel.send({
            embeds: [embed],
            components: [createSelectMenu("info_menu")]
        });
        message.channel.send({ files: [settings.ServerInfo.line] });
    }

    if (message.content.startsWith(`${settings.prefix}set-info`)) {
        if (!settings.Owners.includes(message.author.id)) {
            return message.reply("❌ **هذا الأمر مخصص فقط لصاحب البوت!**");
        }

        const embed = new MessageEmbed()
            .setTitle("🔧 إعداد معلومات الفئات")
            .setDescription("اختر الفئة التي تريد تعديل معلوماتها أو اضغط **إعادة تعيين** لمسح الخيارات.")
            .setColor("YELLOW");

        message.reply({
            embeds: [embed],
            components: [createSelectMenu("set_info_menu")]
        });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isSelectMenu()) {
        const category = interaction.values[0];

        if (category === "reset") {
            if (interaction.customId === "info_menu") {
                await interaction.update({
                    embeds: [
                        new MessageEmbed()
                            .setTitle(`# ${interaction.guild.name}`)
                            .setDescription(`
                            📌 **المعلومات**
                            🔹 لرؤية معلومات **الرتب العامة** اختر "رتب عامة"
                            🔹 لرؤية معلومات **الرتب النادرة** اختر "رتب نادرة"
                            🔹 لرؤية معلومات **الرومات الخاصة** اختر "رومات خاصة"
                            🔹 لرؤية معلومات **الإعلانات** اختر "إعلانات"
                            🔹 لرؤية معلومات **المنشورات المميزة** اختر "منشورات مميزة"
                            🔹 لرؤية معلومات **الإضافات** اختر "إضافات"
                            🔄 لإعادة ضبط القائمة اختر "إعادة تعيين"
                            `)
                            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                            .setColor(settings.لون_الامبيد)
                    ],
                    components: [createSelectMenu("info_menu")]
                });
            } else if (interaction.customId === "set_info_menu") {
                await interaction.update({
                    embeds: [
                        new MessageEmbed()
                            .setTitle("🔧 إعداد معلومات الفئات")
                            .setDescription("اختر الفئة التي تريد تعديل معلوماتها أو اضغط **إعادة تعيين** لمسح الخيارات.")
                            .setColor("YELLOW")
                    ],
                    components: [createSelectMenu("set_info_menu")]
                });
            }
            return;
        }

        if (interaction.customId === "info_menu") {
            const response = infoData[category] || "❌ **لم يتم تعيين رد لهذه الفئة بعد!**";
            const embed = new MessageEmbed()
                .setTitle(" ")
                .setDescription(response)
                .setColor(settings.لون_الامبيد);

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (interaction.customId === "set_info_menu") {
            if (interaction.user.id !== interaction.guild.ownerId) {
                return interaction.reply({ content: "❌ **هذا الأمر مخصص فقط لصاحب السيرفر!**", ephemeral: true });
            }

            const modal = new Modal()
                .setCustomId(`set_info_modal_${category}`)
                .setTitle("تحديث المعلومات")
                .addComponents(
                    new MessageActionRow().addComponents(
                        new TextInputComponent()
                            .setCustomId("info_text")
                            .setLabel("أدخل المعلومات الجديدة:")
                            .setStyle("PARAGRAPH")
                            .setPlaceholder("اكتب المعلومات هنا...")
                            .setRequired(true)
                    )
                );

            await interaction.showModal(modal);
        }
    }

    if (interaction.isModalSubmit()) {
        if (interaction.customId.startsWith("set_info_modal_")) {
            const category = interaction.customId.replace("set_info_modal_", "");
            const newText = interaction.fields.getTextInputValue("info_text");

            infoData[category] = newText;
            fs.writeFileSync(dataFile, JSON.stringify(infoData, null, 2));

            await interaction.reply({ content: `✅ **تم تحديث معلومات ${category} بنجاح!**`, ephemeral: true });
        }
    }
});
