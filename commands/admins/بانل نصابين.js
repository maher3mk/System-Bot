const {
  Intents, Collection, Client, GuildMember, MessageActionRow, WebhookClient,
  MessagePayload, GatewayIntentBits, MessageSelectMenu, Modal, MessageEmbed,
  MessageButton, MessageAttachment, Permissions, TextInputComponent
} = require('discord.js');

const { client, db, settings } = require('../../index');
const { createEmbed } = require('../../function/function/Embed');
const config = require('../../config/settings');
const path = require('path');
const fs = require('fs');
const scamDBPath = path.join(__dirname, '../../database/scamdb.json');

if (!fs.existsSync(scamDBPath)) fs.writeFileSync(scamDBPath, '[]');

client.on('messageCreate', async message => {
  if (message.content == settings.prefix + 'setup-scam') {
    if (!settings.Owners.includes(message.author.id)) return;
    const embed = new MessageEmbed()
      .setTitle('Scamers Panel')
      .setDescription(`**- لاضافة شخص الي قايمه النصابين اختر Add Scammer\n- لازالة شخص من قايمه النصابين اختر Remove Scammer**`)
      .setThumbnail(message.guild.iconURL({ dynamic: true }))
      .setImage(config.ServerInfo.ScamImage)
      .setColor('RED');

    const row = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId('scam_action')
        .setPlaceholder('اختر إجراء')
        .addOptions([
          {
            label: 'Add Scammer',
            value: 'add_scammer',
            emoji: '➕',
          },
          {
            label: 'Remove Scammer',
            value: 'remove_scammer',
            emoji: '➖',
          },
        ])
    );

    message.channel.send({ embeds: [embed], components: [row] });
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isSelectMenu()) return;

  if (interaction.customId === 'scam_action') {
    if (interaction.values[0] === 'add_scammer') {
      const modal = new Modal()
        .setCustomId('modal_add_scammer')
        .setTitle('Add Scammer')
        .addComponents(
          new MessageActionRow().addComponents(new TextInputComponent().setCustomId('scammerID').setLabel('ScammerID').setStyle('SHORT').setRequired(true)),
          new MessageActionRow().addComponents(new TextInputComponent().setCustomId('mansubID').setLabel('MansubID').setStyle('SHORT').setRequired(true)),
          new MessageActionRow().addComponents(new TextInputComponent().setCustomId('story').setLabel('Story').setStyle('PARAGRAPH').setRequired(true)),
          new MessageActionRow().addComponents(new TextInputComponent().setCustomId('amount').setLabel('Amount').setStyle('SHORT').setRequired(true))
        );

      await interaction.showModal(modal);
    } else if (interaction.values[0] === 'remove_scammer') {
      const modal = new Modal()
        .setCustomId('modal_remove_scammer')
        .setTitle('Remove Scammer')
        .addComponents(
          new MessageActionRow().addComponents(new TextInputComponent().setCustomId('scammerID').setLabel('ScammerID').setStyle('SHORT').setRequired(true)),
          new MessageActionRow().addComponents(new TextInputComponent().setCustomId('reason').setLabel('Reason').setStyle('PARAGRAPH').setRequired(true))
        );

      await interaction.showModal(modal);
    }
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isModalSubmit()) return;

  if (interaction.customId === 'modal_add_scammer') {
    const scammerID = interaction.fields.getTextInputValue('scammerID');
    const mansubID = interaction.fields.getTextInputValue('mansubID');
    const story = interaction.fields.getTextInputValue('story');
    const amount = interaction.fields.getTextInputValue('amount');

    const data = {
      scammerID,
      MansubID: mansubID,
      story,
      amount,
      userScammer: `<@${scammerID}>`,
      userMansub: `<@${mansubID}>`,
      proofs: [],
    };

    const buttonRow = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId(`upload_proofs_${scammerID}`)
        .setLabel('Upload Proofs')
        .setStyle('PRIMARY')
    );

    interaction.client.tempScamData = interaction.client.tempScamData || {};
    interaction.client.tempScamData[scammerID] = data;

    await interaction.reply({ content: 'برجاء رفع دلايل النصب لكي يتم اكمال العملية.', components: [buttonRow], ephemeral: true });
  }

  if (interaction.customId === 'modal_remove_scammer') {
    const scammerID = interaction.fields.getTextInputValue('scammerID');
    const reason = interaction.fields.getTextInputValue('reason');
    const db = JSON.parse(fs.readFileSync(scamDBPath));
  
    const index = db.findIndex(e => e.scammerID === scammerID);
    if (index === -1) return interaction.reply({ content: 'المستخدم غير موجود في قاعدة البيانات ❌', ephemeral: true });
  
    const removedData = db[index];
    db.splice(index, 1);
    fs.writeFileSync(scamDBPath, JSON.stringify(db, null, 2));
  
    const guild = interaction.guild;
    const scammerMember = guild.members.cache.get(scammerID);
    const userTag = scammerMember?.user?.tag || `Unknown#0000`;
    const userAvatar = scammerMember?.user?.displayAvatarURL() || guild.iconURL();
  
    const confirmationEmbed = new MessageEmbed()
      .setTitle('تمت إزالة النصاب')
      .setColor('GREEN')
      .setDescription(`**تمت إزالة النصاب بنجاح!**\n\n- **اسم النصاب:** ${userTag}\n- **ID النصاب:** ${scammerID}`)
      .setThumbnail(userAvatar);
  
    await interaction.reply({ embeds: [confirmationEmbed], ephemeral: true });
  
    const logChannel = guild.channels.cache.get(config.Rooms.Logscammers);
    if (logChannel) {
      const logEmbed = new MessageEmbed()
        .setTitle('سجل إزالة نصاب')
        .setColor('RED')
        .setDescription(`**النصاب:** ${userTag} (\`${scammerID}\`)\n- **المسؤول عن الإزالة:** ${interaction.user.tag}\n- **سبب الإزالة:** ${reason}`)
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();
  
      await logChannel.send({ embeds: [logEmbed] });
    } else {
      console.error('لم يتم العثور على روم اللوج.');
    }
  }
  

  if (interaction.customId.startsWith('modal_proofs_')) {
    const scammerID = interaction.customId.split('_')[2];

    const proofs = [
      interaction.fields.getTextInputValue('proof1'),
      interaction.fields.getTextInputValue('proof2'),
      interaction.fields.getTextInputValue('proof3'),
      interaction.fields.getTextInputValue('proof4'),
    ];

    const reportDetails = interaction.client.tempScamData?.[scammerID];
    if (!reportDetails) return interaction.reply({ content: 'لم يتم العثور على البيانات!', ephemeral: true });

    reportDetails.proofs = proofs;

    const db = JSON.parse(fs.readFileSync(scamDBPath));
    db.push(reportDetails);
    fs.writeFileSync(scamDBPath, JSON.stringify(db, null, 2));

    delete interaction.client.tempScamData[scammerID];

    const embed = new MessageEmbed()
      .setColor(settings.لون_الامبيد)
      .setAuthor({
        name: interaction.guild.name,
        iconURL: interaction.guild.iconURL({ dynamic: true }),
      })
      .setTitle('تم تشهير نصاب جديد')
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .setDescription(`تم بواسطة <@${interaction.user.id}>`)
      .addFields(
        { name: 'القاضي', value: `<@${interaction.user.id}>`, inline: true },
        { name: 'العضو المنصوب عليه', value: `<@${reportDetails.MansubID}>`, inline: true },
        { name: 'العضو النصاب', value: `<@${reportDetails.scammerID}>`, inline: true },
        { name: 'القصة', value: `${reportDetails.story}` },
        { name: 'المبلغ', value: `${reportDetails.amount}` },
        { name: 'الدلائل', value: '🔽🔽🔽' }
      )
      .setTimestamp();

    const channel = client.channels.cache.get(config.ReportSettings.ChannelID);
    if (channel) {
      await channel.send({ embeds: [embed] });

      const proofFiles = reportDetails.proofs.filter(p => p);
      if (proofFiles.length > 0) {
        await channel.send({ files: proofFiles });
      }

      if (settings.ServerInfo && settings.ServerInfo.line) {
        await channel.send({ files: [settings.ServerInfo.line] });
      }
    }

    const scammerRole = interaction.guild.roles.cache.get(config.ReportSettings.ScammerRoleID);
    const scammerMember = interaction.guild.members.cache.get(reportDetails.scammerID);
    if (scammerRole && scammerMember) {
      await scammerMember.roles.add(scammerRole);
    } else {
      console.error('فشل في تعيين الدور. لم يتم العثور على العضو أو الدور.');
    }

    if (scammerMember) {
      try {
        await scammerMember.send(`**لقد تم رفع البلاغ بنجاح عليك.
تفاصيل البلاغ:
- ايدي النصاب: ${reportDetails.scammerID}
- ايدي المنصوب: ${reportDetails.MansubID}
- القصة: ${reportDetails.story}
- المبلغ: ${reportDetails.amount}**`);
          await scammerMember.send(`**لكي يتم فك التشهير عنك برجاء فتح تذكره و تعويض المنصوب \n <@${reportDetails.MansubID}> (${reportDetails.MansubID}) **`)
          await scammerMember.send({ files: [settings.ServerInfo.line] });
      } catch (error) {
        console.error('فشل في إرسال الرسالة المباشرة إلى النصاب:', error);
      }
    } else {
      console.error('لم يتم العثور على العضو النصاب لإرسال الرسالة المباشرة.');
    }

    await interaction.reply({ content: 'تم حفظ البيانات وإرسال البلاغ بنجاح ✅', ephemeral: true });
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId.startsWith('upload_proofs_')) {
    const scammerID = interaction.customId.split('_')[2];

    const modal = new Modal()
      .setCustomId(`modal_proofs_${scammerID}`)
      .setTitle('Upload Proofs')
      .addComponents(
        new MessageActionRow().addComponents(new TextInputComponent().setCustomId('proof1').setLabel('Proof 1 URL').setStyle('SHORT').setRequired(true)),
        new MessageActionRow().addComponents(new TextInputComponent().setCustomId('proof2').setLabel('Proof 2 URL').setStyle('SHORT').setRequired(true)),
        new MessageActionRow().addComponents(new TextInputComponent().setCustomId('proof3').setLabel('Proof 3 URL').setStyle('SHORT').setRequired(true)),
        new MessageActionRow().addComponents(new TextInputComponent().setCustomId('proof4').setLabel('Proof 4 URL').setStyle('SHORT').setRequired(true))
      );

    await interaction.showModal(modal);
  }
});
