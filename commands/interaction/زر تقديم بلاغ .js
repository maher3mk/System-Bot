const { Client, GatewayIntentBits, MessageActionRow, Modal, TextInputComponent, MessageEmbed, Permissions, MessageButton } = require('discord.js');
const { client, db, settings } = require('../../index');
const config = require('../../config/settings');  
const { createEmbed } = require('../../function/function/Embed');
const fs = require('fs');
const path = require('path');

const scamDBPath = path.join(__dirname, '../../database/scamdb.json');  

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'Apply_Blag') {
        const modal = new Modal()
            .setCustomId('blagModal')
            .setTitle('تقديم بلاغ عن نصاب');

        const scammerID = new TextInputComponent()
            .setCustomId('scammerID')
            .setLabel("ايدي النصاب")
            .setPlaceholder("حط هنا ايدي النصاب وليس يوزره")
            .setStyle('SHORT');

        const MansubID = new TextInputComponent()
            .setCustomId('MansubID')
            .setLabel("ايدي المنصوب عليه")
            .setPlaceholder("حط هنا ايدي المنصوب عليه وليس يوزره")
            .setStyle('SHORT');

        const story = new TextInputComponent()
            .setCustomId('story')
            .setLabel("القصة")
            .setPlaceholder("حط القصة هنا")
            .setStyle('PARAGRAPH');

        const amount = new TextInputComponent()
            .setCustomId('amount')
            .setLabel("المبلغ")
            .setPlaceholder("حط المبلغ الي نصب عليك فيه")
            .setStyle('SHORT');

        const Item = new TextInputComponent()
            .setCustomId('Item')
            .setLabel("السلعة")
            .setPlaceholder("حط المنتج الي نصب عليك فيه")
            .setStyle('SHORT');

        const firstActionRow = new MessageActionRow().addComponents(scammerID);
        const firstActionRow2 = new MessageActionRow().addComponents(MansubID);
        const secondActionRow = new MessageActionRow().addComponents(story);
        const thirdActionRow = new MessageActionRow().addComponents(amount);
        const thirdActionRow2 = new MessageActionRow().addComponents(Item);

        modal.addComponents(firstActionRow, firstActionRow2, secondActionRow, thirdActionRow, thirdActionRow2);

        await interaction.showModal(modal);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId === 'blagModal') {
        const scammerID = interaction.fields.getTextInputValue('scammerID');
        const MansubID = interaction.fields.getTextInputValue('MansubID');
        const story = interaction.fields.getTextInputValue('story');
        const amount = interaction.fields.getTextInputValue('amount');
        const Item = interaction.fields.getTextInputValue('Item');

        const embed = createEmbed({
            interaction: interaction,
            title: 'بلاغ على نصاب',
            color: settings.لون_الامبيد,
            description: `**
- النصاب: <@${scammerID}> | (\`${scammerID}\`)
- المنصوب: <@${MansubID}> | (\`${MansubID}\`)
- السلعة: ${Item}
- المبلغ: ${amount}

\`\`\`${story}\`\`\`
**`,
            footer: { text: `تم التقديم بواسطة ${interaction.user.tag}` }
        });

        const button = new MessageButton()
            .setCustomId('رفع_البلاغ')
            .setLabel('رفع البلاغ')
            .setStyle('PRIMARY');

        await interaction.reply({ embeds: [embed], components: [new MessageActionRow().addComponents(button)] });

        await interaction.channel.send({
            content: `**الخطوة التالية: دلوقتي لازم ترسل الدلائل محتاجينك منك الاتي \n\n- دليل الاتفاق علي: (${Item}) بينك وبين النصاب\n- ودليل انه نصب عليك: (يعني عملك بلوك , السلعه مش شغاله , مش بيرد عليك)\n- واخر دليل: دليل تحويل الكريديت للنصاب**`
        });
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'رفع_البلاغ') {
        if (!interaction.member.roles.cache.has(config.ReportSettings.ReportButtonRoleID)) {
            return interaction.reply({ content: 'ليس لديك الصلاحيات اللازمة لرفع البلاغ.', ephemeral: true });
        }

        const modal = new Modal()
            .setCustomId('evidenceModal')
            .setTitle('رفع الدلائل');

        const proof1 = new TextInputComponent()
            .setCustomId('proof1')
            .setLabel("رابط الدليل الأول")
            .setPlaceholder("ضع هنا رابط الدليل الأول")
            .setStyle('SHORT');

        const proof2 = new TextInputComponent()
            .setCustomId('proof2')
            .setLabel("رابط الدليل الثاني")
            .setPlaceholder("ضع هنا رابط الدليل الثاني")
            .setStyle('SHORT');

        const proof3 = new TextInputComponent()
            .setCustomId('proof3')
            .setLabel("رابط الدليل الثالث")
            .setPlaceholder("ضع هنا رابط الدليل الثالث")
            .setStyle('SHORT');

        const proof4 = new TextInputComponent()
            .setCustomId('proof4')
            .setLabel("رابط الدليل الرابع")
            .setPlaceholder("ضع هنا رابط الدليل الرابع")
            .setStyle('SHORT');

        const proofRow1 = new MessageActionRow().addComponents(proof1);
        const proofRow2 = new MessageActionRow().addComponents(proof2);
        const proofRow3 = new MessageActionRow().addComponents(proof3);
        const proofRow4 = new MessageActionRow().addComponents(proof4);

        modal.addComponents(proofRow1, proofRow2, proofRow3, proofRow4);

        await interaction.showModal(modal);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId === 'evidenceModal') {
        await interaction.deferReply({ ephemeral: true });

        const proof1 = interaction.fields.getTextInputValue('proof1');
        const proof2 = interaction.fields.getTextInputValue('proof2');
        const proof3 = interaction.fields.getTextInputValue('proof3');
        const proof4 = interaction.fields.getTextInputValue('proof4');

        const description = interaction.message.embeds[0].description;

        const scammerIDMatch = description.match(/النصاب: <@(\d+)>/);
        const MansubIDMatch = description.match(/المنصوب: <@(\d+)>/);
        const storyMatch = description.match(/\n\`\`\`([\s\S]+)\`\`\`\n/);
        const amountMatch = description.match(/المبلغ: ([^\n]+)/);
        const ItemMatch = description.match(/السلعة: ([^\n]+)/);

        if (!scammerIDMatch || !MansubIDMatch || !storyMatch || !amountMatch || !ItemMatch) {
            return interaction.followUp({ content: 'حدث خطأ في استرجاع البيانات.', ephemeral: true });
        }

        const scammerID = scammerIDMatch[1];
        const MansubID = MansubIDMatch[1];
        const story = storyMatch[1];
        const amount = amountMatch[1];
        const Item = ItemMatch[1];
        const userScammer = `<@${scammerID}>`;
        const userMansub = `<@${MansubID}>`;

        const reportDetails = {
            scammerID,
            MansubID,
            story,
            amount,
            Item,
            userScammer,
            userMansub,
            proofs: [proof1, proof2, proof3, proof4]
        };

        const embed = new MessageEmbed()
        .setColor(settings.لون_الامبيد)
        .setAuthor({
          name: interaction.guild.name,
          iconURL: interaction.guild.iconURL({ dynamic: true }),
        })
        .setTitle('تم تشهير نصاب جديد')
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setDescription(`تم بواسطة <@${interaction.user.id}>`)
        .addFields(
          { name: 'القاضي', value: `<@${reportDetails.judgeID}>`, inline: true },
          { name: 'العضو المنصوب عليه', value: `<@${reportDetails.MansubID}>`, inline: true },
          { name: 'العضو النصاب', value: `<@${reportDetails.scammerID}>`, inline: true },
          { name: 'القصة', value: `${reportDetails.story}` },
          { name: 'المبلغ', value: `${reportDetails.amount}` },
          {
            name: 'الدلائل',
            value: '🔽🔽🔽'
          },
        )
        .setTimestamp();
     const channel = client.channels.cache.get(config.ReportSettings.ChannelID); 

        await channel.send({ embeds: [embed] });

        const proofFiles = reportDetails.proofs.filter(proof => proof); 
        if (proofFiles.length > 0) {
            await channel.send({
                files: proofFiles
            });
        }

        if (settings.ServerInfo && settings.ServerInfo.line) {
            await channel.send({
                files: [settings.ServerInfo.line]
            });
        }

        const scammerRole = interaction.guild.roles.cache.get(config.ReportSettings.ScammerRoleID);
        const scammerMember = interaction.guild.members.cache.get(reportDetails.scammerID);

        if (scammerRole && scammerMember) {
            await scammerMember.roles.add(scammerRole);
        } else {
            console.error('فشل في تعيين الدور. لم يتم العثور على العضو أو الدور.');
        }

        try {
            const scamDB = JSON.parse(fs.readFileSync(scamDBPath, 'utf8'));
            scamDB.push(reportDetails);
            fs.writeFileSync(scamDBPath, JSON.stringify(scamDB, null, 2), 'utf8');
        } catch (error) {
            console.error('فشل في تحديث قاعدة بيانات النصابين:', error);
            await interaction.followUp({ content: 'حدث خطأ في تحديث قاعدة بيانات النصابين.', ephemeral: true });
            return;
        }

        if (scammerMember) {
            try {
                await scammerMember.send(`**لقد تم رفع البلاغ بنجاح عليك.
تفاصيل البلاغ:
- ايدي النصاب: ${reportDetails.scammerID}
- ايدي المنصوب: ${reportDetails.MansubID}
- القصة: ${reportDetails.story}
- المبلغ: ${reportDetails.amount}**`);
            } catch (error) {
                console.error('فشل في إرسال الرسالة المباشرة إلى النصاب:', error);
            }
        } else {
            console.error('لم يتم العثور على العضو النصاب لإرسال الرسالة المباشرة.');
        }

        await interaction.followUp({ content: 'تم رفع البلاغ بنجاح!', ephemeral: true });
    }
});
