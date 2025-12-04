const {
  Intents,
  Collection,
  Client,
  GuildMember,
  MessageActionRow,
  WebhookClient,
  MessagePayload,
  GatewayIntentBits,
  MessageSelectMenu,
  Modal,
  MessageEmbed,
  MessageButton,
  MessageAttachment,
  Permissions,
  TextInputComponent
} = require('discord.js');
const { client, db, settings } = require('../../index');
const { createEmbed } = require('../../function/function/Embed');

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(settings.prefix + 'setup-posts')) return;
    if (!settings.Owners.includes(message.author.id)) return;

        const row = new MessageActionRow().addComponents(
            new MessageSelectMenu()
                .setCustomId('selectPostType')
                .setPlaceholder('اختر نوع المنشن')
                .addOptions([
                    { label: 'Mention Here', value: 'here' },
                    { label: 'Mention Everyone', value: 'everyone' }
                ])
        );

        const embed = new MessageEmbed()
            .setTitle('Posts control')
        .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setDescription(`> **Mention Here** :\nلـ نشر منشور في : <#${settings.Rooms.RoomPosts}> بـ منشن للاونلاين(هير) !\n\n> **Mention Everyone** :\nلـ نشر منشور في : <#${settings.Rooms.RoomPosts}> بـ منشن للكل(ايفريون) !`);

        await message.channel.send({ embeds: [embed], components: [row] });
    
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isSelectMenu()) return;

    if (interaction.customId === 'selectPostType') {
        const mentionType = interaction.values[0];
        const mpostmodal = new Modal()
            .setCustomId(`PostModal_${mentionType}`)
            .setTitle('معلومات المنشور');

        const userIdInput = new TextInputComponent()
            .setCustomId('UserId')
            .setLabel('User ID')
            .setStyle('SHORT')
            .setRequired(true);

        const postInput = new TextInputComponent()
            .setCustomId('ThePost')
            .setLabel('Post')
            .setStyle('PARAGRAPH')
            .setRequired(true);

        const reasonInput = new TextInputComponent()
            .setCustomId('Reason')
            .setLabel('Reason?!')
            .setStyle('SHORT')
            .setRequired(true);

        modal.addComponents(
            new MessageActionRow().addComponents(userIdInput),
            new MessageActionRow().addComponents(postInput),
            new MessageActionRow().addComponents(reasonInput)
        );

        await interaction.showModal(mpostmodal);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isModalSubmit()) return;

    if (!interaction.customId.startsWith('PostModal_')) return; // تجاهل المودالات الأخرى

    const mentionType = interaction.customId.split('_')[1];

    try {
        const userId = interaction.fields.getTextInputValue('UserId');
        const postContent = interaction.fields.getTextInputValue('ThePost');
        const reason = interaction.fields.getTextInputValue('Reason');

        if (postContent.includes('@here') || postContent.includes('@everyone')) {
            return await interaction.reply({ content: `ضع منشورك مرة اخرى ولكن بدون منشن !`, ephemeral: true });
        }

        const RoomPost = await interaction.guild.channels.cache.get(settings.Rooms.RoomPosts);
        const mention = mentionType === 'here' ? '@here' : '@everyone';

        const sentMessage = await RoomPost.send(`${postContent}\n\nتواصلوا مع: <@${userId}>\n${mention}`);
        await RoomPost.send('**المنشور دا مدفوع ونخلي مسؤليتنا من يلي يصير بينكم**');
        await RoomPost.send({ files: [settings.ServerInfo.line] });

        const logEmbed = new MessageEmbed()
            .setTitle('منشور جديد!')
            .addField('الإداري:', `<@${interaction.user.id}>`, true)
            .addField('العضو:', `<@${userId}>`, true)
            .addField('النوع:', mention, true)
            .addField('السبب:', reason)
            .addField('المنشور:', `[رابط المنشور](${sentMessage.url})`)
            .setColor(settings.لون_الامبيد || 'BLUE')
            .setTimestamp();

        const LogChannel = await interaction.guild.channels.cache.get(settings.Rooms.LogPosts);
        if (LogChannel) await LogChannel.send({ embeds: [logEmbed] });

        const successEmbed = new MessageEmbed()
            .setColor('GREEN')
            .setTitle('Done posted successfully')
            .setDescription(`[Post](${sentMessage.url})`)
            .setTimestamp();

        await interaction.reply({ embeds: [successEmbed], ephemeral: true });

    } catch (error) {
        console.error('Modal processing error:', error);
        await interaction.reply({ content: 'حدث خطأ أثناء معالجة المودال ❌', ephemeral: true });
    }
});
