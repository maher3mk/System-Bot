const { Intents, Collection, Client, GuildMember, MessageActionRow, WebhookClient,MessagePayload, GatewayIntentBits, MessageSelectMenu, Modal, MessageEmbed,MessageButton, MessageAttachment, Permissions, TextInputComponent} = require('discord.js');
const { client, db , dbTickets,dbCloseTicket ,  settings} = require('../../index');
const discordTranscripts = require('discord-html-transcripts');
const { default: chalk } = require('chalk');

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;
    if (interaction.customId == 'CloseTicket') {

        if (!interaction.member.roles.cache.has(settings.Admins.DiscordStaff)) return;

        await interaction.reply({ content: `**جاري حذف التذكرة | ✅**` });

        const transcript = await discordTranscripts.createTranscript(interaction.channel, {
            limit: -1,
            returnType: 'attachment',
            fileName: `${interaction.channel.name}.html`,
            minify: true,
            saveImages: true,
            useCDN: false,
        });

        const transcriptChannel = await client.channels.fetch(settings.Rooms.LogTranscreipt);
        await interaction.editReply({ content: `**جاري انشاء الترانسكريبت |📜**` });

        const msg = await transcriptChannel.send({ files: [transcript] });
        await transcriptChannel.send({ content: `Room ID: ${interaction.channel.id}\nRoom Name: ${interaction.channel.name}\nTime: <t:${Math.floor(Date.now() / 1000)}:R>\n[View Transcript](https://mahto.id/chat-exporter?url=${msg.attachments.first().url})` });

        try {
            const DataTicket = await dbTickets.get('Tickets_Support');
            const DataTicket2 = await dbTickets.get('Tickets_Tashher');
            const DataTicket3 = await dbTickets.get('Tickets_Mzad');
            const DataTicket4 = await dbTickets.get('Tickets_complaints');
            const DataTicket5 = await dbTickets.get('Tickets_Spin');
            const DataTicket6 = await dbTickets.get('Tickets_waset1');
            const DataTicket7 = await dbTickets.get('Tickets_waset2');
            const DataTicket8 = await dbTickets.get('Tickets_waset3');
            const DataTicket9 = await dbTickets.get('Tickets_waset4');
            const DataTicket10 = await dbTickets.get('Tickets_waset5');



            const E = await DataTicket?.find((t) => t.Ticket == interaction.channel.id);
            if (E) {
                E.type = 'close';
                E.transcrept = `https://mahto.id/chat-exporter?url=${msg.attachments.first().url}`;
                await dbCloseTicket.push('Tickets_Support', E); // نقل البيانات إلى dbCloseTicket
                await dbTickets.set(`Tickets_Support`, DataTicket2.filter(t => t.Ticket !== interaction.channel.id));

            }

            const E2 = await DataTicket2?.find((t) => t.Ticket == interaction.channel.id);
            if (E2) {
                E2.type = 'close';
                E2.transcrept = `https://mahto.id/chat-exporter?url=${msg.attachments.first().url}`;
                await dbCloseTicket.push('Tickets_Tashher', E2); // نقل البيانات إلى dbCloseTicket
                await dbTickets.set(`Tickets_Tashher`, DataTicket2.filter(t => t.Ticket !== interaction.channel.id));
            }

            const E3 = await DataTicket3?.find((t) => t.Ticket == interaction.channel.id);
            if (E3) {
                E3.type = 'close';
                E3.transcrept = `https://mahto.id/chat-exporter?url=${msg.attachments.first().url}`;
                await dbCloseTicket.push('Tickets_Mzad', E3); // نقل البيانات إلى dbCloseTicket
                await dbTickets.set(`Tickets_Mzad`, DataTicket3.filter(t => t.Ticket !== interaction.channel.id));
            }

            const E4 = await DataTicket4?.find((t) => t.Ticket == interaction.channel.id);
            if (E4) {
                E4.type = 'close';
                E4.transcrept = `https://mahto.id/chat-exporter?url=${msg.attachments.first().url}`;
                await dbCloseTicket.push('Tickets_complaints', E4); // نقل البيانات إلى dbCloseTicket
                await dbTickets.set(`Tickets_complaints`, DataTicket4.filter(t => t.Ticket !== interaction.channel.id));
            }
            const E5 = await DataTicket5?.find((t) => t.Ticket == interaction.channel.id);
            if (E5) {
                E5.type = 'close';
                E5.transcrept = `https://mahto.id/chat-exporter?url=${msg.attachments.first().url}`;
                await dbCloseTicket.push('Tickets_Spin', E5); // نقل البيانات إلى dbCloseTicket
                await dbTickets.set(`Tickets_Spin`, DataTicket5.filter(t => t.Ticket !== interaction.channel.id));
            }
            const E6 = await DataTicket5?.find((t) => t.Ticket == interaction.channel.id);
            if (E6) {
                E6.type = 'close';
                E6.transcrept = `https://mahto.id/chat-exporter?url=${msg.attachments.first().url}`;
                await dbCloseTicket.push('Tickets_Waset', E6); // نقل البيانات إلى dbCloseTicket
                await dbTickets.set(`Tickets_waset1`, DataTicket6.filter(t => t.Ticket !== interaction.channel.id));
            }
            const E7 = await DataTicket5?.find((t) => t.Ticket == interaction.channel.id);
            if (E7) {
                E7.type = 'close';
                E7.transcrept = `https://mahto.id/chat-exporter?url=${msg.attachments.first().url}`;
                await dbCloseTicket.push('Tickets_Waset', E7); // نقل البيانات إلى dbCloseTicket
                await dbTickets.set(`Tickets_waset2`, DataTicket7.filter(t => t.Ticket !== interaction.channel.id));
            }
            const E8 = await DataTicket5?.find((t) => t.Ticket == interaction.channel.id);
            if (E8) {
                E8.type = 'close';
                E8.transcrept = `https://mahto.id/chat-exporter?url=${msg.attachments.first().url}`;
                await dbCloseTicket.push('Tickets_Waset', E8); // نقل البيانات إلى dbCloseTicket
                await dbTickets.set(`Tickets_waset3`, DataTicket8.filter(t => t.Ticket !== interaction.channel.id));
            }
            const E9 = await DataTicket5?.find((t) => t.Ticket == interaction.channel.id);
            if (E9) {
                E9.type = 'close';
                E9.transcrept = `https://mahto.id/chat-exporter?url=${msg.attachments.first().url}`;
                await dbCloseTicket.push('Tickets_Waset', E9); // نقل البيانات إلى dbCloseTicket
                await dbTickets.set(`Tickets_waset4`, DataTicket9.filter(t => t.Ticket !== interaction.channel.id));
            }
            const E10 = await DataTicket5?.find((t) => t.Ticket == interaction.channel.id);
            if (E10) {
                E10.type = 'close';
                E10.transcrept = `https://mahto.id/chat-exporter?url=${msg.attachments.first().url}`;
                await dbCloseTicket.push('Tickets_Waset', E10); // نقل البيانات إلى dbCloseTicket
                await dbTickets.set(`Tickets_waset5`, DataTicket10.filter(t => t.Ticket !== interaction.channel.id));
            }


            await interaction.editReply({ content: `**تم حفظ الترانسكريبت وحذف التذكرة |✨**` });

            setTimeout(() => {
                interaction.channel.delete();
            }, 2000);
        } catch (err) {
            console.log(chalk.red(err))
        }
    }
});


