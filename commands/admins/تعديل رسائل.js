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

const messageLinkMap = new Map(); // لتخزين الرسائل المؤقتة للأزرار

// أمر تعديل الرسالة
client.on("messageCreate", async (message) => {
  if (!message.content.startsWith(settings.prefix + 'edit')) return;

  if (!message.member.roles.cache.has(settings.Admins.DiscordLeder)) {
    return message.channel.send("**ليس لديك صلاحيات كافية لإرسال الرسالة.**");
  }

  const args = message.content.split(' ').slice(1);
  const channelId = args[0]?.replace(/<#|>/g, '');
  const messageId = args[1];

  if (!channelId || !messageId) return message.reply('يرجى استخدام الأمر هكذا: `-edit <channelId> <messageId>`');

  const channel = client.channels.cache.get(channelId);
  if (!channel || channel.type !== 'GUILD_TEXT') return message.reply('لم يتم العثور على الروم.');

  let targetMsg;
  try {
    targetMsg = await channel.messages.fetch(messageId);
  } catch {
    return message.reply('لم يتم العثور على الرسالة.');
  }

  const button = new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId(`edit-${message.author.id}-${channelId}-${messageId}`)
      .setLabel('تعديل الرسالة')
      .setStyle('PRIMARY')
  );

  const embed = new MessageEmbed()
    .setColor('BLUE')
    .setDescription('**برجاء الضغط علي الزر لتعديل الرساله**');

  const sent = await message.channel.send({ embeds: [embed], components: [button] });
  messageLinkMap.set(messageId, { buttonMsgId: sent.id, channelId: sent.channel.id });
});

// التعامل مع الضغط على الزر والمودال
client.on('interactionCreate', async (interaction) => {

  // زر تعديل الرسالة
  if (interaction.isButton()) {
    const [action, userId, channelId, messageId] = interaction.customId.split('-');
    if (action !== 'edit') return;
    if (interaction.user.id !== userId) return interaction.reply({ content: 'هذا الزر ليس لك.', ephemeral: true });

    const channel = client.channels.cache.get(channelId);
    if (!channel) return interaction.reply({ content: 'تعذر الوصول إلى الروم.', ephemeral: true });

    let targetMsg;
    try {
      targetMsg = await channel.messages.fetch(messageId);
    } catch {
      return interaction.reply({ content: 'تعذر الوصول إلى الرسالة.', ephemeral: true });
    }

    const editModal = new Modal()
      .setCustomId(`modal-${channelId}-${messageId}`)
      .setTitle('تعديل الرسالة');

    const input = new TextInputComponent()
      .setCustomId('newContent')
      .setLabel('محتوى الرسالة الجديد')
      .setStyle('PARAGRAPH')
      .setRequired(true)
      .setValue(targetMsg.content || '');

    const row = new MessageActionRow().addComponents(input);
    editModal.addComponents(row);

    await interaction.showModal(editModal).catch(err => console.error(err));
  }

  // مودال تعديل الرسالة
  if (interaction.isModalSubmit()) {
    const [_, channelId, messageId] = interaction.customId.split('-');

    let newContent;
    try {
      newContent = interaction.fields.getTextInputValue('newContent');
    } catch (err) {
      // fallback to other possible field ids to avoid MODAL_SUBMIT_INTERACTION_FIELD_NOT_FOUND
      try { newContent = interaction.fields.getTextInputValue('content'); } catch (_) { newContent = null; }
    }
    if (!newContent || newContent.trim() === '') return interaction.reply({ ephemeral: true, content: 'لا يمكن أن يكون حقل النص فارغاً، الرجاء المحاولة مرة أخرى.' });

    const channel = client.channels.cache.get(channelId);
    if (!channel) return interaction.reply({ content: 'لم يتم العثور على الروم.', ephemeral: true });

    try {
      const targetMsg = await channel.messages.fetch(messageId);
      await targetMsg.edit(newContent);

      const doneEmbed = new MessageEmbed()
        .setColor('GREEN')
        .setDescription(`**تم تعديل الرسالة بنجاح.**\n-# **تم التعديل بواسطة: ${interaction.user}**`);

      await interaction.reply({ embeds: [doneEmbed], ephemeral: true });

      // حذف زر التعديل
      const link = messageLinkMap.get(messageId);
      if (link) {
        try {
          const btnChannel = client.channels.cache.get(link.channelId);
          const btnMsg = await btnChannel.messages.fetch(link.buttonMsgId);
          if (btnMsg) await btnMsg.delete();
        } catch {}
        messageLinkMap.delete(messageId);
      }

    } catch {
      interaction.reply({ content: 'حدث خطأ أثناء تعديل الرسالة.', ephemeral: true });
    }
  }
});

// حذف زر التعديل لو الرسالة الأصلية انحذفت
client.on('messageDelete', async (deletedMsg) => {
  const link = messageLinkMap.get(deletedMsg.id);
  if (!link) return;

  try {
    const btnChannel = client.channels.cache.get(link.channelId);
    const btnMsg = await btnChannel.messages.fetch(link.buttonMsgId);
    if (btnMsg) await btnMsg.delete();
  } catch {}

  messageLinkMap.delete(deletedMsg.id);
});
