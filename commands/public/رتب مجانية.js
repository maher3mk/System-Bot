const fs = require('fs');
const path = require('path');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { client, settings } = require('../../index');
const rolesConfig = require('../../config/Roles.js');

const dataPath = path.join(__dirname, '..', '..', 'data', 'rolesData.json'); // persistent storage for assignments
function loadData() {
  if (!fs.existsSync(dataPath)) return { assigned: {}, takenRoles: {}, count: 0, lastReceiver: null };
  try { return JSON.parse(fs.readFileSync(dataPath, 'utf8')); } catch { return { assigned: {}, takenRoles: {}, count: 0, lastReceiver: null }; }
}
function saveData(d) { fs.writeFileSync(dataPath, JSON.stringify(d, null, 2), 'utf8'); }

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getRolesPool() {
  // Prefer RolesSellers if provided, else fallback to Roles
  const raw = Array.isArray(rolesConfig.RolesSellers) && rolesConfig.RolesSellers.filter(Boolean).length
    ? rolesConfig.RolesSellers
    : rolesConfig.Roles;
  return raw
    .map(r => (typeof r === 'string' ? r : String(r.roleID)))
    .filter(Boolean);
}

// setup command (Owners or admin role)
client.on('messageCreate', async (msg) => {
  if (msg.author.bot || !msg.guild) return;
  const p = settings.prefix || '!';
  if (msg.content !== `${p}setup-roles`) return;

  const owners = Array.isArray(settings.Owners) ? settings.Owners.map(String) : [String(settings.Owners || '')];
  const adminRole = settings && settings.Admins && settings.Admins.DiscordLeder ? String(settings.Admins.DiscordLeder) : null;
  const isOwner = owners.includes(String(msg.author.id));
  const hasAdmin = adminRole && msg.member?.roles?.cache?.some(r => String(r.id) === adminRole || String(r.name) === adminRole);
  if (!isOwner && !hasAdmin) return msg.reply('ليس لديك إذن لاستخدام هذا الأمر.');

  const pool = getRolesPool();
  if (pool.length === 0) return msg.channel.send('قائمة الرتب فارغة في config/Roles.js');

  const d = loadData();
  const lastNameField = d.lastReceiver
    ? (await msg.guild.members.fetch(d.lastReceiver).catch(()=>({ user:{ username: 'غير معروف' } }))).user.username
    : 'لا أحد بعد';
  const embed = new MessageEmbed()
    .setTitle('🎁 سحب رتب عشوائي - مرة واحدة لكل شخص')
    .setDescription('اضغط الزر للحصول على رتبة عشوائية. كل مستخدم يمكنه الحصول على رتبة مرة واحدة فقط.')
    .addFields(
      { name: 'عدد المتسلمين', value: String(d.count || 0), inline: true },
      { name: 'آخر من استلم', value: lastNameField, inline: true }
    )
    .setColor(settings.لون_الامبيد || '#00AAFF')
    .setFooter({ text: msg.guild.name || '', iconURL: msg.guild.iconURL({ dynamic: true }) })
    .setTimestamp();

  const row = new MessageActionRow().addComponents(
    new MessageButton().setCustomId('claim_random_role').setLabel('احصل على رتبة').setStyle('PRIMARY')
  );

  await msg.channel.send({ embeds: [embed], components: [row] });
});

// handle button press
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== 'claim_random_role') return;

  const guild = interaction.guild;
  if (!guild) return interaction.reply({ ephemeral: true, content: 'هذا الأمر يعمل داخل السيرفر فقط.' });

  const userId = String(interaction.user.id);
  const d = loadData();

  if (d.assigned && d.assigned[userId]) {
    return interaction.reply({ ephemeral: true, content: `أنت حصلت على رتبة بالفعل: <@&${d.assigned[userId]}>` });
  }

  const pool = getRolesPool();
  const available = pool.filter(rid => !(d.takenRoles && d.takenRoles[rid]));
  if (available.length === 0) {
    // update embed counts if possible then inform
    try {
      const msg = interaction.message;
      const ed = msg.embeds && msg.embeds[0] ? msg.embeds[0] : null;
      if (ed) {
        const lastName = d.lastReceiver
          ? (await interaction.guild.members.fetch(d.lastReceiver).catch(()=>({ user:{ username: 'غير معروف' } }))).user.username
          : 'لا أحد بعد';
        const updated = new MessageEmbed(ed)
          .setColor(settings.لون_الامبيد || '#00AAFF')
          .setFields(
            { name: 'عدد المتسلمين', value: String(d.count || 0), inline: true },
            { name: 'آخر من استلم', value: lastName, inline: true }
          );
        await msg.edit({ embeds: [updated] }).catch(()=>{});
      }
    } catch (e) {}
    return interaction.reply({ ephemeral: true, content: 'عذراً، لا توجد رتب متاحة الآن.' });
  }

  // choose: pick randomly by shuffling then taking first available
  const chosenRoleId = shuffle(available)[0];
  const role = guild.roles.cache.get(String(chosenRoleId));
  if (!role) {
    d.takenRoles = d.takenRoles || {};
    d.takenRoles[chosenRoleId] = 'invalid';
    saveData(d);
    return interaction.reply({ ephemeral: true, content: 'الرتبة المختارة غير موجودة في هذا السيرفر حالياً. المحاولة لاحقًا.' });
  }

  try {
    const member = await guild.members.fetch(userId);
    const botMember = await guild.members.fetch(client.user.id);
    if (!botMember.permissions.has('MANAGE_ROLES')) {
      return interaction.reply({ ephemeral: true, content: 'لا أملك صلاحية Manage Roles لإعطاء الرتب.' });
    }
    if (role.position >= botMember.roles.highest.position) {
      return interaction.reply({ ephemeral: true, content: 'لا أستطيع إعطاء هذه الرتبة لأن رتبة البوت ليست أعلى.' });
    }
    await member.roles.add(role, 'Random one-time assignment');
  } catch (err) {
    console.error('assign role error', err);
    return interaction.reply({ ephemeral: true, content: 'فشل إعطاء الرتبة — تأكد من صلاحيات البوت.' });
  }

  // save
  d.assigned = d.assigned || {};
  d.takenRoles = d.takenRoles || {};
  d.assigned[userId] = String(chosenRoleId);
  d.takenRoles[String(chosenRoleId)] = userId;
  d.count = (d.count || 0) + 1;
  d.lastReceiver = userId; // persisted into rolesData.json
  saveData(d);

  // update original embed message fields
  try {
    const msg = interaction.message;
    const ed = msg.embeds && msg.embeds[0] ? msg.embeds[0] : null;
    if (ed) {
      const lastName = d.lastReceiver
        ? (await interaction.guild.members.fetch(d.lastReceiver).catch(()=>({ user:{ username: 'غير معروف' } }))).user.username
        : 'لا أحد بعد';
      const updated = new MessageEmbed(ed)
        .setColor(settings.لون_الامبيد || '#00AAFF')
        .setFields(
          { name: 'عدد المتسلمين', value: String(d.count || 0), inline: true },
          { name: 'آخر من استلم', value: lastName, inline: true }
        );
      await msg.edit({ embeds: [updated] }).catch(()=>{});
    }
  } catch (e) {
    console.error('failed edit embed', e);
  }

  // reply only ephemeral to user (no public notification)
  return interaction.reply({ ephemeral: true, content: `✅ تم إعطاؤك رتبة: <@&${chosenRoleId}>` });
});
