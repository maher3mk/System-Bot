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

const { client, db, dbTickets, settings } = require('../../index');
const { createEmbed } = require('../../function/function/Embed');
const path = require('path');
const fs = require('fs');
const checkCredits = require('../../function/function/checkCredits');
const Config = require('../../config/prices');

const privateSPath = path.join(__dirname, '../../data/privateS.json');
const privateRoomMessageMap = new Map();
const openModals = new Map();
const submittedRooms = new Map();
const changeButtonMessages = new Map();

client.on('interactionCreate', async interaction => {
  if (!interaction.isSelectMenu()) return;
  if (interaction.customId !== 'select_Buy') return;

  const selectedValue = interaction.values[0];
  if (selectedValue === 'Buy_Privte_Room') {
    const tax = Math.floor(Config.PrivteRoom.Day7 * (20 / 19) + 1);
    const embed = createEmbed({
      interaction,
      title: `عملية شراء روم خاص 7 ايام`,
      image: null,
      color: settings.لون_الامبيد,
      description: `لأكمال عملية شراء الروم الخاص، يرجي نسخ الكود بالاسفل واتمام عملية التحويل\n\n\`\`\`#credit ${settings.BankID} ${tax}\`\`\``
    });

    const copyButton = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("sends_credit_msg")
        .setLabel("نسخ الأمر")
        .setStyle("SECONDARY"),
      new MessageButton()
        .setCustomId("cancel_purchase")
        .setLabel("إلغاء الشراء")
        .setStyle("DANGER")
    );

    await interaction.update({ embeds: [embed], components: [copyButton] });
    await interaction.channel.send(`#credit ${settings.BankID} ${tax}`);

    const result = await checkCredits(interaction, Config.PrivteRoom.Day7, 60000, settings.BankID, settings.Probot);

    if (result.success) {
      const DataTicket = await dbTickets.get(`Tickets_Support`);
      const ExitData = DataTicket?.find(t => t.Ticket == interaction.channel.id);
      if (ExitData && !ExitData.Buys) {
        ExitData.Buys = "تم شراء روم خاص 7 ايام";
        await dbTickets.set(`Tickets_Support`, DataTicket);
      }

      const button = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId('PrivteRoomCreate')
          .setLabel(`اضغط هنا لأكمال العملية`)
          .setStyle('PRIMARY')
      );

      await interaction.editReply({
        embeds: [interaction.message.embeds[0].setDescription(`**- تمت عملية الشراء بنجاح ✅\n\n اضغط علي الزر بالاسفل وضع اسم الروم الذي تريده وسيتم انشائه**`)],
        components: [button],
      });

      const Log = await interaction.guild.channels.cache.get(settings.Rooms.LogPosts);
      if (Log) {
        const logEmbed = createEmbed({
          interaction,
          title: `عملية شراء روم خاص ناجحة`,
          image: null,
          color: settings.لون_الامبيد,
          description: `- تم شراء روم خاص بنجاح\n- الشخص: ${interaction.user}\n- السعر: ${Config.PrivteRoom.Day7}\n- الوقت: <t:${Math.floor(Date.now() / 1000)}:R>`
        });
        await Log.send({ embeds: [logEmbed] });
      }
    } else {
      await interaction.editReply({
        embeds: [interaction.message.embeds[0].setDescription(`لقد انتهى الوقت، لا تقم بالتحويل ${interaction.user}`)],
        components: [],
      });
    }
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;
  if (interaction.customId === 'cancel_purchase') {
    await interaction.update({
      embeds: [interaction.message.embeds[0].setDescription('**- تم إلغاء عملية الشراء ❌**')],
      components: []
    });
    return;
  }
  if (interaction.customId === 'PrivteRoomCreate') {
    if (openModals.has(interaction.user.id)) {
      return interaction.reply({ content: '⚠️ لديك مودال مفتوح بالفعل، أغلقه أولاً.', ephemeral: true });
    }

    openModals.set(interaction.user.id, true);

    const PostModal = new Modal()
      .setCustomId('PostModalPrivteRoom')
      .setTitle('اتمام عملية شراء الروم الخاص');

    const NameRoom = new TextInputComponent()
      .setCustomId('NameRoom')
      .setLabel("حابب يكون اسم رومك اي؟")
      .setPlaceholder('اكتب اسم الروم هنا !')
      .setRequired(true)
      .setStyle('SHORT');

    PostModal.addComponents(new MessageActionRow().addComponents(NameRoom));

    try {
      await interaction.showModal(PostModal);

      // Disable the button after showing modal
      const disabledButton = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId('PrivteRoomCreate')
          .setLabel('✅ تم الاستلام...')
          .setStyle('SUCCESS')
          .setDisabled(true)
      );

      await interaction.followUp({
        content: 'يرجى إكمال الاستمارة المرسلة.',
        ephemeral: true
      });

      // Update the original message to disable the button
      const msg = await interaction.channel.messages.fetch(interaction.message.id);
      await msg.edit({
        embeds: msg.embeds,
        components: [disabledButton]
      });
    } catch (error) {
      console.error("خطأ أثناء عرض المودال:", error);
      openModals.delete(interaction.user.id);
    }
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isModalSubmit()) return;
  if (interaction.customId !== 'PostModalPrivteRoom') return;

  await interaction.deferReply();

  const chname = interaction.fields.getTextInputValue('NameRoom');
  const channelName = `✧・${chname}`;
  const creationTime = Date.now();
  const expirationTime = creationTime + 7 * 24 * 60 * 60 * 1000; // 7 أيام

  try {
    const privateSRoom = await interaction.guild.channels.create(channelName, {
      type: 'GUILD_TEXT',
      parent: settings.Rooms.CeatogryPrivteRooms,
      rateLimitPerUser: 3600,
      permissionOverwrites: [
        {
          id: interaction.guild.roles.everyone.id,
          allow: [Permissions.FLAGS.VIEW_CHANNEL],
          deny: [Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.ATTACH_FILES]
        },
        {
          id: interaction.user.id,
          allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.ATTACH_FILES]
        },
      ],
    });

    const embed = new MessageEmbed()
      .setTitle("- Private S Room")
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .setColor(settings.EmbedColor)
      .setFooter(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }))
      .setDescription(`**Owner: ${interaction.user}\nEnds in: <t:${Math.floor(expirationTime / 1000)}:R>\n\n- Created Date: <t:${Math.floor(creationTime / 1000)}:F>\n- End Date: <t:${Math.floor(expirationTime / 1000)}:F>**`);

    const changenamebtn = new MessageButton()
      .setCustomId(`change_${interaction.user.id}`)
      .setLabel("Change Name")
      .setStyle("SECONDARY");

    await privateSRoom.send({
      content: `${interaction.user}`,
      embeds: [embed],
      components: [new MessageActionRow().addComponents(changenamebtn)]
    });

    const doneEmbed = new MessageEmbed()
      .setTitle("عملية إنشاء روم خاص ناجحة")
      .setDescription("**- تم إنشاء الروم الخاص بنجاح ✅**")
      .addFields({ name: '📌 اسم الروم', value: `\`${channelName}\`` })
      .setColor(settings.EmbedColor)
      .setTimestamp();

    await interaction.editReply({ embeds: [doneEmbed] });
   try {
      const msg = await interaction.channel.messages.fetch(interaction.message.id);
      const oldButton = msg.components[0].components[0];

      const claimedButton = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId(oldButton.customId)
          .setLabel("✅ Claimed...")
          .setStyle("SUCCESS")
          .setDisabled(true)
      );

      await msg.edit({ components: [claimedButton] });
    } catch (err) {
      console.error("Error updating button to claimed:", err);
    }
    let privateSData = {};
    if (fs.existsSync(privateSPath)) {
      privateSData = JSON.parse(fs.readFileSync(privateSPath, 'utf8'));
    }

    privateSData[interaction.user.id] = {
      userId: interaction.user.id,
      roomId: privateSRoom.id,
      roomName: channelName,
      isOpen: true,
      createdAt: creationTime,
      expiresAt: expirationTime
    };

    fs.writeFileSync(privateSPath, JSON.stringify(privateSData, null, 4));
  } catch (error) {
    console.error("Error creating private room:", error);
    await interaction.channel.send({ content: "❌ **حدث خطأ أثناء إنشاء الروم الخاص.**" });
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;
  if (!interaction.customId.startsWith('change_')) return;

  const userId = interaction.customId.split('_')[1];
  if (interaction.user.id !== userId) {
    return interaction.reply({ content: "❌ لا يمكنك استخدام هذا الزر، فقط صاحب الروم يمكنه ذلك.", ephemeral: true });
  }

  const messageId = changeButtonMessages.get(interaction.user.id);
  if (!messageId) {
    return interaction.reply({ content: "❌ لا يمكن العثور على الرسالة.", ephemeral: true });
  }

  try {
    const message = await interaction.channel.messages.fetch(messageId);
    const disabledButton = new MessageButton()
      .setCustomId(`change_${interaction.user.id}`)
      .setLabel("Change Name (Used)")
      .setStyle("SECONDARY")
      .setDisabled(true);

    await message.edit({
      embeds: message.embeds,
      components: [new MessageActionRow().addComponents(disabledButton)]
    });

    const modal = new Modal()
      .setCustomId('ChangeRoomNameModal')
      .setTitle('تغيير اسم الروم');

    const nameInput = new TextInputComponent()
      .setCustomId('NewRoomName')
      .setLabel("ادخل الاسم الجديد لللروم:")
      .setStyle("SHORT")
      .setRequired(true);

    modal.addComponents(new MessageActionRow().addComponents(nameInput));
    await interaction.showModal(modal);
  } catch (error) {
    console.error("Error disabling button:", error);
    await interaction.reply({ content: "❌ حدث خطأ أثناء معالجة الزر.", ephemeral: true });
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isModalSubmit()) return;
  if (interaction.customId !== 'ChangeRoomNameModal') return;

  await interaction.deferReply({ ephemeral: true });

  try {
    const newName = interaction.fields.getTextInputValue('NewRoomName');
    const channel = interaction.channel;

    await channel.setName(`✧・${newName}`);
    await interaction.editReply({ content: `✅ تم تغيير اسم الروم إلى: ✧・${newName}` });

    if (fs.existsSync(privateSPath)) {
      const data = JSON.parse(fs.readFileSync(privateSPath, 'utf8'));
      if (data[interaction.user.id]) {
        data[interaction.user.id].roomName = `✧・${newName}`;
        fs.writeFileSync(privateSPath, JSON.stringify(data, null, 4));
      }
    }
  } catch (err) {
    console.error("Error changing room name:", err);
    await interaction.editReply({ content: "❌ حصل خطأ أثناء تغيير الاسم" });
  }
});

async function checkRooms() {
  if (!fs.existsSync(privateSPath)) return;

  let privateSData = JSON.parse(fs.readFileSync(privateSPath, "utf8"));
  let updatedData = { ...privateSData };

  for (const userId in privateSData) {
    const roomId = privateSData[userId].roomId;
    const channel = await client.channels.fetch(roomId).catch(() => null);
    if (!channel) {
      delete updatedData[userId];
    }
  }

  fs.writeFileSync(privateSPath, JSON.stringify(updatedData, null, 4));
}

setInterval(checkRooms, 60 * 60 * 1000);
