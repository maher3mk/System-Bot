const { Intents, Collection, Client, GuildMember, MessageActionRow, WebhookClient,MessagePayload, GatewayIntentBits, MessageSelectMenu, Modal, MessageEmbed,MessageButton, MessageAttachment, Permissions, TextInputComponent} = require('discord.js');
const { client, db , dbpoint , dbTickets, settings} = require('../../index');
const { createEmbed  } = require('../../function/function/Embed')

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId == 'ClaimTicket') {
        if (!interaction.member.roles.cache.has(settings.Admins.DiscordStaff)) return;

        const DataTicket = await dbTickets.get('Tickets_Support');
        const E = await DataTicket?.find((t) => t.Ticket == interaction.channel.id);

        if (E && E.claim !== null) {
            return await interaction.deferReply({ ephemeral: true }).then(() => {
                interaction.editReply({ content: `**تم استلام هذه التذكرة بالفعل من قبل الاداري <@${E.claim}>**`, ephemeral: true });
            });
        }
        await interaction.message.components[0].components[2].setLabel(`${interaction.user.displayName} مستلمة من قبل`).setDisabled(true);
        await interaction.message.edit({ components: interaction.message.components });
        const options = {
            TitleEm: `تم استلام التذكرة بنجاح`,
            ImageEm: null,
            colorEm: settings.لون_الامبيد,
            DesEm: `**تم استلام تذكرة ${interaction.channel} من قبل الاداري ${interaction.user}**`
        };
        
        const embed = createEmbed({
            interaction: interaction,
            title: options.TitleEm,
            image: options.ImageEm,
            color: options.colorEm,
            description: options.DesEm
        });
        

        E.claim = interaction.user.id;
        await dbTickets.set(`Tickets_Support`, DataTicket);
        const Datapoints = await dbpoint.get('Points_Staff')
        const E_P = await Datapoints?.find((t) => t.userid == interaction.user.id)

        if (E_P){
            E_P.point += 1
            await dbpoint.set(`Points_Staff`, Datapoints)
        } else {
            await dbpoint.push(`Points_Staff`, {
            userid : interaction.user.id , 
            point : 1
            })
        }

        await interaction.channel.setName(`claimed-${interaction.user.username}`)
        await interaction.deferReply().then(() => {
            interaction.editReply({ embeds: [embed] });
        });
    }
});



client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId == 'ClaimTicket_Tashher') {
        if (!interaction.member.roles.cache.has(settings.Admins.Kdaa)) return;

        const DataTicket = await dbTickets.get('Tickets_Tashher');
        const E = await DataTicket?.find((t) => t.Ticket == interaction.channel.id);

        if (E && E.claim !== null) {
            return await interaction.deferReply({ ephemeral: true }).then(() => {
                interaction.editReply({ content: `**تم استلام هذه التذكرة بالفعل من قبل القاضي <@${E.claim}>**`, ephemeral: true });
            });
        }
        await interaction.message.components[0].components[1].setLabel(`${interaction.user.displayName} مستلمة من قبل`).setDisabled(true);
        await interaction.message.edit({ components: interaction.message.components });
        
        const options = {
            TitleEm: `تم استلام التذكرة بنجاح`,
            ImageEm: null,
            colorEm: settings.لون_الامبيد,
            DesEm: `**تم استلام تذكرة ${interaction.channel} من قبل القاضي ${interaction.user}**`
        };
        
        const embed = createEmbed({
            interaction: interaction,
            title: options.TitleEm,
            image: options.ImageEm,
            color: options.colorEm,
            description: options.DesEm
        });
        

        E.claim = interaction.user.id;
        await dbTickets.set(`Tickets_Tashher`, DataTicket);
        const Datapoints = await dbpoint.get('Points_Kdaa')
        const E_P = await Datapoints?.find((t) => t.userid == interaction.user.id)

        if (E_P){
            E_P.point += 1
            await dbpoint.set(`Points_Kdaa`, Datapoints)
        } else {
            await dbpoint.push(`Points_Kdaa`, {
            userid : interaction.user.id , 
            point : 1
            })
        }
        await interaction.channel.setName(`claimed-${interaction.user.username}`)
        await interaction.deferReply().then(() => {
            interaction.editReply({ embeds: [embed] });
        });
    }
});



client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId == 'ClaimTicket_Mzad') {
        if (!interaction.member.roles.cache.has(settings.Admins.DiscordStaff)) return;

        const DataTicket = await dbTickets.get('Tickets_Mzad');
        const E = await DataTicket?.find((t) => t.Ticket == interaction.channel.id);

        if (E && E.claim !== null) {
            return await interaction.deferReply({ ephemeral: true }).then(() => {
                interaction.editReply({ content: `**تم استلام هذه التذكرة بالفعل من قبل الاداري <@${E.claim}>**`, ephemeral: true });
            });
        }
        await interaction.message.components[0].components[0].setLabel(`${interaction.user.displayName} مستلمة من قبل`).setDisabled(true);
        await interaction.message.edit({ components: interaction.message.components });
        
        const options = {
            TitleEm: `تم استلام التذكرة بنجاح`,
            ImageEm: null,
            colorEm: settings.لون_الامبيد,
            DesEm: `**تم استلام تذكرة ${interaction.channel} من قبل الاداري ${interaction.user}**`
        };
        
        const embed = createEmbed({
            interaction: interaction,
            title: options.TitleEm,
            image: options.ImageEm,
            color: options.colorEm,
            description: options.DesEm
        });
        

        E.claim = interaction.user.id;
        await dbTickets.set(`Tickets_Mzad`, DataTicket);
        const Datapoints = await dbpoint.get('Points_Staff')
        const E_P = await Datapoints?.find((t) => t.userid == interaction.user.id)

        if (E_P){
            E_P.point += 1
            await dbpoint.set(`Points_Staff`, Datapoints)
        } else {
            await dbpoint.push(`Points_Staff`, {
            userid : interaction.user.id , 
            point : 1
            })
        }
        await interaction.channel.setName(`claimed-${interaction.user.username}`)
        await interaction.deferReply().then(() => {
            interaction.editReply({ embeds: [embed] });
        });
    }
});
