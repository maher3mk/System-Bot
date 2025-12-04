const { MessageActionRow, MessageSelectMenu, Modal, MessageEmbed, TextInputComponent } = require('discord.js');
const { client, settings } = require('../../index');
const fs = require('fs');

const dataFile = 'rulesData.json';
let rulesData = fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile, 'utf8')) : {};

const createSelectMenu = (customId) => {
    return new MessageActionRow().addComponents(
        new MessageSelectMenu()
            .setCustomId(customId)
            .setPlaceholder("اختر من القائمة")
            .addOptions([
                { label: "قوانين عامة", value: "general_rules" },
                { label: "قوانين البائعين", value: "seller_rules" },
                { label: "قوانين اداره", value: "Staff_rules" }
            ])
    );
};

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content === `${settings.prefix}setup-rules`) {
        if (!message.member.roles.cache.has(settings.Admins.DiscordLeder)) {
            return message.reply("❌ **هذا الأمر مخصص للإدارة العليا فقط!**");
        }

        const embed = new MessageEmbed()
            .setTitle(`# ${message.guild.name}`)
            .setDescription(`**القوانين**
لرؤية قوانين السيرفر اختار قوانين السيرفر
لرؤية قوانين البائعين اختار قوانين البائعين
لرؤية قوانين الادارة اختار قونين الادارة`)
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setColor(settings.لون_الامبيد);

        message.channel.send({
            embeds: [embed],
            components: [createSelectMenu("rules_menu")]
        });

        message.channel.send({ files: [settings.ServerInfo.line] });
    }

    if (message.content === `${settings.prefix}set-rules`) {
        if (!message.member.roles.cache.has(settings.Admins.DiscordLeder)) {
            return message.reply("❌ **هذا الأمر مخصص للإدارة العليا فقط!**");
        }

        const embed = new MessageEmbed()
            .setTitle("🔧 إعداد القوانين الفئات")
            .setDescription("اختر الفئة التي تريد تعديل القوانين لها أو اضغط **إعادة تعيين** لمسح الخيارات.")
            .setColor(settings.لون_الامبيد);

        message.reply({
            embeds: [embed],
            components: [createSelectMenu("set_rules_menu")]
        });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isSelectMenu()) {
        const category = interaction.values[0];

        if (category === "reset") {
            if (interaction.customId === "rules_menu") {
                await interaction.update({
                    embeds: [
                        new MessageEmbed()
                            .setTitle(`# ${interaction.guild.name}`)
                            .setDescription(`**القوانين**
لرؤية قوانين السيرفر اختار قوانين السيرفر
لرؤية قوانين البائعين اختار قوانين البائعين
لرؤية قوانين الادارة اختار قونين الادارة`)
                            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                            .setColor(settings)
                    ],
                    components: [createSelectMenu("rules_menu")]
                });
            } else if (interaction.customId === "set_rules_menu") {
                await interaction.update({
                    embeds: [
                        new MessageEmbed()
                            .setTitle("🔧 إعداد القوانين الفئات")
                            .setDescription("اختر الفئة التي تريد تعديل القوانين لها أو اضغط **إعادة تعيين** لمسح الخيارات.")
                            .setColor(settings.لون_الامبيد)
                    ],
                    components: [createSelectMenu("set_rules_menu")]
                });
            }
            return;
        }

        if (interaction.customId === "rules_menu") {
            const response = rulesData[category] || "❌ **لم يتم تعيين رد لهذه الفئة بعد!**";
            const embed = new MessageEmbed()
                .setTitle(" ")
                .setDescription(response)
                .setColor(settings.لون_الامبيد);

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (interaction.customId === "set_rules_menu") {
            if (interaction.user.id !== interaction.guild.ownerId) {
                return interaction.reply({ content: "❌ **هذا الأمر مخصص فقط لصاحب السيرفر!**", ephemeral: true });
            }

            const modal = new Modal()
                .setCustomId(`set_rules_modal_${category}`)
                .setTitle("تحديث القوانين")
                .addComponents(
                    new MessageActionRow().addComponents(
                        new TextInputComponent()
                            .setCustomId("rules_text")
                            .setLabel("أدخل القوانين الجديدة:")
                            .setStyle("PARAGRAPH")
                            .setPlaceholder("اكتب القوانين هنا...")
                            .setRequired(true)
                    )
                );

            await interaction.showModal(modal);
        }
    }

    if (interaction.isModalSubmit()) {
        if (interaction.customId.startsWith("set_rules_modal_")) {
            const category = interaction.customId.replace("set_rules_modal_", "");
            const newText = interaction.fields.getTextInputValue("rules_text");

            rulesData[category] = newText;
            fs.writeFileSync(dataFile, JSON.stringify(rulesData, null, 2));

            await interaction.reply({ content: `✅ **تم تحديث القوانين ${category} بنجاح!**`, ephemeral: true });
        }
    }
});
