require('dotenv').config();
const { Client, Intents } = require('discord.js');
const chalk = require('chalk');

const client = new Client({
    intents: 0x31feff,
    partials: [
        'MESSAGE',
        'CHANNEL',
        'REACTION',
        'USER',
        'GUILD_MEMBER'
    ],
    allowedMentions: {
        parse: ['roles', 'users', 'everyone'],
        repliedUser: true
    }
});

client.setMaxListeners(100);

// --- حل جذري لمنع إضافة listeners مكرّرة (يحمي من تسجيل نفس الأحداث عدة مرات) ---
// نقوم بتغليف client.on / client.once بحيث نتعرف على handlers مكررة (حسب نص الدالة)
const _on = client.on.bind(client);
const _once = client.once.bind(client);
const _addedHandlers = new Set();
client.on = (event, handler) => {
  try {
    const sig = event + '::' + (handler && handler.toString ? handler.toString().slice(0, 700) : String(handler));
    if (_addedHandlers.has(sig)) return client;
    _addedHandlers.add(sig);
  } catch { /* ignore hashing issues */ }
  return _on(event, handler);
};
client.once = (event, handler) => {
  try {
    const sig = event + '::once::' + (handler && handler.toString ? handler.toString().slice(0, 700) : String(handler));
    if (_addedHandlers.has(sig)) return client;
    _addedHandlers.add(sig);
  } catch { /* ignore */ }
  return _once(event, handler);
};
// --- نهاية الحل الجذري ---

const { CommandCooldown, msToMinutes } = require('discord-command-cooldown');
const ms = require('ms');
const paypal = require('paypal-rest-sdk');
const { Database, MongoDriver, JSONDriver } = require('st.db');

const options = { driver: new JSONDriver('./database/database.json') };
const options2 = { driver: new JSONDriver('./database/Tickets.json') };
const options3 = { driver: new JSONDriver('./database/TicketCount.json') };
const options4 = { driver: new JSONDriver('./database/Points.json') };
const options5 = { driver: new JSONDriver('./database/ClosedTicket.json') };
const db = new Database(options);
const dbTickets = new Database(options2);
const TC = new Database(options3);
const dbpoint = new Database(options4);
const dbCloseTicket = new Database(options5);
const privateSPath = require('./data/privateS.json');
const settings = require('./config/settings.js');
const app = require('./function/Express.js')(settings.port, chalk);
const prefix = settings.prefix;

module.exports = {
  app,
  client,
  db,
  prefix,
  dbpoint,
  dbCloseTicket,
  dbTickets,
  TC,
  settings
};

// جهّز البوت/الأوامر مرة واحدة فقط لتجنّب تسجيل مستمعين مكرّرين
if (!global.__initDone) {
	require('./function/function/ready.js')(client, chalk);
	const initializeCommands = require('./function/commands.js');
	initializeCommands();

	// حمل معالج أمر !log-create إن وجد — مرّر client
	try {
		const setupLog = require('./commands/log/setup.js');
		if (typeof setupLog === 'function') setupLog(client);
	} catch (e) {
		// silent — لا نطبع شيئًا هنا حسب رغبتك
	}

	global.__initDone = true;
}

app.set('views', './views');
app.set('view engine', 'ejs');

const logAndReturn = (error) => console.log(error);
process.on('unhandledRejection', logAndReturn);
process.on('uncaughtException', logAndReturn);
process.on('multipleResolves', (type, promise, reason) => {
});
process.on('uncaughtExceptionMonitor', logAndReturn);
require('./commands/public/proofs.js');
require('./commands/public/grab-role.js');
client.login(process.env.token);