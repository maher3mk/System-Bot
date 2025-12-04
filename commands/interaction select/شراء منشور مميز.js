const { Intents, Collection, Client, GuildMember, MessageActionRow, WebhookClient,MessagePayload, GatewayIntentBits, MessageSelectMenu, Modal, MessageEmbed,MessageButton, MessageAttachment, Permissions, TextInputComponent} = require('discord.js');
const { client, db ,dbTickets ,  settings} = require('../../index');
const { createEmbed  } = require('../../function/function/Embed')
const checkCredits = require('../../function/function/checkCredits')
const Config = require('../../config/prices')
const dataFile = 'infoData.json';
const fs = require('fs');

const openModals = new Map();
const submittedPosts = new Map();

client.on('interactionCreate', async interaction => {

    if (!interaction.isSelectMenu()) return;
  
    if (interaction.customId === 'select_Buy') {
        const selectedValue = interaction.values[0];
  
        if (selectedValue == 'Buy_Post') {
            const but = new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId('CancelButton')
                    .setLabel('الغاء العملية ؟')
                    .setStyle('DANGER')
            )

            const row = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId('PostsBuy')
                        .setPlaceholder(`اختار نوع المنشن الي عاوزة  ${interaction.user.displayName}`)
                        .addOptions([
                            {
                                label: `منشن هير`,
                                value: 'MentionHerePost',
                            },
                            {
                                label: `منشن ايفري`,
                                value: 'MentionEveryPost',
                            },
                        ]),
                );
                let infoData = fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile, 'utf8')) : {};

                const description = infoData["featured_posts"] || "❌ **لم يتم تعيين رد لهذه الفئة بعد!**";
                
                await interaction.update({
                    embeds: [interaction.message.embeds[0].setDescription(description)],
                    components: [row, but]
                });
 }
    } else if (interaction.customId == 'PostsBuy') {
        const selectedValue = interaction.values[0];

        if (selectedValue === 'MentionHerePost') {
            const tax = Math.floor(Config.Posts.here * (20 / 19) + 1);
            const options1 = {
                TitleEm: `عملية شراء منشور مميز منشن هير`,
                ImageEm: null,
                colorEm: settings.لون_الامبيد,
                DesEm: `لأكمال عملية شراء المنشور المميز , يرجي نسخ الكود بالاسفل واتمام عملية التحويل\n\n \`\`\`#credit ${settings.BankID} ${tax}\`\`\``
            };
            await interaction.channel.send(`#credit ${settings.BankID} ${tax}`);
            const embed1 = createEmbed({
                interaction: interaction,
                title: options1.TitleEm,
                image: options1.ImageEm,
                color: options1.colorEm,
                description: options1.DesEm
            });
            const copyCreditButton = new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId('copyCreditButtons')
                    .setLabel('نسخ الامر')
                    .setStyle('SECONDARY')
            );

            await interaction.update({embeds: [embed1], components: [copyCreditButton]});  

            const options2 = {
                price: Config.Posts.here ,
                time: 60000,
                bank: settings.BankID,
                probot: settings.Probot,
            };

            const result = await checkCredits(interaction, options2.price, options2.time, options2.bank, options2.probot);

            if (result.success) {

                const DataTicket = await dbTickets.get(`Tickets_Support`)
                const ExitData = DataTicket?.find((t) => t.Ticket = interaction.channel.id)

                if (ExitData) {
                    if (ExitData.Buys == null) {
                        ExitData.Buys = "تم شراء منشور مميز هير";
                    }
                    await dbTickets.set(`Tickets_Support`, DataTicket);
                }


                const button = new MessageActionRow().addComponents(
                    new MessageButton()
                    .setCustomId('posthere')
                    .setLabel(`اضغط هنا لنشر منشورك`)
                    .setStyle('PRIMARY')
                )


                await interaction.editReply({
                    embeds: [interaction.message.embeds[0].setDescription(`**- تمت عملية الشراء بنجاح ✅\n\n اضغط علي الزر بالاسفل وضع منشورك لكي يتم نشره**`)],
                    components: [button],
                });


                const Log = await interaction.guild.channels.cache.get(settings.Rooms.LogPosts)
                if (Log){
                    const embed = createEmbed(interaction, `عملية شراء منشور ناجحة`, null, `
- تم عملية شراء منشور مميز منشن هير بنجاح , التفاصيل : 
- الشخص : ${interaction.user}
- السعر : ${Config.Posts.here}
- الوقت : <t:${Math.floor(Date.now() / 1000)}:R>
`);
        
                    await Log.send({embeds : [embed]})
                }



            } else {
                await interaction.editReply({
                    embeds: [interaction.message.embeds[0].setDescription(`لقد انتهى الوقت، لا تقم بالتحويل ${interaction.user}`)],
                    components: [],
                });   

            }

        } else if (selectedValue === 'MentionEveryPost') {
          
            const tax = Math.floor(Config.Posts.every * (20 / 19) + 1);

            const options3 = {
                TitleEm: `عملية شراء منشور مميز منشن ايفري`,
                ImageEm: null,
                colorEm: settings.لون_الامبيد,
                DesEm: `لأكمال عملية شراء المنشور المميز , يرجي نسخ الكود بالاسفل واتمام عملية التحويل\n\n \`\`\`#credit ${settings.BankID} ${tax}\`\`\``
            };
            await interaction.channel.send(`#credit ${settings.BankID} ${tax}`);
            const embed2 = createEmbed({
                interaction: interaction,
                title: options3.TitleEm,
                image: options3.ImageEm,
                color: options3.colorEm,
                description: options3.DesEm
            });
            const copyCreditButtonevery = new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId('copyCreditButtoneverys')
                    .setLabel('نسخ الامر')
                    .setStyle('SECONDARY')
            );

            await interaction.update({embeds: [embed2], components: [copyCreditButtonevery]});  

            const options2 = {
                price: Config.Posts.every ,
                time: 60000,
                bank: settings.BankID,
                probot: settings.Probot,
            };

            const result = await checkCredits(interaction, options2.price, options2.time, options2.bank, options2.probot);

            if (result.success) {
                const DataTicket = await dbTickets.get(`Tickets_Support`)
                const ExitData = DataTicket?.find((t) => t.Ticket = interaction.channel.id)
                if (ExitData) {
                    if (ExitData.Buys == null) {
                        ExitData.Buys = ["تم شراء منشور مميز ايفري"];
                    } else {
                        ExitData.Buys += "تم شراء منشور مميز ايفري";
                    }
                    await dbTickets.set(`Tickets_Support`, DataTicket);
                }

                const button = new MessageActionRow().addComponents(
                    new MessageButton()
                    .setCustomId('postevery')
                    .setLabel(`اضغط هنا لنشر منشورك`)
                    .setStyle('PRIMARY')
                )


                await interaction.editReply({
                    embeds: [interaction.message.embeds[0].setDescription(`**- تمت عملية الشراء بنجاح ✅\n\n اضغط علي الزر بالاسفل وضع منشورك لكي يتم نشره**`)],
                    components: [button],
                });


                const logChannel = await interaction.guild.channels.cache.get(settings.Rooms.LogPosts)
                const embed = new MessageEmbed()
                    .setTitle('💳 عملية شراء منشور مميز 💳')
                    .setColor(settings.EmbedColor)
                    .setThumbnail(interaction.guild.iconURL())
                    .setFooter(interaction.guild.name, interaction.guild.iconURL())
                    .addFields(
                        { name: '👤 العميل', value: `<@${interaction.user.id}>`, inline: true },
                        { name: '🏅 نوع المنشور', value: `@${selectedValue}`, inline: true }
                    )
                    .setTimestamp();

                await logChannel.send({ content: `**- ${user}**`, embeds: [embed] });



            } else {
                await interaction.editReply({
                    embeds: [interaction.message.embeds[0].setDescription(`لقد انتهى الوقت، لا تقم بالتحويل ${interaction.user}`)],
                    components: [],
                });   

            }


        }
    }
});

