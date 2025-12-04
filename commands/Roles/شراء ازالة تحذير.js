const { Intents, Collection, Client, GuildMember, MessageActionRow, WebhookClient,MessagePayload, GatewayIntentBits, MessageSelectMenu, Modal, MessageEmbed,MessageButton, MessageAttachment, Permissions, TextInputComponent} = require('discord.js');
const { client, db ,dbTickets ,  settings} = require('../../index');
const Roles = require('../../config/Roles')
const config = require('../../config/prices')
const { createEmbed  } = require('../../function/function/Embed')
const checkCredits = require('../../function/function/checkCredits')


client.on('interactionCreate', async interaction => {
    if (!interaction.isSelectMenu()) return;

    if (interaction.customId === 'RolesBuy') {
        const selectedValue = interaction.values[0];
        if (selectedValue == 'Buy_Remove_Warn') {
            const user = interaction.member;

            const userWarnRoles = Roles.WarnsRole[0];

            const hasWarn25 = user.roles.cache.has(userWarnRoles.Warn25);
            const hasWarn50 = user.roles.cache.has(userWarnRoles.warn50);
            const hasWarn100 = user.roles.cache.has(userWarnRoles.warn100);
    const but = new MessageActionRow().addComponents(
                    new MessageButton()
                    .setCustomId('CancelButton')
                    .setLabel('الغاء العملية ؟')
                    .setStyle('DANGER')
                )
            if (hasWarn100){
                await interaction.update({ embeds : [interaction.message.embeds[0].setDescription(`للأسف انت معاك وارن 100 متقدرش تشيله 😥`)], components: [but] });
            }

            if (hasWarn50) {
              
             const row = new MessageActionRow().addComponents(
                        new MessageButton()
                            .setCustomId('remove_warn_50')
                            .setLabel('حذف وارن 50')
                            .setStyle('SECONDARY')
                    );

                await interaction.update({ embeds : [interaction.message.embeds[0].setDescription(`اختار التحذير الي عاوز تشيله 😊`)], components: [row,but] });

                } else if (hasWarn25){

                
                      const row = new MessageActionRow().addComponents(
                    new MessageButton()
                        .setCustomId('remove_warn_25')
                        .setLabel('حذف وارن 25')
                        .setStyle('SECONDARY')
                );
                    await interaction.update({ embeds : [interaction.message.embeds[0].setDescription(`اختار التحذير الي عاوز تشيله 😊`)], components: [row,but] });

                } else {
                    await interaction.update({ embeds : [interaction.message.embeds[0].setDescription(`مش معاك تحذيرات عشان تشيلها 😶`)], components: [but] });

                }

            }          
    }
});


client.on(`interactionCreate`, async interaction => {
    if (!interaction.isButton()) return 
    if (interaction.customId == 'remove_warn_25'){
            const tax = Math.floor(config.RemoveWarns.W25 * (20 / 19) + 1);

            const options = {
                TitleEm: `عملية ازالة وارن 25`,
                ImageEm: null,
                colorEm: settings.لون_الامبيد,
                DesEm: `لأكمال العملية  , يرجي نسخ الكود بالاسفل واتمام عملية التحويل\n\n \`\`\`#credit ${settings.BankID} ${tax}\`\`\``
            };
            await interaction.channel.send(`#credit ${settings.BankID} ${tax}`);
            const embedData = {
                interaction: interaction,
                title: options.TitleEm,
                image: options.ImageEm,
                color: options.colorEm,
                description: options.DesEm,
            };
            
            const embed = createEmbed(embedData);

            const row = new MessageActionRow().addComponents(
                new MessageButton()
                  .setCustomId("send_credit_msg")
                  .setLabel("نسخ الامر")
                  .setStyle("SECONDARY")
              );
            

            await interaction.update({embeds : [embed], components: [row]})
            const options2 = {
                price: config.RemoveWarns.W25,
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
                            ExitData.Buys = [`تم شراء ازالة وارن 25 `];
                        } else {
                            ExitData.Buys += `تم شراء ازالة وارن 25 `
                        }
                        await dbTickets.set(`Tickets_Support`, DataTicket);
                    }

                    await interaction.member.roles.remove(Roles.WarnsRole[0].Warn25)
                    await interaction.editReply({
                        embeds: [interaction.message.embeds[0].setDescription(`- عملية ازالة وارن 25 ناجحه ✅\n- تمت العملية بنجاح , دلوقتي اتشال منك الوارن 25`)],
                        components: [],
                    });


                } else {
                    await interaction.editReply({
                        embeds: [interaction.message.embeds[0].setDescription(`لقد انتهى الوقت، لا تقم بالتحويل ${interaction.user}`)],
                        components: [],
                    });
                }
          
        
    } else if (interaction.customId == 'remove_warn_50'){
        const tax = Math.floor(config.RemoveWarns.W50 * (20 / 19) + 1);

        const options = {
            title: 'عملية ازالة وارن 50',
            image: null,
            color: settings.لون_الامبيد,
            description: `لأكمال العملية  , يرجي نسخ الكود بالاسفل واتمام عملية التحويل\n\n \`\`\`#credit ${settings.BankID} ${tax}\`\`\``
        };
        await interaction.channel.send(`#credit ${settings.BankID} ${tax}`);
        const embed = createEmbed({
            interaction: interaction,
            title: options.title,
            image: options.image,
            color: options.color,
            description: options.description
        });
        const row = new MessageActionRow().addComponents(
            new MessageButton()
              .setCustomId("send_credit_msg")
              .setLabel("نسخ الامر")
              .setStyle("PRIMARY")
          );
        

        await interaction.update({embeds : [embed], components: [row]})
        

        const options2 = {
            price: config.RemoveWarns.W50,
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
                        ExitData.Buys = `تم شراء ازالة وارن 50 `;
                    }
                    await dbTickets.set(`Tickets_Support`, DataTicket);
                }

                await interaction.member.roles.remove(Roles.WarnsRole[0].warn50)
                await interaction.editReply({
                    embeds: [interaction.message.embeds[0].setDescription(`- عملية ازالة وارن 50 ناجحه ✅\n- تمت العملية بنجاح , دلوقتي اتشال منك الوارن 50`)],
                    components: [],
                });


            } else {
                await interaction.editReply({
                    embeds: [interaction.message.embeds[0].setDescription(`لقد انتهى الوقت، لا تقم بالتحويل ${interaction.user}`)],
                    components: [],
                });
            }
  } else if (interaction.customId === "send_credit_msg") {
    const tax = Math.floor(config.RemoveWarns.W25 * (20 / 19) + 1); // Adjust as needed
    const creditMessage = `#credit ${settings.BankID} ${tax}`;

    await interaction.reply({
      content: `${creditMessage}`,
      ephemeral: true,
    });
  }
});