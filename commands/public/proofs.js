const fs = require('fs');
const path = require('path');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { client, settings } = require('../../index.js');

const dataPath = path.join(__dirname, '../../data/proofs.json');

// تحميل وحفظ البيانات
function loadData() {
  if (!fs.existsSync(dataPath)) return { proofs: [], openRooms: {} };
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

function saveData(d) {
  const dir = path.dirname(dataPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(dataPath, JSON.stringify(d, null, 2), 'utf8');
}

// إعداد الرسالة
client.on('messageCreate', async (msg) => {
  if (msg.author.bot || !msg.guild) return;
  if (msg.content !== `${settings.prefix}setup-proofs`) return;

  const embed = new MessageEmbed()
    .setTitle('دلائل البائعين')
    .setDescription('اضغط "ارسل دليلي" لفتح روم خاص وإرسال صورة.')
    .setColor(settings.لون_الامبيد || 'BLUE');

  const row = new MessageActionRow().addComponents(
    new MessageButton().setCustomId('open_proof').setLabel('ارسل دليلي').setStyle('PRIMARY'),
    new MessageButton().setCustomId('count_proofs').setLabel('كم دليل معي').setStyle('SECONDARY'),
    new MessageButton().setCustomId('show_proofs').setLabel('عرض دلائلي').setStyle('SUCCESS')
  );

  await msg.channel.send({ embeds: [embed], components: [row] });
});

// التعامل مع الأزرار
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  const user = interaction.user;
  const guild = interaction.guild;
  const d = loadData();

  // عد الأدلة
  if (interaction.customId === 'count_proofs') {
    const count = d.proofs.filter(p => p.userId === user.id).length;
    return interaction.reply({ ephemeral: true, content: `لديك ${count} دليل${count === 1 ? '' : 'ات'}.` });
  }

  // عرض الأدلة
  if (interaction.customId === 'show_proofs') {
    const userProofs = d.proofs.filter(p => p.userId === user.id);
    if (userProofs.length === 0) return interaction.reply({ ephemeral: true, content: 'ليس لديك أي دلائل مخزنة.' });
    const lines = userProofs.map(p => `#${p.id} • ${new Date(p.timestamp).toLocaleString()} • ${p.imageURL}`);
    return interaction.reply({ ephemeral: true, content: `دلائلك:\n${lines.slice(0, 10).join('\n')}` });
  }

  // فتح روم خاص لإرسال الدليل
  if (interaction.customId === 'open_proof') {
    await interaction.deferReply({ ephemeral: true });

    if (d.openRooms[user.id]) {
      return interaction.editReply({ content: 'لديك روم دليل مفتوح بالفعل. أكمل عليه أولاً.' });
    }

    const categoryId = settings.Rooms?.proofCategoryId;
    if (!categoryId) return interaction.editReply({ content: 'إعدادات السيرفر ناقصة (proofCategoryId).' });

    const category = await guild.channels.fetch(categoryId).catch(() => null);
    if (!category || category.type !== 'GUILD_CATEGORY') {
      return interaction.editReply({ content: 'category id غير موجود أو خاطئ في إعدادات السيرفر.' });
    }

    const channelName = `proof-${user.username}-${user.discriminator}`
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .slice(0, 90);

    const channel = await guild.channels.create(channelName, {
      type: 'GUILD_TEXT',
      parent: categoryId,
      permissionOverwrites: [
        { id: guild.roles.everyone.id, deny: ['VIEW_CHANNEL'] },
        { id: user.id, allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY'] },
        { id: client.user.id, allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_MESSAGES'] }
      ]
    }).catch(err => {
      console.error('Failed to create channel:', err);
      return null;
    });

    if (!channel) return interaction.editReply({ content: 'فشل في إنشاء روم دلائل.' });

    d.openRooms[user.id] = channel.id;
    saveData(d);

    await interaction.editReply({ content: `تم إنشاء روم خاص: ${channel}` });
    await channel.send(`${user}, أرسل صورة هنا ليتم حفظ الدليل ( صورة وليس ملف ! ).`).catch(console.error);

    const filter = m => m.author.id === user.id && m.attachments.size > 0;
    const collector = channel.createMessageCollector({ filter, time: 5 * 60 * 1000, max: 1 });

    collector.on('collect', async (m) => {
      const attachment = m.attachments.first();

      if (!attachment.contentType?.startsWith('image/')) {
        await channel.send('الملف المرسل ليس صورة صالحة. الرجاء إرسال صورة PNG/JPG/GIF/WEBP.');
        return;
      }

      const userCount = d.proofs.filter(p => p.userId === user.id).length;
      const id = d.proofs.length + 1;

      const proof = {
        id,
        userId: user.id,
        userTag: `${user.username}#${user.discriminator}`,
        imageURL: attachment.url,
        proofNumber: userCount + 1,
        timestamp: Date.now()
      };

      d.proofs.push(proof);
      delete d.openRooms[user.id];
      saveData(d);

      const logChannelId = settings.Rooms?.proofLogChannelId;
      const logChannel = guild.channels.cache.get(logChannelId);
      if (logChannel && logChannel.type === 'GUILD_TEXT') {
        const e = new MessageEmbed()
          .setTitle(`دليل جديد #${proof.id}`)
          .setDescription(`المستخدم: <@${proof.userId}> • دليل رقم\n ${proof.proofNumber}`)
          .setImage(proof.imageURL)
          .setColor(settings.لون_الامبيد)
          .setTimestamp(proof.timestamp);
        await logChannel.send({ embeds: [e] }).catch(console.error);
      }

      await channel.send('تم استلام الدليل وحفظه. شكراً!').catch(console.error);
      setTimeout(() => channel.delete().catch(() => {}), 5000);
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        delete d.openRooms[user.id];
        saveData(d);
        await channel.send('لم تقم بإرسال صورة خلال الوقت المحدد. سيتم إغلاق الروم الآن.').catch(console.error);
        setTimeout(() => channel.delete().catch(() => {}), 3000);
      }
    });
  }
});