// Handle the "Copy Credit" button interaction
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;
    if (interaction.customId === 'copyCreditButtons') {

        const tax = Math.floor(Config.Posts.here * (20 / 19) + 1); 
        await interaction.reply({
            content: `#credit ${settings.BankID} ${tax}`,
            ephemeral: true
        });
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;
    if (interaction.customId === 'copyCreditButtoneverys') {

        const tax = Math.floor(Config.Posts.every * (20 / 19) + 1); 
        await interaction.reply({
            content: `#credit ${settings.BankID} ${tax}`,
            ephemeral: true
        });
    }
});

///// زر منشن هير
client.on('interactionCreate', async interaction => {
   if (!interaction.isButton()) return
    if (interaction.customId == 'posthere'){
        if (openModals.has(interaction.user.id)) {
            return interaction.reply({ content: '⚠️ لديك مودال مفتوح بالفعل، أغلقه أولاً.', ephemeral: true });
        }

        openModals.set(interaction.user.id, true);

        const PostModal = new Modal()
        .setCustomId('PostModalHere')
        .setTitle('اتمام عملية نشر منشورك');
        const ThePost = new TextInputComponent()
        .setCustomId('ThePost')
        .setLabel("ما هو منشورك ؟")
        .setPlaceholder('قم بوضع منشورك دون كتابة تواصل معي او وضع المنشن !')
        .setRequired(true)
        .setStyle('PARAGRAPH');
    const firstActionRow = new MessageActionRow().addComponents(ThePost);
    PostModal.addComponents(firstActionRow);

    try {
        await interaction.showModal(PostModal);
    } catch (error) {
        console.error("خطأ أثناء عرض المودال:", error);
        openModals.delete(interaction.user.id);
    }

  }else if (interaction.customId == 'postevery'){

    if (openModals.has(interaction.user.id)) {
        return interaction.reply({ content: '⚠️ لديك مودال مفتوح بالفعل، أغلقه أولاً.', ephemeral: true });
    }

    openModals.set(interaction.user.id, true);

    const PostModal = new Modal()
    .setCustomId('PostModalEvery')
    .setTitle('اتمام عملية نشر منشورك');
const ThePost = new TextInputComponent()
    .setCustomId('ThePost')
    .setLabel("ما هو منشورك ؟")
    .setPlaceholder('قم بوضع منشورك دون كتابة تواصل معي او وضع المنشن !')
    .setRequired(true)
    .setStyle('PARAGRAPH');
const firstActionRow = new MessageActionRow().addComponents(ThePost);
PostModal.addComponents(firstActionRow);

try {
    await interaction.showModal(PostModal);
} catch (error) {
    console.error("خطأ أثناء عرض المودال:", error);
    openModals.delete(interaction.user.id);
}

  }
})



