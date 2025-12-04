const { Intents, Collection, Client, GuildMember, MessageActionRow, WebhookClient, MessagePayload, GatewayIntentBits, MessageSelectMenu, Modal, MessageEmbed, MessageButton, MessageAttachment, Permissions, TextInputComponent } = require('discord.js');
const { client, db, dbTickets, settings } = require('../../index');
const Roles = require('../../config/Roles');
const { createEmbed } = require('../../function/function/Embed');
const checkCredits = require('../../function/function/checkCredits');


client.on('interactionCreate', async interaction => {
    if (!interaction.isSelectMenu()) return;

    if (interaction.customId === 'select_Buy') {
        const selectedValue = interaction.values[0];

        if (selectedValue === 'Buy_Role') {


            const but = new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId('CancelButton')
                    .setLabel('الغاء العملية ؟')
                    .setStyle('DANGER')
            );

            const row = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId('RolesBuy')
                        .setPlaceholder(`Select`)
                        .addOptions([
                            {
                                label: "الرتب العامة",
                                description:"لـ شراء الرتب العامة",
                                value: "Buy_Role",
                            },
                            {
                                label: "الرتب النادره",
                                description: "لـ شراء رتب نادره",
                                value: "Buy_Rare_Role",
                            },
                            {
                                label: "ازالة تحذير",
                                description: "لـ شراء ازالة تحذير",
                                value: "Buy_Remove_Warn",
                            },
                            {
                                label: "نقل رتب",
                                description: "لـ شراء نقل الرتب",
                                value: "Buy_Transfare",
                            },
                        ])
                );

                const description = "** برجاء اختيار نوع الرتبة المراد **"
                
                await interaction.update({
                    embeds: [interaction.message.embeds[0].setDescription(description)],
                    components: [row, but]
                });
            }
        }
    });