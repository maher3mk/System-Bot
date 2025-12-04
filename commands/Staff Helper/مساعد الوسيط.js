// const {
//     MessageActionRow,
//     MessageSelectMenu,
//     Modal,
//     MessageEmbed,
//     MessageButton,
//     TextInputComponent
// } = require('discord.js');
// const { client, dbTickets, settings } = require('../../index');

// class AdminHelpHandler {
//     static async getTicketGroup(channelId) {
//         for (let i = 1; i <= 5; i++) {
//             const data = await dbTickets.get(`Tickets_waset${i}`);
//             const ticket = data?.find(t => t.Ticket === channelId);
//             if (ticket) return { group: i, data: ticket };
//         }
//         return null;
//     }

//     static async showMainMenu(interaction) {
//         const embed = new MessageEmbed()
//             .setDescription('**مرحبا بك ايها الاداري في قايمة مساعد الاداره\nبرجاء اختيار المساعده التي تريدها**')
//             .setColor('BLUE')
//             .setThumbnail(interaction.guild.iconURL({ dynamic: true }));

//         const selectMenu = new MessageSelectMenu()
//             .setCustomId('AdminHelpMenu')
//             .setPlaceholder('اختر نوع المساعده')
//             .addOptions([
//                 { label: 'استدعاء صاحب التذكره', value: 'call_owner', emoji: '📞' },
//                 { label: 'اضافة شخص', value: 'add_user', emoji: '➕' },
//                 { label: 'ازالة شخص', value: 'remove_user', emoji: '➖' },
//                 { label: 'تغيير اسم التذكره', value: 'rename_ticket', emoji: '✏️' },
//                 { label: 'استدعاء عليا', value: 'call_leader', emoji: '👑' },
//                 { label: 'اعاده تعيين القايمه', value: 'reset_menu', emoji: '🔄' }
//             ]);

//         const row = new MessageActionRow().addComponents(selectMenu);
//         return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
//     }

//     static async callTicketOwner(interaction, ticketData) {
//         const owner = ticketData.userid;

//         const dmEmbed = new MessageEmbed()
//             .setTitle('📞 استدعاء')
//             .setColor(settings.لون_الامبيد || 'BLUE')
//             .setDescription(`**مرحبا <@${owner}>\nيرجى التوجه إلى [التذكرة](https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}) في أقرب وقت ممكن.\n\nالمُستدعي: <@${interaction.member.id}>**`)
//             .setThumbnail(interaction.guild.iconURL({ dynamic: true }));

//         const dmButton = new MessageButton()
//             .setLabel('افتح التذكرة')
//             .setStyle('LINK')
//             .setURL(`https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}`);

//         const dmRow = new MessageActionRow().addComponents(dmButton);

//         try {
//             const user = await client.users.fetch(owner);
//             await user.send({ embeds: [dmEmbed], components: [dmRow] });
//             await interaction.reply({ content: `✅ **تم استدعاء <@${owner}> بنجاح**`, ephemeral: true });
//         } catch {
//             await interaction.reply({ content: `⚠️ **تم استدعاء <@${owner}> ولكن لم يتم إرسال رسالة خاصة**`, ephemeral: true });
//         }

//         const logEmbed = new MessageEmbed()
//             .setTitle('📞 استدعاء العضو')
//             .setColor(settings.لون_الامبيد || 'BLUE')
//             .setDescription(`لقد تم استدعاء <@${owner}> بنجاح`)
//             .setThumbnail(interaction.guild.iconURL({ dynamic: true }));

//         await interaction.channel.send({ content: `<@${interaction.user.id}> || <@${owner}>`, embeds: [logEmbed] });

//         if (settings.ServerInfo?.line) {
//             await interaction.channel.send({ files: [settings.ServerInfo.line] });
//         }
//     }

//     static async showUserModal(interaction, action) {
//         const isAdd = action === 'add_user';
//         const modal = new Modal()
//             .setCustomId(isAdd ? 'AddUserModal' : 'RemoveUserModal')
//             .setTitle(isAdd ? 'اضافة عضو' : 'ازالة عضو');

//         const input = new TextInputComponent()
//             .setCustomId('targetUser')
//             .setLabel('اكتب ايدي العضو')
//             .setStyle('SHORT')
//             .setRequired(true)
//             .setPlaceholder('123456789012345678');

//         const row = new MessageActionRow().addComponents(input);
//         modal.addComponents(row);

//         await interaction.showModal(modal);
//     }

//     static async handleUserModal(interaction) {
//         const userid = interaction.fields.getTextInputValue('targetUser');
//         const isAdd = interaction.customId === 'AddUserModal';
//         const action = isAdd ? 'اضافة' : 'ازالة';

//         if (!/^\d{17,19}$/.test(userid)) {
//             return interaction.reply({ content: '❌ معرف المستخدم غير صحيح!', ephemeral: true });
//         }

//         try {
//             const member = await interaction.guild.members.fetch(userid).catch(() => null);
//             if (!member) {
//                 return interaction.reply({ content: '❌ المستخدم ليس عضواً في الخادم!', ephemeral: true });
//             }

//             if (isAdd) {
//                 await interaction.channel.permissionOverwrites.edit(userid, {
//                     ViewChannel: true,
//                     SendMessages: true,
//                     ReadMessageHistory: true
//                 });
//             } else {
//                 await interaction.channel.permissionOverwrites.delete(userid);
//             }

