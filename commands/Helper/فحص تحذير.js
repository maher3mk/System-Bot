const { Intents, Collection, Client, GuildMember, MessageActionRow, WebhookClient,MessagePayload, GatewayIntentBits, MessageSelectMenu, Modal, MessageEmbed,MessageButton, MessageAttachment, Permissions, TextInputComponent} = require('discord.js');
const { client, db , settings} = require('../../index');

const moment = require('moment');

const { createEmbed  } = require('../../function/function/Embed')
const but = new MessageActionRow().addComponents(
    new MessageButton()
        .setCustomId('CancelButton')
        .setLabel('الغاء العملية ؟')
        .setStyle('DANGER')
)

client.on('interactionCreate', async interaction => {
    if (!interaction.isSelectMenu()) return
    if (interaction.customId == 'RedBull_Helber'){
  	  const selectedValue = interaction.values[0];

      if (selectedValue == 'فحص تحذير'){
        if (!interaction.member.roles.cache.has(settings.Admins.DiscordStaff)) return await interaction.reply({content : `**انت ادارة ؟؟؟ 😅**` , ephemeral : true})

        const ModalCheck = new Modal()
        .setCustomId('CheckWarns')
        .setTitle('لفحص تحذير')
        .setComponents()

        const Info = new TextInputComponent()
        .setCustomId('Info')
        .setLabel('اي التحذير الي عاوز تفحصه ؟')
        .setPlaceholder('حط ايدي العضو')
        .setStyle('SHORT')
        .setRequired(true)


        const row = new MessageActionRow().addComponents(Info)

        await ModalCheck.addComponents(row);
        await interaction.showModal(ModalCheck)
  
      }
  
    }
  })


  client.on('interactionCreate', async interaction => {
    if (!interaction.isModalSubmit()) return;
    if (interaction.customId == 'CheckWarns') {
        const Info = interaction.fields.getTextInputValue('Info');

        const embed1 = createEmbed({
            interaction: interaction,
            title: `مراجعة البيانات`,
            description: `يرجى الانتظار جاري فحص البيانات بالكامل... ✅`
        });

        await interaction.update({ embeds: [embed1] });

        const data = await db.get("Data_Warns");
        const warnData = data?.filter((t) => t.userid == Info);

        if (!warnData || warnData.length === 0) {
            const embed1 = createEmbed({
                interaction: interaction,
                title: `خطأ`,
                description: `لم يتم العثور على اي بيانات خاصه بالايدي الذي وضعته ❌`
            });
            return await interaction.editReply({ embeds: [embed1] });
        }

        const warnOptions = warnData.map(warn => {
            const timestamp = moment(warn.time, 'X').unix(); 
            const formattedDate = moment.unix(timestamp).format('D/M/YYYY [الساعة] h:mm A');
            
            return {
                label: `تحذير رقم ${warn.warn}`,
                value: warn.time,
                description: `تاريخ التحذير: ${formattedDate}`
            };
        });

        const selectMenu = new MessageSelectMenu()
            .setCustomId('WarnSelector')
            .setPlaceholder('اختار التحذير الذي تريد فحصه')
            .addOptions(warnOptions);

        const row = new MessageActionRow().addComponents(selectMenu);

        const embed2 = createEmbed({
            interaction: interaction,
            title: `اختر التحذير`,
            description: `اختر التحذير الذي تريد فحصه من السيلكت منيو`
        });

        await interaction.editReply({ embeds: [embed2], components: [row, but] });
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isSelectMenu()) return;
    if (interaction.customId == 'WarnSelector') {
        await interaction.deferUpdate();

        const selectedWarnId = interaction.values[0];

        const selectedWarnData = await db.get("Data_Warns");
        const selectedWarn = selectedWarnData?.find((w) => w.time == selectedWarnId);

        if (!selectedWarn) {
            const errorEmbed = createEmbed({
                interaction: interaction,
                title: `خطأ`,
                description: `لم يتم العثور على بيانات للتحذير المحدد`
            });
            return await interaction.editReply({ embeds: [errorEmbed] });
        }
        const images = selectedWarn.image.flat();

        const warnEmbed = createEmbed({
            interaction: interaction,
            title: `تفاصيل التحذير`,
            fields: [
                { name: 'العضو', value: `<@${selectedWarn.userid }>`},
                { name: 'الاداري', value: `<@${selectedWarn.staff}>` },
                { name: 'الوقت', value: `${selectedWarn.time}`, inline: true },
                { name: 'السبب', value: selectedWarn.reason },
                { name: 'محتوى الرسالة', value: selectedWarn.info }
            ],
        });

        await interaction.editReply({ embeds: [warnEmbed]});
        await interaction.channel.send({content  : `**# دي الدلائل :**` ,files: images.length > 0 ? images.map(img => ({ attachment: img, name: 'image.png' })) : []})
    }
});

