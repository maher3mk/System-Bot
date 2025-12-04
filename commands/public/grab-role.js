const fs = require('fs');
const path = require('path');
const { client, settings } = require('../../index.js');
const rolesConfig = require('../../config/Roles.js');

const assignedPath = path.join(__dirname, '..', '..', 'data', 'assignedRoles.json');

function loadAssigned() {
  if (!fs.existsSync(assignedPath)) return {};
  try { return JSON.parse(fs.readFileSync(assignedPath, 'utf8')) || {}; } catch { return {}; }
}
function saveAssigned(data) {
  fs.writeFileSync(assignedPath, JSON.stringify(data, null, 2), 'utf8');
}

// command: !grab-role
client.on('messageCreate', async (msg) => {
  if (msg.author.bot || !msg.guild) return;
  const p = settings.prefix || '!';
  if (msg.content !== `${p}grab-role` && msg.content !== `${p}get-role`) return;

  const assigned = loadAssigned();
  const userId = String(msg.author.id);

  // user already assigned?
  if (assigned[userId]) {
    return msg.reply(`لقد حصلت على رتبة مسبقًا: <@&${assigned[userId]}> — لا يمكنك الحصول على رتبة أخرى.`);
  }

  // roles pool from config
  const pool = Array.isArray(rolesConfig.RolesSellers) ? rolesConfig.RolesSellers.filter(Boolean) : [];
  if (pool.length === 0) return msg.reply('قائمة الرتب غير مُهيئة على السيرفر.');

  // exclude already taken roles (any value in assigned)
  const taken = new Set(Object.values(assigned).map(String));
  const available = pool.filter(r => !taken.has(String(r)));

  if (available.length === 0) return msg.reply('لا توجد رتب متاحة حالياً — كل الرتب أُخذت.');

  // choose random role
  const chosenId = available[Math.floor(Math.random() * available.length)];

  // ensure role exists on guild
  const role = msg.guild.roles.cache.get(String(chosenId));
  if (!role) {
    // role not present on this server — remove from pool logically and retry next time
    // mark it taken so it won't block others
    assigned['__invalid__' + chosenId] = chosenId;
    saveAssigned(assigned);
    return msg.reply('الرتبة المختارة غير موجودة في هذا السيرفر، حاول الأمر مرة أخرى.');
  }

  // try to add role
  try {
    const member = msg.member;
    await member.roles.add(role, 'Random role grab - one-time assignment');
    assigned[userId] = String(chosenId);
    saveAssigned(assigned);

    return msg.reply(`حصلت بنجاح على رتبة عشوائية: <@&${chosenId}> — مبروك!`);
  } catch (err) {
    console.error('Failed to assign role:', err);
    return msg.reply('فشل إعطاء الرتبة — لا أملك صلاحيات أو حدث خطأ. تحقق من صلاحيات البوت.');
  }
});