client.on('channelDelete', async channel => {
    const DataTicket = await dbTickets.get('Tickets_Support');
    const DataTicket2 = await dbTickets.get('Tickets_Tashher');
    const DataTicket3 = await dbTickets.get('Tickets_Mzad');
    const DataTicket4 = await dbTickets.get('Tickets_complaints');
    const DataTicket5 = await dbTickets.get('Tickets_Spin');
    const DataTicket6 = await dbTickets.get('Tickets_waset1');
    const DataTicket7 = await dbTickets.get('Tickets_waset2');
    const DataTicket8 = await dbTickets.get('Tickets_waset3');
    const DataTicket9 = await dbTickets.get('Tickets_waset4');
    const DataTicket10 = await dbTickets.get('Tickets_waset5');

    const E = await DataTicket?.find((t) => t.Ticket == channel.id);
    const E2 = await DataTicket2?.find((t) => t.Ticket == channel.id);
    const E3 = await DataTicket3?.find((t) => t.Ticket == channel.id);
    const E4 = await DataTicket4?.find((t) => t.Ticket == channel.id);
    const E5 = await DataTicket5?.find((t) => t.Ticket == channel.id);
    const E6 = await DataTicket6?.find((t) => t.Ticket == channel.id);
    const E7 = await DataTicket7?.find((t) => t.Ticket == channel.id);  
    const E8 = await DataTicket8?.find((t) => t.Ticket == channel.id);
    const E9 = await DataTicket9?.find((t) => t.Ticket == channel.id);
    const E10 = await DataTicket10?.find((t) => t.Ticket == channel.id);


    const channelCheck = await client.channels.fetch(channel.id).catch(() => null);
    if (!channelCheck) {
        console.log(`❌ القناة غير موجودة أو تم حذفها: ${channel.id}`);
        return;
    }
    if (E || E2 || E3 || E4 || E5 || E6 || E7 || E8 || E9 || E10) {
        const transcript = await discordTranscripts.createTranscript(channel, {
            limit: -1,
            returnType: 'attachment',
            fileName: `${channel.name}.html`,
            minify: true,
            saveImages: true,
            useCDN: false,
        });

        const transcriptChannel = await client.channels.fetch(settings.Rooms.LogTranscreipt);

        
        const msg = await transcriptChannel.send({ files: [transcript] });
        await transcriptChannel.send({ content: `Room ID: ${channel.id}\nRoom Name: ${channel.name}\nTime: <t:${Math.floor(Date.now() / 1000)}:R>\n[View Transcript](https://mahto.id/chat-exporter?url=${msg.attachments.first().url})` });

        if (E) {
            E.type = 'close';
            E.transcrept = `https://mahto.id/chat-exporter?url=${msg.attachments.first().url}`;
            await dbCloseTicket.push('Tickets_Support', E); 
            await dbTickets.delete('Tickets_Support', E); 
        }
        if (E2) {
            E2.type = 'close';
            E2.transcrept = `https://mahto.id/chat-exporter?url=${msg.attachments.first().url}`;
            await dbCloseTicket.push('Tickets_Tashher', E2); // نقل البيانات إلى dbCloseTicket
            await dbTickets.delete('Tickets_Tashher', E2); // حذف التذكرة من dbTickets
        }
        if (E3) {
            E3.type = 'close';
            E3.transcrept = `https://mahto.id/chat-exporter?url=${msg.attachments.first().url}`;
            await dbCloseTicket.push('Tickets_Mzad', E3); // نقل البيانات إلى dbCloseTicket
            await dbTickets.delete('Tickets_Mzad', E3)  // حذف التذكرة من dbTickets
        }
        if (E4) {
            E4.type = 'close';
            E4.transcrept = `https://mahto.id/chat-exporter?url=${msg.attachments.first().url}`;
            await dbCloseTicket.push('Tickets_complaints', E4); // نقل البيانات إلى dbCloseTicket
            await dbTickets.delete('Tickets_complaints', E4)  // حذف التذكرة من dbTickets
        }
        if (E5) {
            E5.type = 'close';
            E5.transcrept = `https://mahto.id/chat-exporter?url=${msg.attachments.first().url}`;
            await dbCloseTicket.push('Tickets_Spin', E5); // نقل البيانات إلى dbCloseTicket
            await dbTickets.delete('Tickets_Spin', E5)  // حذف التذكرة من dbTickets
        }
        if (E6) {
            E6.type = 'close';
            E6.transcrept = `https://mahto.id/chat-exporter?url=${msg.attachments.first().url}`;
            await dbCloseTicket.push('Tickets_Waset', E6); // نقل البيانات إلى dbCloseTicket
            await dbTickets.delete('Tickets_waset1', E6)  // حذف التذكرة من dbTickets
        }
        if (E7) {
            E7.type = 'close';
            E7.transcrept = `https://mahto.id/chat-exporter?url=${msg.attachments.first().url}`;
            await dbCloseTicket.push('Tickets_Waset', E7); // نقل البيانات إلى dbCloseTicket
            await dbTickets.delete('Tickets_waset2', E7)  // حذف التذكرة من dbTickets
        }
        if (E8) {
            E8.type = 'close';
            E8.transcrept = `https://mahto.id/chat-exporter?url=${msg.attachments.first().url}`;
            await dbCloseTicket.push('Tickets_Waset', E8); // نقل البيانات إلى dbCloseTicket
            await dbTickets.delete('Tickets_waset3', E8)  // حذف التذكرة من dbTickets
        }
        if (E9) {
            E9.type = 'close';
            E9.transcrept = `https://mahto.id/chat-exporter?url=${msg.attachments.first().url}`;
            await dbCloseTicket.push('Tickets_Waset', E9); // نقل البيانات إلى dbCloseTicket
            await dbTickets.delete('Tickets_waset4', E9)  // حذف التذكرة من dbTickets
        }
        if (E10) {
            E10.type = 'close';
            E10.transcrept = `https://mahto.id/chat-exporter?url=${msg.attachments.first().url}`;
            await dbCloseTicket.push('Tickets_Waset', E10); // نقل البيانات إلى dbCloseTicket
            await dbTickets.delete('Tickets_waset5', E10)  // حذف التذكرة من dbTickets
        }
        
    }
});