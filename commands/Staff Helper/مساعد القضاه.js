const {
    MessageActionRow, 
    MessageSelectMenu, 
    Modal, 
    MessageEmbed,
    MessageButton, 
    TextInputComponent
} = require('discord.js');
const { client, dbTickets, settings } = require('../../index');
const ticketsDB = require('../../database/Tickets.json');

class KdaaHelpHandler {
    static async showMainMenu(interaction) {
        const embed = new MessageEmbed()
            .setDescription('**مرحبا بك ايها الاداري في قايمة مساعد الاداره\nبرجاء اختيار المساعده التي تريدها**')
            .setColor('BLUE')
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }));

        const selectMenu = new MessageSelectMenu()
            .setCustomId('KdaaHelpMenu')
            .setPlaceholder('اختر نوع المساعده')
            .addOptions([
                { label: 'استدعاء صاحب التذكره', value: 'call_owner', emoji: '📞' },
                { label: 'اضافة شخص', value: 'add_user', emoji: '➕' },
                { label: 'ازالة شخص', value: 'remove_user', emoji: '➖' },
                { label: 'تغيير اسم التذكره', value: 'rename_ticket', emoji: '✏️' },
                { label: 'استدعاء عليا', value: 'call_leader', emoji: '👑' },
                { label: 'اعاده تعيين القايمه', value: 'reset_menu', emoji: '🔄' }
            ]);

        const row = new MessageActionRow().addComponents(selectMenu);
        return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }

    static async callTicketOwner(interaction) {
        const ticketkdaa = ticketsDB.Tickets_Tashher.find(t => t.Ticket === interaction.channel.id);
        if (!ticketkdaa) {
            return interaction.reply({ content: '❌ لم يتم العثور على بيانات التذكرة.', ephemeral: true });
        }

        const owner = ticketkdaa.userid;
        
        const dmEmbed = new MessageEmbed()
            .setTitle('📞 استدعاء')
            .setColor(settings.لون_الامبيد || 'BLUE')
            .setDescription(`**مرحبا <@${owner}>،

يرجى التوجه إلى [التذكرة](https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}) في أقرب وقت ممكن.

المُستدعي: <@${interaction.member.id}>**`)
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }));

        const dmButton = new MessageButton()
            .setLabel('افتح التذكرة')
            .setStyle('LINK')
            .setURL(`https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}`);

        const dmRow = new MessageActionRow().addComponents(dmButton);

        try {
            const user = await client.users.fetch(owner);
            await user.send({ embeds: [dmEmbed], components: [dmRow] });
            await interaction.reply({ content: `✅ **تم استدعاء <@${owner}> بنجاح**`, ephemeral: true });
        } catch (error) {
            await interaction.reply({ content: `⚠️ **تم استدعاء <@${owner}> ولكن لم يتم إرسال رسالة خاصة**`, ephemeral: true });
        }

        const logEmbed = new MessageEmbed()
            .setTitle('📞 استدعاء العضو')
            .setColor(settings.لون_الامبيد || 'BLUE')
            .setDescription(`لقد تم استدعاء <@${owner}> بنجاح`)
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }));

        await interaction.channel.send({ content: `<@${interaction.user.id}> || <@${owner}>`, embeds: [logEmbed] });
        
        if (settings.ServerInfo?.line) {
            await interaction.channel.send({ files: [settings.ServerInfo.line] });
        }
    }

    static async showUserModal(interaction, action) {
        const isAdd = action === 'add_user';
        const modal = new Modal()
            .setCustomId(isAdd ? 'KdaaAddUserModal' : 'KdaaRemoveUserModal')
            .setTitle(isAdd ? 'اضافة عضو' : 'ازالة عضو');

        const userInput = new TextInputComponent()
            .setCustomId('targetUser')
            .setLabel('اكتب ايدي العضو')
            .setStyle('SHORT')
            .setRequired(true)
            .setPlaceholder('123456789012345678');

        const row = new MessageActionRow().addComponents(userInput);
        modal.addComponents(row);

        await interaction.showModal(modal);
    }

    static async handleUserModal(interaction) {
        const userid = interaction.fields.getTextInputValue('targetUser');
        const isAdd = interaction.customId === 'KdaaAddUserModal';
        const action = isAdd ? 'اضافة' : 'ازالة';
        
        if (!/^\d{17,19}$/.test(userid)) {
            return interaction.reply({ content: '❌ معرف المستخدم غير صحيح!', ephemeral: true });
        }

        try {
            const user = await client.users.fetch(userid);
            const member = await interaction.guild.members.fetch(userid).catch(() => null);
            
            if (!member) {
                return interaction.reply({ content: '❌ المستخدم ليس عضواً في الخادم!', ephemeral: true });
            }

            if (isAdd) {
                await interaction.channel.permissionOverwrites.edit(userid, {
                    ViewChannel: true,
                    SendMessages: true,
                    ReadMessageHistory: true
                });
            } else {
                await interaction.channel.permissionOverwrites.delete(userid);
            }

            const embed = new MessageEmbed()
                .setTitle(`${isAdd ? '➕' : '➖'} ${action} عضو الي التذكره`)
                .setColor(isAdd ? 'GREEN' : 'RED')
                .setDescription(`لقد تم ${action === 'اضافة' ? 'اضافة العضو' : 'ازالة العضو'} الي التذكره <@${userid}>`)
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }));

            await interaction.reply({ content: `<@${interaction.user.id}> || <@${userid}>`, embeds: [embed] });
        } catch (error) {
            console.error('Error handling user modal:', error);
            await interaction.reply({ content: '❌ حدث خطأ أثناء معالجة الطلب!', ephemeral: true });
        }
    }

    static async showRenameModal(interaction) {
        const modal = new Modal()
            .setCustomId('KdaaRenameTicket')
            .setTitle('تغيير اسم التذكره');

        const nameInput = new TextInputComponent()
            .setCustomId('newName')
            .setLabel('اكتب الاسم الجديد')
            .setStyle('SHORT')
            .setRequired(true)
            .setMaxLength(100);

        const row = new MessageActionRow().addComponents(nameInput);
        modal.addComponents(row);

        await interaction.showModal(modal);
    }

    static async handleRename(interaction) {
        const newName = interaction.fields.getTextInputValue('newName');
        
        try {
            await interaction.channel.setName(newName);
            
            const embed = new MessageEmbed()
                .setTitle('✏️ تغيير اسم التذكره')
                .setColor(settings.لون_الامبيد || 'BLUE')
                .setDescription(`تم تغيير اسم التذكره الي \`${newName}\``)
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }));

            await interaction.reply({ embeds: [embed], ephemeral: true });
            
            if (settings.ServerInfo?.line) {
                await interaction.channel.send({ files: [settings.ServerInfo.line] });
            }
        } catch (error) {
            console.error('Error renaming channel:', error);
            await interaction.reply({ content: '❌ حدث خطأ أثناء تغيير اسم التذكرة!', ephemeral: true });
        }
    }

    static async showLeaderModal(interaction) {
        const modal = new Modal()
            .setCustomId('KdaaCallLeaderModal')
            .setTitle('سبب استدعاء عليا');

        const reasonInput = new TextInputComponent()
            .setCustomId('reasonText')
            .setLabel('اكتب سبب الاستدعاء')
            .setStyle('PARAGRAPH')
            .setRequired(true)
            .setMaxLength(1000);

        const row = new MessageActionRow().addComponents(reasonInput);
        modal.addComponents(row);

        await interaction.showModal(modal);
    }

    static async callLeader(interaction) {
        const reason = interaction.fields.getTextInputValue('reasonText');
        
        try {
            await interaction.channel.setName('مطلوب-عليا');

            const embed = new MessageEmbed()
                .setTitle('👑 استدعاء عليا')
                .setDescription(`**الاداري: <@${interaction.user.id}>
السبب: ${reason}

⚠️ ملاحظة: برجاء الانتظار بدون منشن!**`)
                .setColor(settings.لون_الامبيد || 'ORANGE')
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }));

            const leaderMention = settings.Admins?.DiscordLeder || '';
            await interaction.reply({ 
                content: `<@${interaction.user.id}> ${leaderMention ? `|| <@${leaderMention}>` : ''}`, 
                embeds: [embed] 
            });
            
            if (settings.ServerInfo?.line) {
                await interaction.channel.send({ files: [settings.ServerInfo.line] });
            }
        } catch (error) {
            console.error('Error calling leader:', error);
            await interaction.reply({ content: '❌ حدث خطأ أثناء استدعاء القائد!', ephemeral: true });
        }
    }
}

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton() && !interaction.isSelectMenu() && !interaction.isModalSubmit()) return;

    try {
        if (interaction.customId === 'KdaaHelp') {
            await KdaaHelpHandler.showMainMenu(interaction);
        }

        if (interaction.customId === 'KdaaHelpMenu') {
            const value = interaction.values[0];
            
            switch (value) {
                case 'call_owner':
                    await KdaaHelpHandler.callTicketOwner(interaction);
                    break;
                case 'add_user':
                case 'remove_user':
                    await KdaaHelpHandler.showUserModal(interaction, value);
                    break;
                case 'rename_ticket':
                    await KdaaHelpHandler.showRenameModal(interaction);
                    break;
                case 'call_leader':
                    await KdaaHelpHandler.showLeaderModal(interaction);
                    break;
                case 'reset_menu':
                    await KdaaHelpHandler.showMainMenu(interaction);
                    break;
            }
        }

        if (interaction.isModalSubmit()) {
            switch (interaction.customId) {
                case 'KdaaAddUserModal':
                case 'KdaaRemoveUserModal':
                    await KdaaHelpHandler.handleUserModal(interaction);
                    break;
                case 'KdaaRenameTicket':
                    await KdaaHelpHandler.handleRename(interaction);
                    break;
                case 'KdaaCallLeaderModal':
                    await KdaaHelpHandler.callLeader(interaction);
                    break;
            }
        }
    } catch (error) {
        console.error('Error in Kdaa interaction handler:', error);
        
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ 
                content: '❌ حدث خطأ أثناء معالجة الطلب!', 
                ephemeral: true 
            }).catch(console.error);
        }
    }
});