

const { Client, Intents, MessageEmbed, MessageActionRow, MessageButton, Permissions } = require('discord.js');
const fs = require('fs');
const { client, db, dbTickets, settings } = require('../../index');
const { createEmbed } = require('../../function/function/Embed');
const checkCredits = require('../../function/function/checkCredits');
const Config = require('../../config/prices');
const schedule = require('node-schedule');
const config = require('../../config/prices');
const path = require('path');
const privateSPath = path.join(__dirname, '../../data/privateS.json');


client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.member.roles.cache.has(settings.Admins.DiscordLeder)) return

    const args = message.content.split(" ");
    const command = args.shift().toLowerCase();

    if (command === settings.prefix + "sub") {
        const user = message.mentions.users.first();
        const durationString = args.slice(1).join(" ");

        if (!user || !durationString) {
            await message.reply("❌ **يرجى استخدام الأمر بالشكل الصحيح: `!sub @منشن 7d`**");
            return;
        }

        let duration = 0;
        const regex = /(\d+)([dDmMyy]|يوم|شهر|سنة)/g;
        let match;

        while ((match = regex.exec(durationString)) !== null) {
            const value = parseInt(match[1]);
            const unit = match[2].toLowerCase();

            switch (unit) {
                case 'd':
                case 'يوم':
                    duration += value * 24 * 60 * 60 * 1000;
                    break;
                case 'm':
                case 'شهر':
                    duration += value * 30 * 24 * 60 * 60 * 1000;
                    break;
                case 'y':
                case 'سنة':
                    duration += value * 365 * 24 * 60 * 60 * 1000;
                    break;
            }
        }

        if (duration <= 0) {
            await message.channel.send({ content: "❌ **يرجى تحديد مدة صالحة.**" });
            return;
        }

        const chname = user.username;
        const channelName = `✧・${chname}`;
        const creationTime = Date.now();
        const expirationTime = creationTime + duration;

        try {
            const privateSRoom = await message.guild.channels.create(channelName, {
                type: 'GUILD_TEXT',
                parent: settings.Rooms.CeatogryPrivteRooms,
                rateLimitPerUser: 3600,
                permissionOverwrites: [
                    {
                        id: message.guild.roles.everyone.id,
                        allow: [Permissions.FLAGS.VIEW_CHANNEL],
                        deny: [Permissions.FLAGS.SEND_MESSAGES]
                    },
                    {
                        id: user.id,
                        allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.ATTACH_FILES]
                    },
                ],
            });

            const embed = new MessageEmbed()
                .setTitle("- Private S Room")
                .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
                .setColor(settings.EmbedColor)
                .setFooter(user.username, user.displayAvatarURL({ dynamic: true, size: 1024 }))
                .setDescription(`**Owner : ${user}
                     Ends in : <t:${Math.floor(expirationTime / 1000)}:R>
                    
                    - Created Date: <t:${Math.floor(creationTime / 1000)}:F>
                    - End Date: <t:${Math.floor(expirationTime / 1000)}:F>**`);
                    

            const changenamebtn = new MessageButton()
                .setCustomId(`change_${message.author.id}`)
                .setLabel("Change Name")
                .setStyle("SECONDARY");

            const buttons = new MessageActionRow().addComponents(changenamebtn);

            if (privateSRoom) {
                await privateSRoom.send({ embeds: [embed], components: [buttons] });
            }

            await message.channel.send({ content: `✅ **تم إرسال أنشاء الروم بنجاح : ${privateSRoom}
<@${user.id}>**` });

            let privateSData = {};

            if (fs.existsSync(privateSPath)) {
                privateSData = JSON.parse(fs.readFileSync(privateSPath, 'utf8'));
            }

            privateSData[user.id] = {
                userId: user.id,
                roomId: privateSRoom.id,
                roomName: channelName,
                isOpen: true,
                createdAt: creationTime,
                expiresAt: expirationTime
            };

            fs.writeFileSync(privateSPath, JSON.stringify(privateSData, null, 4));

        } catch (error) {
            console.error("Error creating private room:", error);
            await message.channel.send({ content: "❌ **حدث خطأ أثناء إنشاء الروم الخاص.**" });
        }
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
