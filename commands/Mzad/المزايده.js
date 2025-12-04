const { Client, GatewayIntentBits, MessageActionRow, Modal, TextInputComponent, MessageEmbed, Permissions, MessageButton } = require('discord.js');
const { client, db, settings } = require('../../index');
const config = require('../../config/settings'); 
const { createEmbed } = require('../../function/function/Embed');
const fs = require('fs');
const path = require('path');

client.on('interactionCreate', async (interaction) => {
  try {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'mzeda') {
      const modal = new Modal()
        .setCustomId('modalmze')
        .setTitle('تبعئة بيانات مزايدة');

      const tokennnn = new TextInputComponent()
        .setCustomId('bank')
        .setLabel(`قم بوضع ايدي البنك في حال لديك !`)
        .setPlaceholder('مثال: 123456789012345678')
        .setStyle('SHORT')
        .setRequired(true);

      const oddf = new TextInputComponent()
        .setCustomId('mzae')
        .setLabel(`المزايدة هنا رجاء`)
        .setPlaceholder('مثال: 500k')
        .setStyle('SHORT')
        .setRequired(true);

      const firstActionRowwww = new MessageActionRow().addComponents(tokennnn);
      const thhreee = new MessageActionRow().addComponents(oddf);

      modal.addComponents(firstActionRowwww, thhreee);

      await interaction.showModal(modal);
    }

    else if (interaction.customId.startsWith('warn-')) {
      if (!interaction.member.roles.cache.has(settings.Admins.Mzad)) {
        return interaction.followUp({ content: `** الزر خاص بالادارة **`, ephemeral: true });
      }

      const us = interaction.customId.split('-')[1];
      try {
        const wu = await interaction.guild.members.fetch(us);
        await wu.timeout(3600000, 'تحذير مزاد');
        await interaction.reply({ content: `تم اعـطـاء العضو تـايم اوت ✅`, ephemeral: true });

        // تعطيل الزر
        const mb = interaction.message.components;
        mb.forEach(row => {
          row.components.forEach(button => button.setDisabled(true));
        });

        // تعديل الـ Embed
        const oldEmbed = interaction.message.embeds[0];
        const newEmbed = new MessageEmbed(oldEmbed)
          .setTitle("الـعضـو مـخالـف ✅")
          .setColor("RED");

        await interaction.message.edit({ embeds: [newEmbed], components: mb });

      } catch (err) {
        console.error(err);
        await interaction.reply({ content: `❌ حدث خطأ أثناء إعطاء التايم أوت`, ephemeral: true });
      }
    }

  } catch (err) {
    console.log(err);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isModalSubmit()) return;

  if (interaction.customId === 'modalmze') {
    try {
      const bank = interaction.fields.getTextInputValue('bank');
      const mzae = interaction.fields.getTextInputValue('mzae');

      let roww = new MessageActionRow().addComponents(
        new MessageButton()
          .setLabel(`تـحـذير الـعضـو`)
          .setStyle('SECONDARY')
          .setCustomId(`warn-${interaction.user.id}`)
      );

      let embed = new MessageEmbed()
        .setDescription(`> **هنالك بنـك؟ :**  __${bank}__\n\n> **اخـر مـزايـدة : ** __${mzae}__`)
        .setFooter(interaction.guild.name, interaction.guild.iconURL())
        .setAuthor(interaction.user.username, interaction.user.avatarURL())
        .setThumbnail(interaction.user.avatarURL())
        .setTimestamp();

      await interaction.channel.send({ content: `${interaction.user}`, embeds: [embed], components: [roww] });

      if (config.line) {
        await interaction.channel.send({ files: [settings.ServerInfo.line] });
      }

      await interaction.reply({ content: `✅ تم استلام المزايدة بنجاح!`, ephemeral: true });
    } catch (err) {
      console.log(err);
    }
  }
})