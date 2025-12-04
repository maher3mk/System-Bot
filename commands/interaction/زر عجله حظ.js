const {
    Intents, Collection, Client, GuildMember,
    MessageActionRow, WebhookClient, MessagePayload, GatewayIntentBits,
    MessageSelectMenu, Modal, MessageEmbed, MessageButton, MessageAttachment,
    Permissions, TextInputComponent
} = require('discord.js');

const { client, db, dbTickets, settings } = require('../../index');
const { createEmbed } = require('../../function/function/Embed');
const checkCredits = require('../../function/function/checkCredits');
const Config = require('../../config/prices');
const Prizes = require('../../config/Spin');
client.on('interactionCreate', async interaction => {
    if (interaction.isButton()) {
        if (interaction.customId === 'BuySpin') {
            const row = new MessageActionRow().addComponents(
                new MessageSelectMenu()
                    .setCustomId('select_Spin')
                    .setPlaceholder(`Select Spin Type`)
                    .addOptions([
                        {
                            label: "Basic Spin",
                            description: "لـ شراء عجلة حظ عاديه",
                            value: "Buy_Basic",
                        },
                        {
                            label: "Exclusive Spin",
                            description: "لـ شراء عجلة حظ مميزه",
                            value: "Buy_Exclusive",
                        }
                    ])
            );

            const Emmed = new MessageEmbed()
                .setColor(settings.لون_الامبيد)
                .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                .setDescription(`>** يرجي اختيار نوع العجلة**`);

            await interaction.reply({
                embeds: [Emmed],
                components: [row],
            });
        } else if (interaction.customId === 'SpinBasic' || interaction.customId === 'SpinExclusive') {
            const disabledButton = new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId(interaction.customId)
                    .setLabel('Claimed...')
                    .setStyle('SUCCESS')
                    .setDisabled(true)
            );

            await interaction.update({
                components: [disabledButton]
            });

            await interaction.followUp({ content: `**جاري لف العجلة برجاء الانتظار**`, ephemeral: true });

            const type = interaction.customId === 'SpinBasic' ? 'Basic' : 'Exclusive';
            const prizes = Prizes.Spin[type].Prizes;
            const image = Config.Spin[type].SpinImage;
            const result = prizes[Math.floor(Math.random() * prizes.length)];

            setTimeout(async () => {
                const resultEmbed = new MessageEmbed()
                    .setTitle('> Result Spin')
                    .setDescription(`**- الجايزة: ${result}**`)
                    .setColor(settings.لون_الامبيد)
                    .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                    .setImage(image);

                await interaction.channel.send({ embeds: [resultEmbed] });
                await interaction.channel.send({ content: `**من فضلك انتظر التسليم بدون منشن**` });

                if (settings.ServerInfo?.line) {
                    await interaction.channel.send({ files: [settings.ServerInfo.line] }).catch(() => {});
                }

                if (Config.Spin[type].Line) {
                    await interaction.followUp({ content: Config.Spin[type].Line });
                }

                try {
                    await interaction.channel.setName(result);
                } catch (err) {
                    console.error(`خطأ في تغيير اسم الروم: ${err.message}`);
                }

                const logChannelId = Config.Spin[type].WinLog;
                const logChannel = interaction.guild.channels.cache.get(logChannelId);
                if (logChannel) {
                    const winEmbed = new MessageEmbed()
                        .setTitle('> New Winner Spin')
                        .setDescription(`> لقد فاز ${interaction.user}\n\nنوع العجلة: ${type}\nالنتيجة: ${result}\nيمكنكم المشاركة في عجلة الحظ و الفوز مثله واكثر !`)
                        .setColor(settings.لون_الامبيد)
                        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                        .setImage(image);

                    await logChannel.send({ embeds: [winEmbed] });
                    if (settings.ServerInfo?.line) {
                        await logChannel.send({ files: [settings.ServerInfo.line] }).catch(() => {});
                    }
                }
            }, 5000);
        }
    } else if (interaction.isSelectMenu() && interaction.customId === 'select_Spin') {
        const selectedValue = interaction.values[0];

        const isBasic = selectedValue === 'Buy_Basic';
        const type = isBasic ? 'Basic' : 'Exclusive';
        const price = Config.Spin[type];
        const tax = Math.floor(price * (20 / 19) + 1);

        await interaction.channel.send(`#credit ${settings.BankID} ${tax}`);

        const embed = createEmbed({
            interaction,
            title: `عملية شراء عجلة حظ ${isBasic ? 'عاديه' : 'مميزه'}`,
            image: null,
            color: settings.لون_الامبيد,
            description: `لأكمال عملية شراء عجلة الحظ, يرجي نسخ الكود بالاسفل واتمام عملية التحويل\n\n \`\`\`#credit ${settings.BankID} ${tax}\`\`\``
        });

        const buttonRow = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId(isBasic ? 'copyCreditButtons' : 'copyCreditButtoneverys')
                .setLabel('نسخ الامر')
                .setStyle('SECONDARY')
        );

        await interaction.update({ embeds: [embed], components: [buttonRow] });

        const result = await checkCredits(interaction, price, 60000, settings.BankID, settings.Probot);

        if (result.success) {
            const DataTicket = await dbTickets.get(`Tickets_Spin`);
            const ExitData = DataTicket?.find(t => t.Ticket === interaction.channel.id);

            if (ExitData) {
                if (!Array.isArray(ExitData.Buys)) {
                    ExitData.Buys = [];
                }
                ExitData.Buys.push(`تم شراء عجلة حظ ${isBasic ? 'عاديه' : 'مميزه'}`);
                
                await dbTickets.set(`Tickets_Spin`, DataTicket);
            }

            const spinButton = new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId(isBasic ? 'SpinBasic' : 'SpinExclusive')
                    .setLabel(`لف العجلة`)
                    .setStyle('PRIMARY')
            );

            await interaction.editReply({
                embeds: [interaction.message.embeds[0].setDescription(`**- تمت عملية الشراء بنجاح ✅\n\n اضغط علي الزر بالاسفل للف العجلة الخاصه بك**`)],
                components: [spinButton],
            });

            const logChannel = interaction.guild.channels.cache.get(settings.Rooms[isBasic ? 'LogSpin' : 'LogSpins']);
            if (logChannel) {
                const logEmbed = new MessageEmbed()
                    .setTitle('💳 عملية شراء عجلة حظ 💳')
                    .setColor(settings.EmbedColor)
                    .setThumbnail(interaction.guild.iconURL())
                    .setFooter(interaction.guild.name, interaction.guild.iconURL())
                    .setDescription(`- تم عملية شراء عجلة حظ ${isBasic ? 'عاديه' : 'مميزه'} بنجاح , التفاصيل :  
- الشخص : ${interaction.user}
- السعر : ${price} 
- الوقت : <t:${Math.floor(Date.now() / 1000)}:R>`)
                    .setTimestamp();

                await logChannel.send({ content: `**- ${interaction.user}**`, embeds: [logEmbed] });
            }
        } else {
            await interaction.editReply({
                embeds: [interaction.message.embeds[0].setDescription(`لقد انتهى الوقت، لا تقم بالتحويل ${interaction.user}`)],
                components: [],
            });
        }
    }
});