///////////// استاجبة المودال
client.on('interactionCreate', async interaction => {
    if (!interaction.isModalSubmit()) return
    if (interaction.customId == 'PostModalHere'){
        if (submittedPosts.has(`${interaction.user.id}_here`)) {
            openModals.delete(interaction.user.id);
            return interaction.reply({ content: '⚠️ لقد قمت بنشر هذا المنشور بالفعل.', ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const RoomPost = await interaction.guild.channels.cache.get(settings.Rooms.RoomPosts)
            const ThePost = interaction.fields.getTextInputValue('ThePost')
            if (ThePost.includes(`@here`) || ThePost.includes(`@everyone`)) {
                openModals.delete(interaction.user.id);
                return interaction.editReply({ content: `ضع منشورك مرة اخرى ولكن بدون منشن !` });
            }
            await RoomPost.send({content : `${ThePost}\n\nتواصلوا مع : ${interaction.user}\n@here`})
            await RoomPost.send({content : `**المنشور دا مدفوع ونخلي مسؤليتنا من يلي يصير بينكم**`})
            await RoomPost.send({ files : [settings.ServerInfo.line]})
            const options3 = {
                TitleEm: `تم اكتمال عملية شراء منشورك `,
                ImageEm: null,
                colorEm: settings.لون_الامبيد,
                DesEm: `- تمت عملية شرائك لمنشور مميز بنجاح\n- منشورك نزل في روم المنشورات المميزة ✅`
            };

            const embed3 = createEmbed({
                interaction: interaction,
                title: options3.TitleEm,
                image: options3.ImageEm,
                color: options3.colorEm,
                description: options3.DesEm
            });
            submittedPosts.set(`${interaction.user.id}_here`, true);
            await interaction.message.edit({embeds : [embed3], components: []});
            await interaction.editReply({ content: 'تم نشر المنشور بنجاح.' });
        } catch (error) {
            console.error("خطأ أثناء نشر المنشور:", error);
            await interaction.editReply({ content: '❌ حدث خطأ أثناء نشر المنشور، حاول مرة أخرى لاحقًا.' });
        } finally {
            openModals.delete(interaction.user.id);
        }
    }
})

client.on('interactionCreate', async interaction => {
    if (!interaction.isModalSubmit()) return
    if (interaction.customId == 'PostModalEvery'){
        if (submittedPosts.has(`${interaction.user.id}_every`)) {
            openModals.delete(interaction.user.id);
            return interaction.reply({ content: '⚠️ لقد قمت بنشر هذا المنشور بالفعل.', ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const RoomPost = await interaction.guild.channels.cache.get(settings.Rooms.RoomPosts)
            const ThePost = interaction.fields.getTextInputValue('ThePost')
            if (ThePost.includes(`@here`) || ThePost.includes(`@everyone`)) {
                openModals.delete(interaction.user.id);
                return interaction.editReply({ content: `ضع منشورك مرة اخرى ولكن بدون منشن !` });
            }

            await RoomPost.send({content : `${ThePost}\n\nتواصلوا مع : ${interaction.user}\n@everyone`})
            await RoomPost.send({content : `**المنشور دا مدفوع ونخلي مسؤليتنا من يلي يصير بينكم**`})
            await RoomPost.send({ files : [settings.ServerInfo.line]})
            const options3 = {
                TitleEm: `تم اكتمال عملية شراء منشورك `,
                ImageEm: null,
                colorEm: settings.لون_الامبيد,
                DesEm: `- تمت عملية شرائك لمنشور مميز بنجاح\n- منشورك نزل في روم المنشورات المميزة ✅`
            };

            const embed3 = createEmbed({
                interaction: interaction,
                title: options3.TitleEm,
                image: options3.ImageEm,
                color: options3.colorEm,
                description: options3.DesEm
            });
            submittedPosts.set(`${interaction.user.id}_every`, true);
            await interaction.message.edit({embeds : [embed3], components: []});
            await interaction.editReply({ content: 'تم نشر المنشور بنجاح.' });
        } catch (error) {
            console.error("خطأ أثناء نشر المنشور:", error);
            await interaction.editReply({ content: '❌ حدث خطأ أثناء نشر المنشور، حاول مرة أخرى لاحقًا.' });
        } finally {
            openModals.delete(interaction.user.id);
        }
    }
})
