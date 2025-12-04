const { Intents, Collection, Client, GuildMember, MessageActionRow, WebhookClient, MessagePayload, GatewayIntentBits, MessageSelectMenu, Modal, MessageEmbed, MessageButton, MessageAttachment, Permissions, TextInputComponent } = require('discord.js');
const { client, db, dbTickets, settings } = require('../../index');
const Roles = require('../../config/Roles');
const { createEmbed } = require('../../function/function/Embed');
const checkCredits = require('../../function/function/checkCredits');
const fs = require('fs');
const dataFile = 'infoData.json';
const Config = require('../../config/prices')

client.on('interactionCreate', async interaction => {
    if (!interaction.isSelectMenu()) return;

    if (interaction.customId === 'RolesBuy') {
        const selectedValue = interaction.values[0];

        if (selectedValue === 'Buy_Transfare') {
            const userRoles = interaction.member.roles.cache.filter(role => Roles.RolesSellers.includes(role.id));
            const roleOptions = userRoles.map(role => ({
                label: role.name,
                value: role.id,
                description: `مستخدم حاليًا: ${role.name}`,
            }));

            if (roleOptions.length === 0) {
                return interaction.reply({
                    content: "ليس لديك أي رتب لتمريرها.",
                    ephemeral: true
                });
            }

            const transferButton = new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId('TransferRolesButton')
                    .setLabel('نقل الرتب')
                    .setStyle('PRIMARY')
            );

            const embed = createEmbed({
                interaction: interaction,
                title: 'الرتب المتاحة للنقل',
                color: settings.لون_الامبيد,
                description: `الرتب المتاحة لديك لنقلها: \n${roleOptions.map(r => r.label).join('\n')}`,
            });

            await interaction.update({
                embeds: [embed],
                components: [transferButton]
            });
        }
    } else if (interaction.isButton() && interaction.customId === 'TransferRolesButton') {
        // Send a message with a copy of the role transfer process
        const role = interaction.member.roles.cache.find(role => Roles.RolesSellers.includes(role.id));

        if (!role) {
            return interaction.reply({
                content: "لا يوجد لديك رتبة للبيع.",
                ephemeral: true
            });
        }
    } else if (interaction.customId == 'TransferRolesButton') {

        const tax = Math.floor(Config.Transfer.transfer * (20 / 19) + 1);
        const options = {
            title: `عملية شراء رتبة `,
            image: null,
            color: settings.لون_الامبيد,
            description: `لإكمال عملية شراء الرتبة, يرجى نسخ الكود أدناه واتمام عملية التحويل\n\n \`\`\`#credit ${settings.BankID} ${tax}\`\`\``
        };

        const embed = createEmbed({
            interaction: interaction,
            title: options.title,
            image: options.image,
            color: options.color,
            description: options.description
        });

        const copyCreditButton = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('copyCreditButtonRole')
                .setLabel('نسخ الأمر')
                .setStyle('SECONDARY')
        );

        await interaction.update({
            embeds: [embed],
            components: [copyCreditButton]
        });

        const options2 = {
            price: role.price,
            time: 60000,
            bank: settings.BankID,
            probot: settings.Probot,
        };

        try {
            const result = await checkCredits(interaction, options2.price, options2.time, options2.bank, options2.probot);

            if (result.success) {
                // Send a message to notify the user that the transaction is done and show "ضع الايدي" button
                const doneButton = new MessageActionRow().addComponents(
                    new MessageButton()
                        .setCustomId('EnterUserIDButton')
                        .setLabel('ضع الايدي')
                        .setStyle('PRIMARY')
                );

                await interaction.followUp({
                    content: "تمت العملية بنجاح. اضغط على زر 'ضع الايدي' لإتمام نقل الرتبة.",
                    components: [doneButton]
                });
            } else {
                await interaction.editReply({
                    embeds: [interaction.message.embeds[0].setDescription(`لقد انتهى الوقت، لا تقم بالتحويل ${interaction.user}`)],
                    components: [],
                });
            }
        } catch (error) {
            console.error(error);
            interaction.editReply('حدث خطأ ');
        }
    } else if (interaction.isButton() && interaction.customId === 'EnterUserIDButton') {
        // Open a modal to enter the user ID
        const modal = new Modal()
            .setCustomId('UserIDModal')
            .setTitle('إدخال معرف المستخدم')
            .addComponents(
                new TextInputComponent()
                    .setCustomId('userIDInput')
                    .setLabel('أدخل معرف المستخدم')
                    .setStyle('SHORT')
                    .setRequired(true)
            );

        await interaction.showModal(modal);
    } else if (interaction.isModalSubmit() && interaction.customId === 'UserIDModal') {
        const userID = interaction.fields.getTextInputValue('userIDInput');
        const user = await interaction.guild.members.fetch(userID);

        if (!user) {
            return interaction.reply({
                content: 'لم يتم العثور على المستخدم. يرجى التأكد من إدخال المعرف بشكل صحيح.',
                ephemeral: true
            });
        }

        // Transfer the roles to the user
        const rolesToTransfer = interaction.member.roles.cache.filter(role => Roles.RolesSellers.includes(role.id));
        await user.roles.add(rolesToTransfer);
        await interaction.member.roles.remove(rolesToTransfer);

        // Disable the button after it's used
        const disabledButton = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('EnterUserIDButton')
                .setLabel('تم نقل الرتب')
                .setStyle('SECONDARY')
                .setDisabled(true)
        );

        await interaction.update({
            content: `تم نقل الرتب إلى ${user.user.tag} بنجاح.`,
            components: [disabledButton]
        });
    }
});