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

client.on('messageCreate', async message => {
    if (!message.content.startsWith(`${settings.prefix}give-spin`)) return;
    if (!message.member.roles.cache.has(settings.Admins.DiscordLeder)) return;

    const args = message.content.split(' ').slice(1);
    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) return message.reply("يرجى منشن أو كتابة آيدي المستخدم بشكل صحيح.");

    const selectRow = new MessageActionRow().addComponents(
        new MessageSelectMenu()
            .setCustomId(`give_spin_select_${target.id}_${message.author.id}`)
            .setPlaceholder("اختار نوع العجلة")
            .addOptions([
                {
                    label: "Basic Spin",
                    description: "لفه عجلة حظ عاديه",
                    value: "Basic",
                },
                {
                    label: "Exclusive Spin",
                    description: "لفه عجلة حظ مميزه",
                    value: "Exclusive",
                }
            ])
    );

    const embed = new MessageEmbed()
        .setColor(settings.لون_الامبيد)
        .setDescription(`**> Give Spin\nاهلا بك عزيزي الاداري ${message.author} .. \nيُرجى منك تحديد نوع العجلة المراد اعطائها لـ ${target} - من خلال القائمة بالاسفل .**`)
        .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

    const sent = await message.channel.send({ embeds: [embed], components: [selectRow] });

    const filter = (i) => i.customId === `give_spin_select_${target.id}_${message.author.id}` && i.user.id === message.author.id;
    const collector = sent.createMessageComponentCollector({ filter, time: 60000, max: 1 });

    collector.on('collect', async interaction => {
        await interaction.deferUpdate();

        const type = interaction.values[0]; // 'Basic' or 'Exclusive'
        const isBasic = type === 'Basic';
        const customId = isBasic ? 'SpinBasic' : 'SpinExclusive';
        const image = Config.Spin[type].SpinImage;

        const newRow = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId(customId)
                .setLabel("لف العجلة")
                .setStyle('PRIMARY')
        );

        const newEmbed = new MessageEmbed()
            .setColor(settings.لون_الامبيد)
            .setDescription(`**اهلا عزيزي العميل ${target} - .. لقد تم اعطائك لفه عجلة حظ مجانية\nيُرجى منك ضغط الزر بالاسفل لإستلام الفه المجانية .**`)
            .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
            .setImage(image)
            .setTimestamp();

        await sent.delete();
        await message.channel.send({ embeds: [newEmbed], components: [newRow] });

        const logChannel = message.guild.channels.cache.get(settings.Rooms[isBasic ? 'LogSpin' : 'LogSpins']);
        if (logChannel) {
            const logEmbed = new MessageEmbed()
                .setTitle('🎁 تم إعطاء لفه مجانية 🎁')
                .setColor(settings.EmbedColor)
                .setDescription(`- الاداري : ${message.author}\n- المستخدم : ${target}\n- نوع العجلة : ${type}`)
                .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                .setImage(image)
                .setTimestamp();

            await logChannel.send({ embeds: [logEmbed] });
        }
    });

    collector.on('end', collected => {
        if (!collected.size) sent.delete().catch(() => {});
    });
});