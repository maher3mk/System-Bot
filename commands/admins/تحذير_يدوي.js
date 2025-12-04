const { MessageEmbed, MessageAttachment, MessageActionRow, MessageSelectMenu } = require('discord.js');
const { client, settings, dbpoint, db } = require('../../index');
const { createEmbed } = require('../../function/function/Embed');
const Roles = require('../../config/Roles');

const RolesSellers = Roles.RolesSellers || [];
// normalize Warn roles object - supports array or object and different key cases
const _rawWarns = Array.isArray(Roles.WarnsRole) ? (Roles.WarnsRole[0] || {}) : (Roles.WarnsRole || {});
const warn25 = _rawWarns.Warn25 || _rawWarns.warn25 || null;
const warn50 = _rawWarns.Warn50 || _rawWarns.warn50 || null;
const warn100 = _rawWarns.Warn100 || _rawWarns.warn100 || null;

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;
  const prefix = settings.prefix || '!';
  if (!message.content.startsWith(`${prefix}تحذير`)) return;

  // permission: Owners or DiscordStaff role
  const owners = Array.isArray(settings.Owners) ? settings.Owners.map(String) : [String(settings.Owners || '')];
  const staffRole = settings?.Admins?.DiscordStaff ? String(settings.Admins.DiscordStaff) : null;
  const isOwner = owners.includes(String(message.author.id));
  const hasStaffRole = staffRole && message.member?.roles?.cache?.some(r => String(r.id) === staffRole || String(r.name) === staffRole);
  if (!isOwner && !hasStaffRole) return message.reply('ليس لديك إذن لاستخدام هذا الأمر.');

  // parse args: !تحذير <user|id> <reason...>
  const parts = message.content.trim().split(/\s+/);
  if (parts.length < 3) return message.reply('الاستخدام: `!تحذير <@المستخدم|ID> <سبب التحذير>` + يجب إرفاق صورة كدليل في نفس الرسالة.');

  const targetArg = parts[1];
  const reason = parts.slice(2).join(' ').trim();
  if (!reason) return message.reply('الرجاء كتابة سبب التحذير.');

  // resolve member
  let targetUser = null;
  if (message.mentions.users.size) targetUser = message.mentions.users.first();
  else {
    try { targetUser = await message.client.users.fetch(targetArg); } catch (e) { targetUser = null; }
  }
  if (!targetUser) return message.reply('لم أتمكن من العثور على المستخدم الهدف، استخدم منشن أو ID صحيح.');

  const guildMember = await message.guild.members.fetch(targetUser.id).catch(()=>null);
  if (!guildMember) return message.reply('المستخدم غير موجود في هذا السيرفر.');

  // require attachment image
  const attachment = message.attachments.first();
  if (!attachment) return message.reply('الصورة مطلوبة كدليل — أضف صورة مرفقة مع الأمر.');
  const url = attachment.url || attachment.proxyURL || '';
  const name = attachment.name || '';
  const contentType = attachment.contentType || attachment.content_type || '';
  const isImage = (contentType && contentType.startsWith('image/')) ||
                  (typeof attachment.width === 'number' && typeof attachment.height === 'number') ||
                  /\.(png|jpe?g|gif|webp|bmp|svg|tiff?)($|\?)/i.test(url) ||
                  /\.(png|jpe?g|gif|webp|bmp|svg|tiff?)($|\?)/i.test(name);
  if (!isImage) return message.reply('الملف المرفق ليس صورة صالحة. الرجاء إرسال صورة PNG/JPG/GIF/WEBP.');

  // prepare the warn embed exactly like the requested template (adapted to message command)
  const warnEmbed = createEmbed({
    interaction: message,
    title: `تحذير جديد`,
    fields: [
      { name: `البائع`, value: `<@${targetUser.id}>`, inline: true },
      { name: `الاداري`, value: `<@${message.author.id}>`, inline: true },
      { name: `التحذير`, value: `${reason}`, inline: true },
      { name: `وقت نشر المنشور`, value: `<t:${Math.floor(message.createdTimestamp / 1000)}:R>`, inline: true },
      { name: `وقت التحذير`, value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
    ]
  });
  // set embed color and footer if not already set
  try { if (!warnEmbed.color) warnEmbed.setColor(settings.لون_الامبيد || '#FF5555'); } catch(e) {}
  try { if (!warnEmbed.footer) warnEmbed.setFooter?.({ text: message.guild.name || '', iconURL: message.guild.iconURL?.({ dynamic: true }) }); } catch(e) {}

  // send to warns channel
  const warnsChannelId = settings?.Rooms?.Warns;
  let warnChannel = null;
  if (warnsChannelId) {
    try { warnChannel = await client.channels.fetch(String(warnsChannelId)); } catch (e) { warnChannel = null; }
  }
  if (!warnChannel || typeof warnChannel.send !== 'function') {
    return message.reply('لم أتمكن من إيجاد قناة التحذيرات (Settings.Rooms.Warns) أو لا أملك صلاحية الإرسال هناك.');
  }

  // attach the image (ensure file name)
  const ext = (require('path').extname(url.split('?')[0]) || '.png').slice(0, 10);
  const filename = `warn-${Date.now()}${ext}`;
  const file = new MessageAttachment(url, filename);

  // send embed and image to log
  const sent = await warnChannel.send({ embeds: [warnEmbed], files: [file], allowedMentions: { users: [] } }).catch(err => {
    console.error('failed to send warn embed', err);
    return null;
  });
  if (!sent) return message.reply('فشل إرسال التحذير في قناة التحذيرات. تأكد من صلاحيات البوت.');



  // بعد إرسال الإمبيد اطبع قائمة للاختيار بين "تحذير" أو "سحب رتبه"
  const actionRow = new MessageActionRow().addComponents(
    new MessageSelectMenu()
      .setCustomId(`manualWarnAction-${Date.now()}`)
      .setPlaceholder('اختر الإجراء لتطبيقه الآن (لديه صورة الدليل موجودة بالفعل)')
      .addOption([
        { label: 'تحذير (ترقية مراحل التحذير)', value: 'apply_warn', description: 'ترقية أو إضافة مراحل تحذير' },
        { label: 'سحب رتبه', value: 'remove_roles', description: 'إزالة رتب البائعين وإعادة ضبط التحذيرات' }
      ])
  );

  // only send the embed & attached image to the log channel; in the current channel send only the action menu (no embed/file)
  const actionMsg = await message.channel.send({
    content: `${message.author}`,
    components: [actionRow],
    allowedMentions: { users: [] }
  });

  const filter = (i) => i.isSelectMenu() && i.user.id === message.author.id && i.customId.startsWith('manualWarnAction-');
  const collector = actionMsg.createMessageComponentCollector({ filter, max: 1, time: 30_000 });

  collector.on('collect', async i => {
    await i.deferReply({ ephemeral: true }).catch(()=>{});
    const choice = i.values[0];
    let penalty = '';

    try {
      if (choice === 'apply_warn') {
        // ترقية مراحل التحذير
        if (warn25 && !guildMember.roles.cache.has(warn25)) {
          await guildMember.roles.add(warn25).catch(()=>{});
          penalty = 'إضافة رتبة تحذير 25';
        } else if (warn25 && guildMember.roles.cache.has(warn25) && !guildMember.roles.cache.has(warn50)) {
          await guildMember.roles.add(warn50).catch(()=>{});
          penalty = 'إضافة رتبة تحذير 50';
        } else if (warn50 && guildMember.roles.cache.has(warn50) && !guildMember.roles.cache.has(warn100)) {
          await guildMember.roles.add(warn100).catch(()=>{});
          penalty = 'إضافة رتبة تحذير 100';
        } else if (warn100 && guildMember.roles.cache.has(warn100)) {
          await guildMember.roles.remove([warn25, warn50, warn100]).catch(()=>{});
          for (const r of RolesSellers) { if (guildMember.roles.cache.has(r)) await guildMember.roles.remove(r).catch(()=>{}); }
          penalty = 'سحب جميع رتب التحذير ورتب البائعين';
        }
      } else if (choice === 'remove_roles') {
        // إزالة كل رتب التحذير و رتب البائع
        await guildMember.roles.remove([warn25, warn50, warn100]).catch(()=>{});
        for (const r of RolesSellers) { if (guildMember.roles.cache.has(r)) await guildMember.roles.remove(r).catch(()=>{}); }
        penalty = 'سحب جميع رتب التحذير ورتب البائعين';
      }
    } catch (err) {
      console.error('apply manual warn action error', err);
    }

    // سجل العملية في DB و عد نقاط الموظف بعد تطبيق الإجراء
    try {
      await db.push('Data_Warns', {
        userid: targetUser.id,
        staff: message.author.id,
        time: `<t:${Math.floor(Date.now()/1000)}:R>`,
        reason,
        warn: (choice === 'apply_warn' ? 'تحذير يدوي' : 'سحب رتبه يدوي'),
        penalty,
        info: message.content,
        image: [url]
      });
    } catch (err) { console.error('db push Data_Warns failed', err); }

    try {
      const DataPoints = await dbpoint.get('Points_Staff');
      const Exit = Array.isArray(DataPoints) ? DataPoints.find(t => t.userid == message.author.id) : null;
      // update or create staff points entry in dbpoint safely
      try {
        const arr = Array.isArray(DataPoints) ? DataPoints : [];
        if (Exit) {
          const idx = arr.findIndex(t => t.userid == message.author.id);
          if (idx >= 0) {
            arr[idx].points = (arr[idx].points || 0) + 1;
            arr[idx].warnings = (arr[idx].warnings || 0) + 1;
            arr[idx].logs = arr[idx].logs || [];
            arr[idx].logs.push({ action: choice, target: targetUser.id, time: Date.now() });
            if (typeof dbpoint.set === 'function') await dbpoint.set('Points_Staff', arr).catch(()=>{});
          } else {
            // fallback: create new
            const newItem = { userid: message.author.id, points: 1, warnings: 1, logs: [{ action: choice, target: targetUser.id, time: Date.now() }] };
            if (typeof dbpoint.push === 'function') await dbpoint.push('Points_Staff', newItem).catch(()=>{});
            else { arr.push(newItem); if (typeof dbpoint.set === 'function') await dbpoint.set('Points_Staff', arr).catch(()=>{}); }
          }
        } else {
          const newItem = { userid: message.author.id, points: 1, warnings: 1, logs: [{ action: choice, target: targetUser.id, time: Date.now() }] };
          if (typeof dbpoint.push === 'function') await dbpoint.push('Points_Staff', newItem).catch(()=>{});
          else { arr.push(newItem); if (typeof dbpoint.set === 'function') await dbpoint.set('Points_Staff', arr).catch(()=>{}); }
        }
      } catch (errInner) {
        console.error('failed updating Points_Staff', errInner);
      }

      // update the log embed with penalty
      try {
        if (sent) {
          await sent.edit({ embeds: [warnEmbed.addFields({ name: 'العقوبة', value: penalty, inline: true })] }).catch(()=>{});
        }
      } catch(e) { /* ignore */ }

      // DM the target user with penalty
      try {
        const dmText = `**لقد تم تحذيرك! \n العضو: <@${targetUser.id}> \n الاداري: <@${message.author.id}> \n السبب: برجاء فتح التكت لمعرفه السبب\n العقوبة: ${penalty}\n مع اطيب التحيات لكم**`;
        await targetUser.send(dmText).catch(()=>{});
        await targetUser.send({ files: [settings.ServerInfo.line] }).catch(()=>{});
      } catch (e) {}

      // confirm to the command user and disable the interactive menu
      try {
        const logLink = sent ? `https://discord.com/channels/${sent.guild.id}/${sent.channel.id}/${sent.id}` : 'تم تسجيل التحذير في قناة اللوق';
        await i.editReply({ embeds: [warnEmbed.setDescription(`لقد تم تحذير البائع ${targetUser.tag} بنجاح ✅\n- ${logLink}`)], components: [] }).catch(()=>{});
      } catch(e) { /* ignore reply errors */ }

      try {
        // disable components so it cannot be used again
        const disabledRow = new MessageActionRow().addComponents(
          new MessageSelectMenu()
            .setCustomId('manualWarnAction-disabled')
            .setPlaceholder('تم تنفيذ الإجراء')
            .setDisabled(true)
        );
        await actionMsg.edit({ components: [disabledRow] }).catch(()=>{});
      } catch (e) { /* ignore */ }
    } catch (err) { console.error('apply manual warn action error', err); }
  });

  collector.on('end', async () => {
    // ensure components are disabled/removed if collector ended without interaction
    try {
      if (!actionMsg.deleted) {
        const disabledRow = new MessageActionRow().addComponents(
          new MessageSelectMenu()
            .setCustomId('manualWarnAction-disabled')
            .setPlaceholder('انتهى وقت الاختيار')
            .setDisabled(true)
        );
        await actionMsg.edit({ components: [disabledRow] }).catch(()=>{});
      }
    } catch (e) { /* ignore */ }
  });
});
