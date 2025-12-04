const { Client, GatewayIntentBits, MessageActionRow, Modal, TextInputComponent, MessageEmbed, Permissions, MessageButton } = require('discord.js');
const { client, db, settings } = require('../../index');
const config = require('../../config/settings'); 
const fs = require('fs');
const path = require('path');

const scamDBPath = path.join(__dirname, '../../database/scamdb.json'); 

client.on('messageCreate', async message => {
    if (!message.content.startsWith('$') || message.author.bot) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const user = message.mentions.users.first() || message.guild.members.cache.get(args[0]);

    if (command === 'check') {
        if (!user) {
            return message.channel.send("برجاء منشن الشخص او وضع الايدي");
        }
    
        const userID = user.id;
        const scamDB = JSON.parse(fs.readFileSync(scamDBPath, 'utf8'));
        const report = scamDB.find(entry => entry.scammerID === userID);

        const embed = new MessageEmbed()
            .setTitle('فحص النصاب')
            .setColor(report ? 'RED' : 'GREEN')
            .setDescription(report 
                ? `**⚠️ هذا الشخص نصاب!**\n\n- **اسم النصاب:** ${user.tag}\n- **ID النصاب:** ${userID} \n\n- **برجاء عدم التعامل معه!**`
                : `**✅ هذا الشخص ليس نصاباً!**\n\n- **اسم المستخدم:** ${user.tag}\n- **ID المستخدم:** ${userID} \n\n- **ولاك هذا لا يعني انه مضمون!**`
            )
            .setThumbnail(user.displayAvatarURL());
    
        message.channel.send({ embeds: [embed] });
    }
    
    if (command === 'remove') {
        if (!user) {
            return message.channel.send("برجاء منشن الشخص او وضع الايدي");
        }
    
        if (!message.member.roles.cache.has(config.Admins.DiscordLeder)) {
            return message.channel.send("ليس لديك الصلاحيات اللازمة لرفع البلاغ.");
        }
    
        const reason = args.slice(1).join(' ');
        if (!reason) {
            return message.channel.send("برجاء تقديم سبب لإزالة النصاب.");
        }
    
        const userID = user.id;
    
        const scamDB = JSON.parse(fs.readFileSync(scamDBPath, 'utf8'));
        const index = scamDB.findIndex(entry => entry.scammerID === userID);
    
        if (index === -1) {
            return message.channel.send("هذا الشخص ليس في قائمة النصابين.");
        }
    
        scamDB.splice(index, 1);
        fs.writeFileSync(scamDBPath, JSON.stringify(scamDB, null, 2), 'utf8');
    
        const roleID = config.ReportSettings.ScammerRoleID; 
        if (roleID) {
            const role = message.guild.roles.cache.get(roleID);
            if (role) {
                const member = message.guild.members.cache.get(userID);
                if (member) {
                    await member.roles.remove(role);
                } else {
                    console.error('لم يتم العثور على العضو.');
                }
            } else {
                console.error('لم يتم العثور على الدور.');
            }
        } else {
            console.error('لم يتم العثور على ID الدور في ملف الإعدادات.');
        }
    
        const embed = new MessageEmbed()
            .setTitle('تمت إزالة النصاب')
            .setColor('GREEN')
            .setDescription(`**تمت إزالة النصاب بنجاح!**\n\n- **اسم النصاب:** ${user.tag}\n- **ID النصاب:** ${userID}`)
            .setThumbnail(user.displayAvatarURL());
    
        message.channel.send({ embeds: [embed] });

        const logChannel = message.guild.channels.cache.get(config.Rooms.Logscammers);
        if (logChannel) {
            const logEmbed = new MessageEmbed()
                .setTitle('سجل إزالة نصاب')
                .setColor('RED')
                .setDescription(`**النصاب:** ${user.tag} (\`${userID}\`)\n- **المسؤول عن الإزالة:** ${message.author.tag}\n- **سبب الإزالة:** ${reason}`)
                .setThumbnail(message.author.displayAvatarURL())
                .setTimestamp();
    
            await logChannel.send({ embeds: [logEmbed] });
        } else {
            console.error('لم يتم العثور على قناة السجل.');
        }
    }
});
