const { Intents, Collection, Client, GuildMember, MessageActionRow, WebhookClient,MessagePayload, GatewayIntentBits, StringSelectMenu, Modal, MessageEmbed,MessageButton, MessageAttachment, Permissions, TextInputComponent} = require('discord.js');
const { client, db ,TC , dbTickets , settings} = require('../../index');

client.on('interactionCreate', async interaction => {
    if (!interaction.isSelectMenu()) return
    if (interaction.customId == 'open_Ticket'){
        const selectedValue = interaction.values[0];
 if (selectedValue == 'TicketTashher'){

    await interaction.deferReply({ephemeral : true})
    await interaction.message.edit({ components: interaction.message.components });
    const data = await db.get(`BlackList`)
    const ex = await data?.find((t) => t.userid == interaction.user.id && t.type == 'تكت')
    if (ex)return await interaction.editReply({content : `**لديك بلاك ليست تكت , لا يمكنك انشاء تذكره | ❌**`})

    
    const DataCount = await TC.get(`Tashher`)
    const DataTicket = await dbTickets.get(`Tickets_Tashher`)
    const ExitTicket = await DataTicket?.find((t) => t.userid == interaction.user.id)
    if (ExitTicket && ExitTicket.type == 'open') return await interaction.editReply({content : `**لديك تذكرة بالفعل يجب اغلاقها اولا <#${ExitTicket.Ticket}> | 😅**`})


  await interaction.editReply({content : `**جاري انشاء التذكرة الان | 🥰**`})

    const Ticket = await interaction.guild.channels.create(`قضاة-${DataCount?.count || 1}`, {
   type : 'GUILD_TEXT', 
   parent : settings.CetagryTicket.Tasher, 
   permissionOverwrites : [
       {
           id : interaction.guild.roles.everyone.id , 
           deny : 'VIEW_CHANNEL', 
       }, 
       {
           id : interaction.user.id , 
           allow : ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES']
       },
       {
           id : settings.Admins.Kdaa , 
           allow : ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES']
       }
   ]
    })

    if (DataCount){
       DataCount.count ++
       await TC.set(`Tashher`,DataCount )
    }else {
       await TC.set(`Tashher`, {
           count : 1
       })
    }

    const Emmed = new MessageEmbed()
    .setColor(settings.لون_الامبيد)
    .setAuthor(interaction.guild.name , interaction.guild.iconURL({dynamic : true}))
    .setFooter(interaction.guild.name , interaction.guild.iconURL({dynamic : true}))
    .setThumbnail( interaction.guild.iconURL({dynamic : true}))
    .setImage('https://media.discordapp.net/attachments/1207553954515255327/1207598850710183936/18.png?ex=65e03b12&is=65cdc612&hm=6e8f4bf5c803316aa65173a5e118f19496dfcf35e0e5f57bd597e1d57d9e6be0&=&format=webp&quality=lossless&width=1919&height=599')
    .setDescription(`**- مرحبا عزيزي العضو , انت هنا في تذكرة طلب قاضي لأخذ حقك\n- يمكنك الضغط علي الزر بالاسفل (تقديم بلاغ) وقم بتعبئة البيانات المطلوبة منك لكي يتم استلام بلاغك\n- يجب عليك ملأ النموزج بشكل كامل وايضا ارسال الدلائل المطلوبه منك فقط لا غير !**`)

    const Buttons = new MessageActionRow().addComponents(     
        new MessageButton()
        .setCustomId('Apply_Blag')
        .setLabel('تقديم بلاغ لتشهير نصاب')
        .setStyle('SUCCESS'),

        new MessageButton()
        .setCustomId('ClaimTicket_Tashher')
        .setLabel('استلام التذكرة')
        .setStyle('SECONDARY'), 

        new MessageButton()
        .setCustomId('KdaaHelp')
        .setLabel('مساعد الفضاه')
        .setStyle('SECONDARY'),
        
        new MessageButton()
        .setCustomId('CloseTicket')
        .setLabel('احذف التذكرة')
        .setStyle('DANGER'),
    ); 


    await dbTickets.push(`Tickets_Tashher`, {
        userid : interaction.user.id , 
        time : `<t:${Math.floor(Date.now() / 1000)}:R>`, 
        claim : null , 
        transcrept : null , 
        NameTicket : Ticket.name,
        Ticket : Ticket.id , 
        type : 'open'
    })
    
    await Ticket.send({content : `${interaction.user} || <@&${settings.Admins.Kdaa}>`, embeds : [Emmed], components : [Buttons]})

   
    await interaction.editReply({content : `**تم انشاء التذكرة بنجاح ${Ticket} | ✅**`})

       
        }

    }
})