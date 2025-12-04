
const { Intents, Collection, Client, GuildMember, MessageActionRow, WebhookClient,MessagePayload, GatewayIntentBits, MessageSelectMenu, Modal, MessageEmbed,MessageButton, MessageAttachment, Permissions, TextInputComponent} = require('discord.js');
const { client, settings , dbpoint, db} = require('../../index');
const { createEmbed } = require('../../function/function/Embed');
const Roles = require('../../config/Roles')
const RolesSellers = Roles.RolesSellers
const RoleWarns = Roles.WarnsRole
const warn25 = RoleWarns[0].Warn25
const warn50 = RoleWarns[0].warn50
const warn100 = RoleWarns[0].warn100;

const Info = {
    reasons: [
      'منشن ايفري > سحب رتبه',
      'سحب رتبة بدون سبب > سحب رتبه',
      'بيع كريديت > سحب رتبه',
      'بيع طريقة عن طريق دخول سيرفر > سحب رتبه',
      'اشياء +18 > سحب رتبه',
      'طلب/الاستهبال برومات البيع > سحب رتبه',
      'ذكر اسماء سيرفرات > سحب رتبه',
      'نسخ منشور شخص اخر > سحب رتبه',
      'شراء سلعه واعادة بيعها بدون موافقه البائع > سحب رتبه',
      'نشر 3 مرات او اكثر دون انتظار ساعة > سحب رتبه',
      'طرق نيترو > سحب رتبه',
      'طرق كريديت > سحب رتبه',
      'ادوات اختراق/تهكير > سحب رتبه',
      'نشر بطاقة قوقل بسياسات > سحب رتبه',
      'نشر شي يخص الديس بروم غير الديس > تحذير',
      'عدم تشفير بشكل صحيح > تحذير',
      'مخالفه حد الصور > تحذير',
      'نشر بروم غلط > تحذير',
      'نشر مرتين دون انتظار ساعة > تحذير',
      'مخالفة قوانين الرتبه > تحذير',
    ],
  };

  client.on('interactionCreate', async interaction => {
    if (!interaction.isMessageContextMenu()) return;
    if (interaction.commandName == 'Warn seller') {
        await interaction.deferReply({ ephemeral: true });

        if (!interaction.member.roles.cache.has(settings.Admins.DiscordStaff))return
        const embed = createEmbed({
            interaction: interaction,
            title: `تحذير بائع جديد`,
            description: `انت على وشك تحذير ${interaction.targetMessage.author} يرجى اختيار سبب التحذير من الأسفل`,
        });

        const row = new MessageActionRow().addComponents(
            new MessageSelectMenu()
                .setCustomId('selectReason')
                .setPlaceholder(`${interaction.user.displayName} اي سبب التحذير ؟`)
                .addOptions(Info.reasons.map(reason => ({ label: reason, value: reason })))
        );

        const replyMessage = await interaction.editReply({ embeds: [embed], components: [row], ephemeral: false });

        const filter = i => i.customId === 'selectReason' && i.user.id === interaction.user.id;

        const collector = replyMessage.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async i => {
            const selectedReason = i.values[0];
            const warningType = selectedReason.includes('تحذير') ? 'تحذير' : 'سحب رتبه';

            const Room = await interaction.guild.channels.cache.get(settings.Rooms.Warns);

            const sellerName = interaction.targetMessage.author;
            const adminName = interaction.user;
            const images = interaction.targetMessage.attachments.map(attachment => attachment.url) || [];
            const attachments = [];

            for (const photoUrl of images) {
              const attachment = new MessageAttachment(photoUrl);
              attachments.push(attachment);
            }

           
            const guildMember = interaction.guild.members.cache.get(interaction.targetMessage.author.id);
            let penalty = '';

            if (warningType === 'تحذير') {
                if (!guildMember.roles.cache.has(warn25)) {
                    guildMember.roles.add(warn25).catch(console.error);
                    penalty = 'إضافة رتبة تحذير 25';
                } else if (guildMember.roles.cache.has(warn25) && !guildMember.roles.cache.has(warn50)) {
                    guildMember.roles.add(warn50).catch(console.error);
                    penalty = 'إضافة رتبة تحذير 50';
                } else if (guildMember.roles.cache.has(warn50) && !guildMember.roles.cache.has(warn100)) {
                    guildMember.roles.add(warn100).catch(console.error);
                    penalty = 'إضافة رتبة تحذير 100';
                } else if (guildMember.roles.cache.has(warn100)) {
                  await  guildMember.roles.remove([warn25, warn50, warn100]).catch(console.error);
                  await  RolesSellers.forEach(async roleId => {
                        if (guildMember.roles.cache.has(roleId)) {
                            await guildMember.roles.remove(roleId).catch(console.error);
                        }
                    });
                    penalty = 'سحب جميع رتب التحذير ورتب البائعين';
                }
            } else if (warningType === 'سحب رتبه') {
                await guildMember.roles.remove([warn25, warn50, warn100]).catch(console.error);
                await RolesSellers.forEach(async roleId => {
                    if (guildMember.roles.cache.has(roleId)) {
                        await guildMember.roles.remove(roleId).catch(console.error);
                    }
                });
                penalty = 'سحب جميع رتب التحذير ورتب البائعين';
            }
            
          
            

           
            
            
            
            const embed = createEmbed({
                interaction: interaction,
                title: `تحذير جديد`,
                fields: [
                    {
                        name: `البائع`,
                        value: `${sellerName}`,
                        inline: true,
                    },
                    {
                        name: `الاداري`,
                        value: `${adminName}`,
                        inline: true,
                    },
                    {
                        name: `التحذير`,
                        value: `${selectedReason}`,
                        inline: true,
                    },
                    {
                        name: `العقوبة`,
                        value: `${penalty}`,
                        inline: true,
                    },
                    {
                        name: `الروم`,
                        value: `${interaction.channel}`,
                        inline: true,
                    },
                    {
                        name: `وقت نشر المنشور`,
                        value: `<t:${Math.floor(interaction.targetMessage.createdTimestamp / 1000)}:R>`,
                        inline: true,
                    },
                    {
                        name: `وقت التحذير`,
                        value: `<t:${Math.floor(Date.now() / 1000)}:R>`,
                        inline: true,
                    },
                    {
                        name: `الدلائل`,
                        value: `\`\`\`${interaction.targetMessage.content}\`\`\``,
                        inline: false,
                    },
                ],
            });
            
            const T = await Room.send({ embeds: [embed], content: `${sellerName}`});
            const sellerId = interaction.targetMessage.author.id;
            const sellerUser = await interaction.client.users.fetch(sellerId).catch(() => null);
            const text =  `**لقد تم تحذيرك! \n العضو: ${sellerName} \n الاداري: ${adminName} \n السبب: برجاء فتح التكت لمعرفه السبب\n العقوبة: ${penalty}\n مع اطيب التحيات لكم**`
            if (sellerUser) {
                await sellerUser.send(text).catch(() => {});
                await sellerUser.send({ files: [settings.ServerInfo.line] }).catch(() => {});
}


 
            await interaction.editReply({ embeds: [embed.setDescription(`لقد تم تحذير البائع ${sellerName} بنجاح ✅\n- https://discord.com/channels/${interaction.guild.id}/${Room.id}/${T.id}`).setFields()], components: [] });

            if (attachments.length > 0) {
                await Room.send({ files: attachments });
            }

            await Room.send({files : [settings.ServerInfo.line]});

            const DataPoints = await dbpoint.get(`Points_Staff`)
            const Exit = DataPoints?.find((t) => t.userid == interaction.user.id)
            if (Exit){
             Exit.Warn ++
           await dbpoint.set(`Points_Staff`, DataPoints)
            }else {
                await dbpoint.push(`Points_Staff`, {
                    userid : interaction.user.id ,
                    Warn : 1 ,
                    point : 0 ,

                })
            }

                await db.push(`Data_Warns`, {
                    userid : interaction.targetMessage.author.id ,
                    staff : interaction.user.id ,
                    time : `<t:${Math.floor(Date.now() / 1000)}:R>`,
                    reason : selectedReason ,
                    warn : warningType ,
                    penalty,
                    info : interaction.targetMessage.content ,
                    image : [images || null]
                })

           await interaction.targetMessage.delete()
            collector.stop()
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                interaction.editReply({ embeds: [embed.setDescription(`انتهى الوقت , اعد مرة اخرى لاحقنا`)], components: [] });
            }
        });
    }
});
