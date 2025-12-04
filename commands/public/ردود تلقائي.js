const { Intents, Collection, Client, GuildMember, MessageActionRow, WebhookClient,MessagePayload, GatewayIntentBits, MessageSelectMenu, Modal, MessageEmbed,MessageButton, MessageAttachment, Permissions, TextInputComponent} = require('discord.js');
const { client, db , settings} = require('../../index');
const server1 = settings.ServerInfo.serverID

   
   client.on('messageCreate', message => {
    if(message.content === "#دلائل"){
        if(message.guildId !== server1) return;
        if (!message.member.roles.cache.has(settings.Admins.DiscordLeder)) return;
        message.delete();
        message.channel.send(`**لتقديم بلاغك علي نصـ ـاب اذكر الاتي : 
   -  ايدي النصـ ـاب :
   -  ايدي المنصـ ـوب : 
   -  السـ ـلعه :
   -  سـ3ـرها :
   -  القصه بأختصار :
   -  ارسل__ دليل واحد فقط لكل صورة__ ( دليل اتفاق علي السـ ـلعه , دليل انه نصـ ـب عليك , دليل تحويل الكريديت للنصـ ـاب)**
   **يفضل دليل التحويل من موقع بروبوت**`);
    }
   });
   
   
   client.on('messageCreate', message => {
    if(message.content === "حول"){
        if(message.guildId !== server1) return;
        if (!message.member.roles.cache.has(settings.Admins.DiscordStaff)) return;
        message.delete();
        message.channel.send(`التحويل فقط ل <@${settings.BankID}> .**
   اي تحويل خارج التكت او تحويل لشخص اخر لن يتم الاعتراف به**`);
    }
   });

      client.on('messageCreate', message => {
    if(message.content === "خط"){
        if(message.guildId !== server1) return;
        if (!message.member.roles.cache.has(settings.Admins.DiscordStaff)) return;
        message.delete();
        message.channel.send(({files : [settings.ServerInfo.line]}));
    }
   });
   
   
   client.on('messageCreate', message => {
    if(message.content === 'بروبوت'){
        if(message.guildId !== server1) return;
        if (!message.member.roles.cache.has(settings.Admins.DiscordLeder)) return;
        message.delete();
        message.channel.send(`https://probot.io/transactions`);
    }
   });
   
   client.on('messageCreate', message => {
    if(message.content === 'شفر'){
        if(message.guildId !== server1) return;
        if (!message.member.roles.cache.has(settings.Admins.DiscordStaff)) return;
        message.delete();
        message.channel.send(`** يجب تشفير حرف من الكلمات الاتية :
   
   [ "حساب","بيع","شراء","شوب","متجر,"ديسكورد","نصاب","سعر","متوفر","بوست","نيترو" ]**`);
    }
   });
   
   client.on('messageCreate', message => {
    if(message.content === "منشور"){
        if(message.guildId !== server1) return;
        if (!message.member.roles.cache.has(settings.Admins.DiscordLeder)) return;
        message.delete();
        message.channel.send(`**منشور مدفوع مالنا علاقة و نخلي مسؤوليتنا عن الي يصير بينكم**`).then(
        message.channel.send(`${line}`));
    }
   });
   
   
   client.on('messageCreate', message => {
    if(message.content === '#خمول'){
        if(message.guildId !== server1) return;
        if (!message.member.roles.cache.has(settings.Admins.DiscordLeder)) return;
            message.delete();
        message.channel.send(`**في حال عدم الرد خلال 5 دقائق سيتم اغلاق التكت**`);  
            return;
  
        }
       });
   
   client.on('messageCreate', message => {
    if(message.content === 'شعار'){
        if (!message.member.roles.cache.has(settings.Admins.DiscordStaff)) return;
        message.delete();
        message.channel.send(`**
   الشعار الوحيد لسيرفرات Galaxy Hub :
   ${settings.RBPrefix} | Name
   **`);
    }
   });