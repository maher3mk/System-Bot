const { Client, MessageActionRow, MessageSelectMenu, Modal, TextInputComponent, MessageButton, MessageEmbed } = require('discord.js');
const { client, settings } = require('../../index');
const fs = require('fs');
const prices = require('../../config/prices');
const dataFile = 'infoData.json';

const openModals = new Map();
const submittedAds = new Map();

// دوال مساعدة
function parseAmount(input) {
    const suffixes = { k: 1e3, m: 1e6 };
    const match = input.match(/^([\d.]+)([km]?)$/i);
    if (!match) return null;
    const number = parseFloat(match[1]);
    const suffix = match[2].toLowerCase();
    return suffixes[suffix] ? number * suffixes[suffix] : number;
}

function calculateTax(amount) {
    return Math.floor(amount * (20 / 19) + 1);
}

// اختيار نوع الإعلان
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isSelectMenu()) return;

    if (interaction.customId === 'select_Buy' && interaction.values[0] === 'Buy_Ads_Mention') {
        const infoData = fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile, 'utf8')) : {};
        const description = infoData["announcements"] || "❌ **لم يتم تعيين رد لهذه الفئة بعد!**";

        const adsem = new MessageEmbed()
            .setColor(settings.EmbedColor)
            .setDescription(description);

        const adstypeselect = new MessageSelectMenu()
            .setCustomId('ads_select')
            .setOptions(
                { label: 'إعلان بدون منشن', value: 'بدون منشن' },
                { label: 'إعلان مع منشن هير', value: 'منشن هير' },
                { label: 'إعلان مع منشن ايفري ون', value: 'منشن ايفري ون' },
                { label: 'إعلان بروم هدايا مع جيفواي (لمدة 3 أيام)', value: 'بروم الهداية' },
                { label: 'روم خاص مع قيف أواي (لمدة 3 أيام)', value: 'روم خاص مع قيف اوي' },
                { label: 'أول روم بالسيرفر مع قيف أواي (لمدة أسبوع)', value: 'اول روم' }
            );

        const row = new MessageActionRow().addComponents(adstypeselect);
        await interaction.message.delete();
        await interaction.channel.send({ embeds: [adsem], components: [row] });
    }
});

// بعد اختيار نوع الإعلان، عرض السعر وبدء التحويل
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isSelectMenu()) return;
    if (interaction.customId !== 'ads_select') return;

    const selectedValue = interaction.values[0];
    const user = interaction.guild.members.cache.get(interaction.user.id);
    const args = prices.ads[selectedValue];
    const amount = parseAmount(args);
    const tax = calculateTax(amount);

    const buyads = new MessageEmbed()
        .setTitle(`عملية شراء إعلان: \`${selectedValue}\``)
        .setColor(settings.EmbedColor)
        .setDescription(`**لإكمال شراء الإعلان \`${selectedValue}\` يرجى تحويل \`$${tax}\` إلى <@${settings.BankID}>**

\`- ملاحظة:\`
- التحويل بالضريبة فقط، نحن غير مسؤولين عن التحويل بدون ضرائب.
- التحويل للبنك فقط، نحن غير مسؤولين عن التحويل لشخص آخر.
- التحويل داخل التذكرة فقط، نحن غير مسؤولين عن التحويل خارج التذكرة.

\`\`\`#credit ${settings.BankID} ${tax}\`\`\`**`);

    const cancelButton = new MessageActionRow().addComponents(
        new MessageButton()
            .setCustomId("cancel_purchase")
            .setLabel("إلغاء الشراء")
            .setStyle("DANGER")
    );

    await interaction.reply({ embeds: [buyads], components: [cancelButton] });
    await interaction.channel.send(`#credit ${settings.BankID} ${tax}`);

    const filter = (response) =>
        response.content.startsWith(`**:moneybag: | ${interaction.user.username}, has transferred \`$${prices.ads[selectedValue]}\``) &&
        response.content.includes(settings.BankID) &&
        response.author.id === settings.Probot &&
        response.content.includes(prices.ads[selectedValue]);

    const collector = interaction.channel.createMessageCollector({ filter, time: 300000 });

    collector.on('collect', async (message) => {
        const logChannel = interaction.guild.channels.cache.get(settings.Rooms.LogAds);
        if (!logChannel) return;

        const adsbtn = new MessageButton()
            .setCustomId(`ads_${selectedValue}`)
            .setLabel("أرسل الإعلان")
            .setStyle('SECONDARY');

        const row = new MessageActionRow().addComponents(adsbtn);

        const embed = new MessageEmbed()
            .setTitle("💳 عملية شراء إعلان 💳")
            .setColor(settings.EmbedColor)
            .setThumbnail(interaction.guild.iconURL())
            .addFields(
                { name: "👤 العميل", value: `<@${interaction.user.id}>`, inline: true },
                { name: "🏅 نوع الإعلان", value: `\`${selectedValue}\``, inline: true }
            )
            .setTimestamp();

        await logChannel.send({ content: `**- ${user}**`, embeds: [embed] });

        const embed1 = new MessageEmbed()
            .setTitle("عملية شراء ناجحة")
            .setDescription("**- تمت عملية الشراء بنجاح ✅\n\n اضغط علي الزر بالاسفل وضع اعلانك لكي يتم نشره**")
            .setColor(settings.EmbedColor)
            .addFields({ name: '🏅 نوع الإعلان', value: `\`${selectedValue}\`` })
            .setTimestamp();

        await message.channel.send({ embeds: [embed1], components: [row] });
    });

    collector.on('end', async (collected) => {
        if (collected.size === 0) {
            const timeend = new MessageEmbed()
                .setTitle("❌ | انتهى الوقت")
                .setColor(settings.EmbedColor)
                .setDescription("**❌ | انتهى الوقت، لا تحول إذا حولت فنحن غير مسؤولين**")
                .setTimestamp();
            await interaction.channel.send({ embeds: [timeend] });
        }
    });
});

