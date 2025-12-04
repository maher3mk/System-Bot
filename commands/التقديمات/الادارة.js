const { Intents, Collection, Client, GuildMember, MessageActionRow, WebhookClient,MessagePayload, GatewayIntentBits, MessageSelectMenu, Modal, MessageEmbed,MessageButton, MessageAttachment, Permissions, TextInputComponent} = require('discord.js');
const { client, db , settings} = require('../../index');
const { createEmbed } = require('../../function/function/Embed');

client.on('interactionCreate', async interaction => {
    if (!interaction.isModalSubmit()) return;
    if (interaction.customId === 'staffModal') {

        const name = interaction.fields.getTextInputValue('name');
        const age = interaction.fields.getTextInputValue('age');
        const country = interaction.fields.getTextInputValue('country');
        const hours = interaction.fields.getTextInputValue('hours');
        const info = interaction.fields.getTextInputValue('info');

        const embedData = {
            interaction: interaction,
            title: 'تقديم جديد',
            image: settings.ServerInfo.ApplyImage,
            color: settings.لون_الامبيد,
            fields: [
                { name: 'اسم الشخص', value: `\`\`\`${name}\`\`\`` , inline: true },
                { name: 'العمر', value: `\`\`\`${age}\`\`\`` , inline: true },
                { name: 'البلد', value: `\`\`\`${country}\`\`\`` , inline: true },
                { name: 'عدد ساعات التفاعل', value: `\`\`\`${hours}\`\`\`` , inline: true },
                { name: 'كيف بيقدر يساعدنا', value: `\`\`\`${info}\`\`\`` , inline: true },
            ],
        };

        const embed = createEmbed(embedData);
        const Log = await interaction.guild.channels.cache.get(settings.Apply.staff.Room)

        const buttons = new MessageActionRow().addComponents(
            new MessageButton()
            .setCustomId('Yes_staff')
            .setLabel('قبول الشخص')
            .setStyle('SECONDARY'), 

            new MessageButton()
            .setCustomId('No_staff')
            .setLabel('رفض الشخص')
            .setStyle('SECONDARY'),          
        )

        await Log.send({content : `${interaction.user}` , embeds : [embed], components : [buttons]})
        await Log.send({files : [settings.ServerInfo.line]})

        await interaction.reply({content : `**تم ارسال تقديمك بنجاح ✅**` ,ephemeral :true})
    }
});


///// 
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return
    if (interaction.customId == 'Yes_staff'){

        if (!interaction.member.roles.cache.has(settings.Apply.MasoulKbool)) return
 
        const Role = await interaction.guild.roles.cache.get(settings.Apply.staff.Role)
        const memberID = interaction.message.content;
        const memberId = memberID.replace(/[<@!>]/g, '');
        const member = await interaction.guild.members.fetch(memberId)
        await member.roles.add(Role.id)

        const embed = createEmbed({
            interaction : interaction , 
            title : `تم قبولك بنجاح`, 
            description : `مرحبا عزيزي ${member} تم قبولك ك اداري في ${interaction.guild.name}`
        })
        await member.send({embeds : [embed]})
        await interaction.message.components[0].components[0].setDisabled(true)
        await interaction.message.components[0].components[0].setStyle('SUCCESS')
        await interaction.message.components[0].components[1].setDisabled(true)

        await interaction.update({content : `تم قبول ${member} من قبل ${interaction.user} ✅`,  components : interaction.message.components})
        const channel = await interaction.guild.channels.cache.get(settings.Appyl.staff.Natega);

const Sembed = createEmbed({
    interaction: interaction,
    title: `> Apply Result:`,
    description: `  ${member} تم قبولك ك اداري في ${interaction.guild.name}`
});

const row = new MessageActionRow().addComponents(
    new MessageButton()
        .setCustomId('accepted')
        .setLabel('Accepted')
        .setStyle('SUCCESS') 
        .setDisabled(true)
);

channel.send({
    content: `${member}`, 
    embeds: [Sembed],
    components: [row]
});

    }
})

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return
    if (interaction.customId == 'No_staff'){

        if (!interaction.member.roles.cache.has(settings.Apply.MasoulKbool)) return
 
        const memberID = interaction.message.content;
        const memberId = memberID.replace(/[<@!>]/g, '');
        const member = await interaction.guild.members.fetch(memberId)

        const embed = createEmbed({
            interaction: interaction,
            title : `تم رفضك `, 
            description : `مرحبا عزيزي ${member} تم رفضك ك اداري في ${interaction.guild.name} `
        })
        await member.send({embeds : [embed]})
        await interaction.message.components[0].components[0].setDisabled(true)
        await interaction.message.components[0].components[1].setStyle('DANGER')
        await interaction.message.components[0].components[1].setDisabled(true)

        await interaction.update({content : `تم رفض ${member} من قبل ${interaction.user} ❌`,  components : interaction.message.components})
        const channel = await interaction.guild.channels.cache.get(settings.Appyl.staff.Natega);

        const Fmbed = createEmbed({
            interaction: interaction,
            title: `> Apply Result:`,
            description: `  ${member} تم رفضك ك اداري في ${interaction.guild.name}`
        });
        
        const row = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('Reject')
                .setLabel('Rejected')
                .setStyle('DANGAR') 
                .setDisabled(true)
        );
        
        channel.send({
            content: `${member}`, 
            embeds: [Fmbed],
            components: [row]
        });
        

    }
})