//             const embed = new MessageEmbed()
//                 .setTitle(`${isAdd ? '➕' : '➖'} ${action} عضو`)
//                 .setColor(isAdd ? 'GREEN' : 'RED')
//                 .setDescription(`تم ${action} العضو <@${userid}> في التذكرة`)
//                 .setThumbnail(interaction.guild.iconURL({ dynamic: true }));

//             await interaction.reply({ content: `<@${interaction.user.id}> || <@${userid}>`, embeds: [embed] });
//         } catch (error) {
//             console.error('User modal error:', error);
//             await interaction.reply({ content: '❌ حدث خطأ أثناء تنفيذ العملية.', ephemeral: true });
//         }
//     }

//     static async showRenameModal(interaction) {
//         const modal = new Modal()
//             .setCustomId('RenameTicket')
//             .setTitle('تغيير اسم التذكرة');

//         const input = new TextInputComponent()
//             .setCustomId('newName')
//             .setLabel('الاسم الجديد')
//             .setStyle('SHORT')
//             .setRequired(true)
//             .setMaxLength(100);

//         modal.addComponents(new MessageActionRow().addComponents(input));
//         await interaction.showModal(modal);
//     }

//     static async handleRename(interaction) {
//         const newName = interaction.fields.getTextInputValue('newName');

//         try {
//             await interaction.channel.setName(newName);
//             const embed = new MessageEmbed()
//                 .setTitle('✏️ تغيير اسم التذكرة')
//                 .setColor(settings.لون_الامبيد || 'BLUE')
//                 .setDescription(`تم تغيير الاسم إلى \`${newName}\``)
//                 .setThumbnail(interaction.guild.iconURL({ dynamic: true }));

//             await interaction.reply({ embeds: [embed], ephemeral: true });

//             if (settings.ServerInfo?.line) {
//                 await interaction.channel.send({ files: [settings.ServerInfo.line] });
//             }
//         } catch (error) {
//             console.error('Rename error:', error);
//             await interaction.reply({ content: '❌ حدث خطأ أثناء تغيير الاسم.', ephemeral: true });
//         }
//     }

//     static async showLeaderModal(interaction) {
//         const modal = new Modal()
//             .setCustomId('CallLeaderModal')
//             .setTitle('سبب استدعاء عليا');

//         const input = new TextInputComponent()
//             .setCustomId('reasonText')
//             .setLabel('سبب الاستدعاء')
//             .setStyle('PARAGRAPH')
//             .setRequired(true);

//         modal.addComponents(new MessageActionRow().addComponents(input));
//         await interaction.showModal(modal);
//     }

//     static async callLeader(interaction) {
//         const reason = interaction.fields.getTextInputValue('reasonText');

//         try {
//             await interaction.channel.setName('مطلوب-عليا');

//             const embed = new MessageEmbed()
//                 .setTitle('👑 استدعاء عليا')
//                 .setColor(settings.لون_الامبيد || 'ORANGE')
//                 .setDescription(`**الاداري: <@${interaction.user.id}>\nالسبب: ${reason}\n⚠️ الرجاء الانتظار بدون منشن**`)
//                 .setThumbnail(interaction.guild.iconURL({ dynamic: true }));

//             const mention = settings.Admins?.DiscordLeder || '';
//             await interaction.reply({ content: `<@${interaction.user.id}> || <@&${mention}>`, embeds: [embed] });

//             if (settings.ServerInfo?.line) {
//                 await interaction.channel.send({ files: [settings.ServerInfo.line] });
//             }
//         } catch (error) {
//             console.error('Leader call error:', error);
//             await interaction.reply({ content: '❌ فشل في استدعاء عليا.', ephemeral: true });
//         }
//     }
// }

// // Interaction handler
// client.on('interactionCreate', async (interaction) => {
//     if (!interaction.isButton() && !interaction.isSelectMenu() && !interaction.isModalSubmit()) return;

//     try {
//         const ticketMatch = await AdminHelpHandler.getTicketGroup(interaction.channel?.id);
//         if (!ticketMatch) return;

//         const { data: ticketData } = ticketMatch;

//         if (interaction.customId === 'AdminsHelp') {
//             await AdminHelpHandler.showMainMenu(interaction);
//         }

//         if (interaction.customId === 'AdminHelpMenu') {
//             const selected = interaction.values[0];

//             switch (selected) {
//                 case 'call_owner':
//                     await AdminHelpHandler.callTicketOwner(interaction, ticketData);
//                     break;
//                 case 'add_user':
//                 case 'remove_user':
//                     await AdminHelpHandler.showUserModal(interaction, selected);
//                     break;
//                 case 'rename_ticket':
//                     await AdminHelpHandler.showRenameModal(interaction);
//                     break;
//                 case 'call_leader':
//                     await AdminHelpHandler.showLeaderModal(interaction);
//                     break;
//                 case 'reset_menu':
//                     await AdminHelpHandler.showMainMenu(interaction);
//                     break;
//             }
//         }

//         if (interaction.isModalSubmit()) {
//             switch (interaction.customId) {
//                 case 'AddUserModal':
//                 case 'RemoveUserModal':
//                     await AdminHelpHandler.handleUserModal(interaction);
//                     break;
//                 case 'RenameTicket':
//                     await AdminHelpHandler.handleRename(interaction);
//                     break;
//                 case 'CallLeaderModal':
//                     await AdminHelpHandler.callLeader(interaction);
//                     break;
//             }
//         }
//     } catch (err) {
//         console.error('Interaction error:', err);
//         if (!interaction.replied) {
//             await interaction.reply({ content: '❌ حدث خطأ أثناء تنفيذ العملية.', ephemeral: true }).catch(() => {});
//         }
//     }
// });