// زر إرسال الإعلان وفتح المودال
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith('ads_')) return;

    const selectedValue = interaction.customId.split("_")[1];

    if (openModals.has(interaction.user.id)) {
        return interaction.reply({ content: '⚠️ لديك مودال مفتوح بالفعل، أغلقه أولاً.', ephemeral: true });
    }

    openModals.set(interaction.user.id, true);

    const modal = new Modal()
        .setTitle(`إعلان ${selectedValue}`)
        .setCustomId(`adstype_${selectedValue}`);

    const adss = new TextInputComponent()
        .setCustomId('adss')
        .setLabel("الإعلان")
        .setRequired(true)
        .setStyle('PARAGRAPH');

    const row1 = new MessageActionRow().addComponents(adss);
    modal.addComponents(row1);

    if (['روم خاص مع قيف اوي', 'اول روم'].includes(selectedValue)) {
        const channelName = new TextInputComponent()
            .setCustomId('channelName')
            .setLabel("اسم الروم")
            .setRequired(true)
            .setStyle('SHORT');

        const row2 = new MessageActionRow().addComponents(channelName);
        modal.addComponents(row2);
    }

    try {
        await interaction.showModal(modal);
    } catch (error) {
        console.error("خطأ أثناء عرض المودال:", error);
        openModals.delete(interaction.user.id);
    }
});

// عند تقديم المودال وإرسال الإعلان
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isModalSubmit()) return;
    if (!interaction.customId.startsWith('adstype_')) return;

    const selectedValue = interaction.customId.split("_")[1];

    if (submittedAds.has(`${interaction.user.id}_${selectedValue}`)) {
        openModals.delete(interaction.user.id);
        return interaction.reply({ content: '⚠️ لقد قمت بإرسال هذا الإعلان بالفعل.', ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const adsss = interaction.fields.getTextInputValue('adss');
    const adss = adsss.replace(/@everyone|@here/g, '');
    let channelName;

    if (['روم خاص مع قيف اوي', 'اول روم'].includes(selectedValue)) {
        channelName = interaction.fields.getTextInputValue('channelName');
        if (!channelName) {
            openModals.delete(interaction.user.id);
            return interaction.editReply({ content: '⚠️ يرجى إدخال اسم الروم.' });
        }
    }

    const adsesschannel = interaction.guild.channels.cache.get(settings.Rooms.RoomAds);
    const giftChannel = interaction.guild.channels.cache.get(settings.Rooms.Giftsad);
    const user = interaction.guild.members.cache.get(interaction.user.id);

    // زر Disabled بعد الإرسال
    const donebtn = new MessageButton()
        .setCustomId('clamed')
        .setLabel("تم الشراء ✅")
        .setStyle('SUCCESS')
        .setDisabled(true);
    const row = new MessageActionRow().addComponents(donebtn);

    try {
        // إرسال الإعلان حسب النوع
        if (selectedValue === 'بدون منشن' && adsesschannel) {
            await adsesschannel.send(adss);
        } else if (selectedValue === 'منشن هير' && adsesschannel) {
            await adsesschannel.send(`${adss} \n@here`);
        } else if (selectedValue === 'منشن ايفري ون' && adsesschannel) {
            await adsesschannel.send(`${adss} \n@everyone`);
        } else if (selectedValue === 'بروم الهداية' && giftChannel) {
            await giftChannel.send(`${adss}\n @everyone`);
            await giftChannel.send(`$giveaway 3d 1 500k`);
        } else if (['روم خاص مع قيف اوي', 'اول روم'].includes(selectedValue)) {
            // إنشاء روم جديد مع تعطيل إرسال الرسائل لـ @everyone
            const privateRoom = await interaction.guild.channels.create(channelName, {
                type: 'GUILD_TEXT',
                parent: selectedValue === 'روم خاص مع قيف اوي'
                    ? settings.Rooms.CeatogryPrivteRoomad
                    : settings.Rooms.Firstadcatagory,
                topic: 'Room for a giveaway event.',
                permissionOverwrites: [
                    {
                        id: interaction.guild.id, // @everyone
                        deny: ['SEND_MESSAGES']
                    }
                ]
            });

            await privateRoom.send(`${adss} \n @everyone`);
            await privateRoom.send(`$giveaway 3d 1 500k`);
        }

        submittedAds.set(`${interaction.user.id}_${selectedValue}`, true);

        await interaction.channel.send({ content: `✅ **تم إرسال الإعلان بنجاح: ${user}**` });
        await interaction.message.edit({ components: [row] });
        await interaction.editReply({ content: 'تم إرسال الإعلان بنجاح.' });

    } catch (error) {
        console.error("خطأ أثناء إرسال الإعلان:", error);
        await interaction.editReply({ content: '❌ حدث خطأ أثناء إرسال الإعلان، حاول مرة أخرى لاحقًا.' });
    } finally {
        openModals.delete(interaction.user.id);
    }
});
