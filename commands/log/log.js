const { Intents, Collection, Client, GuildMember, MessageActionRow, WebhookClient,MessagePayload, GatewayIntentBits, MessageSelectMenu, Modal, MessageEmbed,MessageButton, MessageAttachment, Permissions, TextInputComponent} = require('discord.js');
const { client, db , settings} = require('../../index');
const { createEmbed  } = require('../../function/function/Embed')
const { Inviter } = require('discord-inviter');
const Discord = require(`discord.js`)

client.on("messageDelete", async (message) => {
    let channe4l = "log-messages";
    if (message.channel.type === "DM") return;
    if (!message.guild.me.permissions.has("EMBED_LINKS")) return;
    if (!message.guild.me.permissions.has("MANAGE_MESSAGES")) return;
    var logChannel = message.guild.channels.cache.find((c) => c.name === channe4l);
    if (!logChannel) return;
    let messageDelete = new MessageEmbed()
      .setColor("#0e4a48")
      .setAuthor(message.author.username, message.author.avatarURL({ dynamic: true }))
      .setDescription(`**Messag Delete**\n\n**By : <@${message.author.id}>**\n**In : ${message.channel}**\n\`\`\`Message : ${message.content || ": No Message"}\`\`\`\ `)
      .setThumbnail(
        "https://cdn.discordapp.com/attachments/1093303174774927511/1138876390612144148/D301A2E9-13FD-48E5-93B9-CF7A2FAE42B8.png"
      )
      .setFooter(client.user.username, client.user.displayAvatarURL())
  
    if (message.attachments.size > 0) {
  
    }
  
    logChannel.send({ embeds: [messageDelete] });
  });
  
  
  client.on("messageDelete", async (message) => {
    let channelName = "log-pic";
    if (message.author.bot) return;
    if (message.channel.type === "DM") return;
    if (!message.guild.me.permissions.has("EMBED_LINKS")) return;
    if (!message.guild.me.permissions.has("MANAGE_MESSAGES")) return;
    var logChannel = message.guild.channels.cache.find((c) => c.name === channelName);
    if (!logChannel) return;
    if (message.attachments.size > 0) {
      for (const attachment of message.attachments.values()) {
        if (attachment.contentType.startsWith("image/") || attachment.contentType.startsWith("video/")) {
          logChannel.send({ files: [attachment.url] });
  
          setTimeout(() => {
            let messageDelete = new Discord.MessageEmbed()
              .setColor("#0e4a48")
              .setAuthor(message.author.username, message.author.avatarURL({ dynamic: true }))
              .setDescription(`**Delete image**\n\n**Sent By:** <@${message.author.id}>\n**Pic In **${message.channel}\n\`\`\`Message : No Message\`\`\` `)
              .setThumbnail("https://cdn.discordapp.com/attachments/1093303174774927511/1138876390612144148/D301A2E9-13FD-48E5-93B9-CF7A2FAE42B8.png")
              .setFooter(client.user.username, client.user.displayAvatarURL())
  
            logChannel.send({ embeds: [messageDelete] });
          }, 4000); // 4 seconds delay
        }
      }
    }
  });
  
  client.on("messageUpdate", async (oldMessage, newMessage) => {
    let channel = "log-messages";
    if (oldMessage.author.bot) return;
    if (oldMessage.channel.type === "DM") return;
    if (!oldMessage.guild.me.permissions.has("EMBED_LINKS")) return;
    if (!oldMessage.guild.me.permissions.has("MANAGE_MESSAGES")) return;
  
    var logChannel = oldMessage.guild.channels.cache.find(
      (c) => c.name === channel
    );
    if (!logChannel) return;
  
    if (oldMessage.content.startsWith("https://")) {
      for (const attachment of oldMessage.attachments.values()) {
        logChannel.send({ files: [attachment.url] });
      }
      return;
    }
  
    let messageUpdate = new Discord.MessageEmbed()
      .setAuthor(oldMessage.author.username, oldMessage.author.avatarURL({ dynamic: true }))
      .setThumbnail(
        "https://cdn.discordapp.com/attachments/1093303174774927511/1138875547066314772/0DB13224-1283-4BF9-B8F5-93975DE3F7C2.png"
      )
      .setColor("#0e4a48")
      .setDescription(`**Edit Message**\n\n**By : ** <@${oldMessage.author.id}>\n**In ${oldMessage.channel}**\n**Message : [Click Here](${oldMessage.url})**\n**Old Message :**\n\`\`\`${oldMessage.content}\`\`\`\n**New Message:**\`\`\`${newMessage.content}\`\`\` `)
      .setFooter(client.user.username, client.user.displayAvatarURL())
    logChannel.send({ embeds: [messageUpdate] });
  });
  

  client.on('channelCreate', async (channel) => {
    if (!channel.guild) return;
    if (!channel.guild.me.permissions.has('EMBED_LINKS')) return;
    if (!channel.guild.me.permissions.has('VIEW_AUDIT_LOG')) return;
    let channelName = "log-channels";
    var logChannel = channel.guild.channels.cache.find(c => c.name === channelName);
    if (!logChannel) return;
  
    if (channel.type === 'GUILD_TEXT') {
      var roomType = 'Text';
    } else if (channel.type === 'GUILD_VOICE') {
      var roomType = 'Voice';
    } else if (channel.type === 'GUILD_CATEGORY') {
      var roomType = 'Category';
    }
  
    channel.guild.fetchAuditLogs().then(logs => {
      var userID = logs.entries.first().executor.id;
      client.users.fetch(userID).then(user => {
        let channelCreate = new Discord.MessageEmbed()
          .setAuthor(user.username, user.avatarURL({ dynamic: true }))
          .setThumbnail('https://cdn.discordapp.com/attachments/1093303174774927511/1138891156818772018/8C926555-671C-4F9C-9136-DAD2229375B4.png')
          .setDescription(`**Channel Create**\n\n**By : <@${userID}>**\n**Channel : <#${channel.id}>**\n**Create : ${roomType}**\n\`\`\`✅ - ${channel.id}\`\`\``)
          .setColor(`#6d5873`)
          .setFooter(client.user.username, client.user.displayAvatarURL())
        logChannel.send({ embeds: [channelCreate] });
      });
    });
  });
  
  
  client.on('channelDelete',  async channel => { 
    if(!channel.guild) return;
    if(!channel.guild.me.permissions.has('EMBED_LINKS')) return;
    if(!channel.guild.me.permissions.has('VIEW_AUDIT_LOG')) return;
    let channe3l = "log-channels";
    var logChannel = channel.guild.channels.cache.find(c => c.name === channe3l);
    if(!logChannel) return; 
  
    if(channel.type === 'GUILD_TEXT') { 
        var roomType = 'Text';
    }else
    if(channel.type === 'GUILD_VOICE') { 
        var roomType = 'Voice';
    }else
    if(channel.type === 'GUILD_CATEGORY') { 
        var roomType = 'Category';
    }
  
    channel.guild.fetchAuditLogs().then(logs => {
        var userID = logs.entries.first().executor.id;
        client.users.fetch(userID).then(user => {
  
        let channelDelete = new Discord.MessageEmbed()
        .setAuthor(user.username, user.avatarURL({ dynamic: true }))
        .setDescription(`**Channel Delete**\n\n**By : <@${userID}>**\n**Channel :${channel.name}**\n**Create : ${roomType}**\n\`\`\`❌ - ${channel.id}\`\`\``)
        .setColor(`#6d5873`)
        .setTimestamp()
        .setThumbnail(`https://cdn.discordapp.com/attachments/1093303174774927511/1138891157523402772/40A15AD6-0C21-43A5-A70A-6ED69615C182.png`)
        .setFooter(client.user.username, client.user.displayAvatarURL())
        logChannel.send({ embeds: [channelDelete] }); 
      });
    })
  });
  
  client.on('channelUpdate', async (oldChannel, newChannel) => {
    let channe3l = "log-channels";
    if(!oldChannel.guild) return;
  
    var logChannel = oldChannel.guild.channels.cache.find(c => c.name === channe3l);
    if(!logChannel) return;
  
    if(oldChannel.type === 'GUILD_TEXT') {
        var channelType = 'Text';
    }else
    if(oldChannel.type === 'GUILD_VOICE') {
        var channelType = 'Voice';
    }else
    if(oldChannel.type === 'GUILD_CATEGORY') {
        var channelType = 'Category';
    }
   
    oldChannel.guild.fetchAuditLogs().then(logs => { 
        var userID = logs.entries.first().executor.id;
        client.users.fetch(userID).then(user => {
  
        if(oldChannel.name !== newChannel.name) {
            let newName = new Discord.MessageEmbed()
            .setAuthor(user.username, user.avatarURL({ dynamic: true }))
            .setThumbnail('https://cdn.discordapp.com/attachments/1093303174774927511/1138891156818772018/8C926555-671C-4F9C-9136-DAD2229375B4.png')
            .setColor(`#6d5873`)
            .setDescription(`**CHANNEL EDIT**\n\n**By : <@${userID}>**\n**Id : ${userID}**\n**Channel : <#${oldChannel.id}>**\n\`\`\`✅ - ${oldChannel.name} => ${newChannel.name}\`\`\``)
            .setFooter(client.user.username, client.user.displayAvatarURL())
            logChannel.send({ embeds: [newName] }); 
        }
  
    })
  })
  });
  

  
  client.on('guildMemberUpdate', async (oldMember, newMember) => {
    let channel = "log-nickname";
    var logChannel = oldMember.guild.channels.cache.find(c => c.name === channel);
    if (!logChannel) return;
  
    oldMember.guild.fetchAuditLogs({ limit: 1, type: 'MEMBER_UPDATE' }).then(logs => {
      var userID = logs.entries.first().executor.id;
  
      if (oldMember.nickname !== newMember.nickname) {
        if (oldMember.nickname === null) {
          var oldNM = '\`\`Original Name\`\`';
        } else {
          var oldNM = oldMember.nickname;
        }
        if (newMember.nickname === null) {
          var newNM = '\`\`Original Name\`\`';
        } else {
          var newNM = newMember.nickname;
        }
        let updateNickname = new Discord.MessageEmbed()
          .setAuthor(oldMember.guild.name, oldMember.guild.iconURL({ dynamic: true, size: 1024, format: 'png' }))
          .setThumbnail('https://cdn.discordapp.com/attachments/1091536665912299530/1153870210470781008/BF6ECA69-026C-4335-9FC6-DF96E467BE9D.png')
          .setColor(`#c037d1`)
          .setDescription(`**Change Nickname**\n\n**To : ${oldMember}**\n**By:** <@${userID}>\n\`\`\`${oldNM} => ${newNM}\`\`\` `)
          .setFooter(client.user.username, client.user.displayAvatarURL())
  
        logChannel.send({ embeds: [updateNickname] });
      }
    });
  });
  
  

  
  var { inviteTracker } = require("discord-inviter"), tracker = new inviteTracker(client);
  tracker.on("guildMemberAdd", async (member, inviter) => { 
    let channel1Name = "log-join-leave";
    let logChannel = member.guild.channels.cache.find((c) => c.name === channel1Name);
    if (!logChannel) return;
    if(!member.guild.id.includes(`${logChannel.guild.id}`)) return;
    if(member.user.bot) return;
    let serverMembersCount = member.guild.memberCount;
  
    const fetchedLogs = await member.guild.fetchAuditLogs({
      limit: 1,
      type: 'BOT_ADD',
    });
    const BotLog = fetchedLogs.entries.first();
    const { executor } = BotLog;
    const invites = await member.guild.invites.fetch();
    const inviterInvite = invites.find((invite) => invite.inviter.id === executor.id);
    const inviteURL = inviterInvite ? `${inviterInvite.code}` : 'Invite URL not found';
  
    let i1nviter = new Discord.MessageEmbed()
     .setAuthor(member.user.username, member.user.displayAvatarURL({ dynamic: true, size: 1024, format: 'png' }))
     .setThumbnail('https://cdn.discordapp.com/attachments/1091536665912299530/1153822727531147284/D8B5B65D-9A17-4CEF-A04E-7DA3B13985DD.png')
      .setColor('#292450')
      .setDescription(`**User join**\n\n**User: ${member && member.user ? `<@${member.user.id}>` : 'Unknown User'}**\n**By: ${inviter}**\n**Joined at: **(<t:${parseInt(member && member.user ? member.user.createdAt / 1000 : 0)}:R>)\n**Url:** \`${inviteURL}\`\n**Devices: ${member && member.presence ? member.presence.status : 'Unknown Status'}${member && member.presence && member.presence.status === 'offline' ? ' (Offline)' : ''}**\n**Members: ${serverMembersCount}**`)
      .setFooter(inviter.username, inviter.displayAvatarURL({ dynamic: true }));
  logChannel.send({ embeds: [i1nviter] });
    })
  
  function Days(date) {
    let now = new Date();
    let diff = now.getTime() - date.getTime();
    let days = Math.floor(diff / 86400000);
    return days + (days == 1 ? " day" : " days") + " ago";
  }
  
  client.on('guildMemberRemove', async member => { 
    let channel = "log-join-leave";
    var logChannel = member.guild.channels.cache.find(c => c.name === channel); 
    if(!logChannel) return; 
  
    let leaveMember = new Discord.MessageEmbed()
    .setAuthor(member.user.username, member.user.displayAvatarURL({ dynamic: true, size: 1024, format: 'png' }))
    .setThumbnail('https://cdn.discordapp.com/attachments/1091536665912299530/1153822715388637194/AFB742D0-5B6A-4C25-BF91-FBA284280087.png')
    .setColor(`#292450`)
    .setDescription(`**User Leave**\n\n**User : <@${member.user.id}>**\n**Joined Discord : (<t:${parseInt(member.user.createdAt / 1000)}:R>)**\n**User id :${member.user.id}**`)
    .setFooter(client.user.username, client.user.displayAvatarURL())
    logChannel.send({ embeds: [leaveMember] });
  });
  

  
  client.on("inviteCreate", async (invite) => {
    let channel = "log-links";
    var logChannel = invite.guild.channels.cache.find(c => c.name === channel);
    if (!logChannel) return;
    if (!invite.guild.id.includes(`${logChannel.guild.id}`)) return;
    const fetchedLogs = await invite.guild.fetchAuditLogs({
      limit: 1,
      type: 'INVITE_CREATE',
    });
    const InviteLog = fetchedLogs.entries.first();
    const { executor } = InviteLog;
  
    let embed = new Discord.MessageEmbed()
      .setAuthor(executor.tag, executor.displayAvatarURL({ dynamic: true, size: 1024, format: 'png' }))
      .setDescription(`**Invite Created**\n\n**By : ${executor}**\n**Create In : ${invite.channel}**\n**Code : \`${invite.code}\`**\n**Max User : \`${invite.maxUses}\`**\n**Ends Within :** \`${invite.expiresTimestamp ? new Date(invite.expiresTimestamp).toLocaleString() : 'Never'}\`\n\`\`\`${invite.url}\`\`\``)
      .setColor(`#286554`)
      .setTimestamp()
      .setFooter(invite.guild.name, invite.guild.iconURL({ dynamic: true }))
      .setThumbnail(`https://cdn.discordapp.com/attachments/1093303174774927511/1138893392919658627/13AA3EF6-F41C-40BA-890B-5D4CFBFC8F81.png`);
  
    logChannel.send({ embeds: [embed] });
  });

  
  client.on("guildMemberAdd", async (member) => {
    const fetchedLogs = await member.guild.fetchAuditLogs({
      limit: 1,
      type: 'BOT_ADD',
    });
    const BotLog = fetchedLogs.entries.first();
    const { executor, target } = BotLog;
    if (member.user.bot) {
      let channel = "log-bots";
      var logChannel = member.guild.channels.cache.find(c => c.name === channel);
      if (!logChannel) return;
      if (!member.guild.id.includes(`${logChannel.guild.id}`)) return;
      let embed = new Discord.MessageEmbed()
        .setDescription(`**Invite Bots**\n\n**By : ${executor}**\n**Bot : ${member}**\n**Age : (<t:${parseInt(member.user.createdAt / 1000)}:R>)**\n**Id : ${member.id}**`)
        .setColor(`#6e2f51`)
        .setFooter(client.user.username, client.user.displayAvatarURL())
        .setThumbnail(`https://cdn.discordapp.com/attachments/1147204910337757225/1154648106122616892/C1957198-3BD3-4294-B533-2EDC8E271BBA.png`);
  
      logChannel.send({ embeds: [embed] });
  
      let kickButton = new Discord.MessageButton()
        .setCustomId('kickButton')
        .setLabel('Kick Bot')
        .setStyle('DANGER');
  
      let row = new Discord.MessageActionRow()
        .addComponents(kickButton);
  
        const message = await logChannel.send({ content: 'Click the button to kick the bot:', embeds: [embed], components: [row] });
  
      const filter = (interaction) => interaction.customId === 'kickButton' && interaction.user.id === member.guild.ownerId;
  
      const collector = message.createMessageComponentCollector({ filter, time: 15000 });
  
      collector.on('collect', async (interaction) => {
        await interaction.reply({ content: 'Kicking the bot...', ephemeral: true });
        await member.kick('Kicked by owner');
      });
  
      collector.on('end', () => {
        message.edit({ components: [] });
      });
    }
  
    function Days(date) {
      let now = new Date();
      let diff = now.getTime() - date.getTime();
      let days = Math.floor(diff / 86400000);
      return days + (days == 1 ? " day" : " days") + " ago";
    }
  });
  

  
  client.on("inviteDelete", async (invite) => {
    let channel = "log-links";
    var logChannel = invite.guild.channels.cache.find(c => c.name === channel); 
    if(!logChannel) return;
    if(!invite.guild.id.includes(`${logChannel.guild.id}`)) return;
    const fetchedLogs = await invite.guild.fetchAuditLogs({
      limit: 1,
      type: 'INVITE_DELETE',
    });
    const InviteLog = fetchedLogs.entries.first();
    const { executor, target } = InviteLog;
  
    let embed = new Discord.MessageEmbed()
      .setDescription(`**Invite Deleted**\n\n**Created By:** \`\`\`${target.inviter.tag}\`\`\`\n**Deleted By:** \`\`\`${executor.tag}\`\`\`\n**Invite Url:** ${invite.url}`)
      .setColor(`#286554`)
      .setFooter(client.user.username, client.user.displayAvatarURL())
      .setThumbnail(`https://cdn.discordapp.com/attachments/1093303174774927511/1138893392919658627/13AA3EF6-F41C-40BA-890B-5D4CFBFC8F81.png`);
    logChannel.send({ embeds: [embed] });
  });
  

  
  client.on('guildMemberUpdate', async (oldMember, newMember) => { 
    let channel = "log-roles";
    var logChannel = oldMember.guild.channels.cache.find(c => c.name === channel); 
    if (!logChannel) return;
    if (!oldMember.guild.id.includes(`${logChannel.guild.id}`)) return;
    if (!newMember.guild.id.includes(`${logChannel.guild.id}`)) return;
    
    const fetchedLogs = await oldMember.guild.fetchAuditLogs({
      limit: 1,
      type: 'MEMBER_ROLE_UPDATE',
    });
    
    const RoleLog = fetchedLogs.entries.first();
    const { executor } = RoleLog;
    
    const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));
    if (removedRoles.size > 0) {
      let embed = new Discord.MessageEmbed()
       .setAuthor(executor.tag, executor.avatarURL({ dynamic: true, size: 1024, format: 'png' }))
        .setDescription(`**Edit Member**\n\n**To : ${executor}**\n**By : <@${newMember.user.id}>**\n\`\`\`❌ - ${removedRoles.map(r => r.name)}\`\`\`\ `)
        .setColor(`#493d5d`)
        .setThumbnail('https://cdn.discordapp.com/attachments/1091536665912299530/1164975437320044564/F2090C33-D3A6-4816-BDBA-2AC2E4FDDA92.png?ex=65452aec&is=6532b5ec&hm=64a949b42b78aedd0bdeb626125a30f48eded796cbac1c589292444d1b555fa4&')
        .setFooter(client.user.username, client.user.displayAvatarURL())
        logChannel.send({embeds: [embed]});
    }
    
    const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
    if (addedRoles.size > 0) {
      let embed = new Discord.MessageEmbed()
      .setAuthor(executor.tag, executor.avatarURL({ dynamic: true, size: 1024, format: 'png' }))
      .setDescription(`**Edit Member**\n\n**To : ${executor}**\n**By : <@${newMember.user.id}>**\n\`\`\`✅ - ${addedRoles.map(r => r.name)}\`\`\`\ `)
      .setThumbnail('https://cdn.discordapp.com/attachments/1091536665912299530/1164975437320044564/F2090C33-D3A6-4816-BDBA-2AC2E4FDDA92.png?ex=65452aec&is=6532b5ec&hm=64a949b42b78aedd0bdeb626125a30f48eded796cbac1c589292444d1b555fa4&')
      .setColor(`#493d5d`)
      .setFooter(client.user.username, client.user.displayAvatarURL())
        
      logChannel.send({embeds: [embed]});
    }
  });
  
  client.on('roleCreate', async (role) => {
    let channel = "log-roles";
    if (!role.guild.me.permissions.has('EMBED_LINKS')) return;
    if (!role.guild.me.permissions.has('VIEW_AUDIT_LOG')) return;
  
    var logChannel = role.guild.channels.cache.find((c) => c.name === channel);
    if (!logChannel) return;
  
    role.guild.fetchAuditLogs().then((logs) => {
      var userID = logs.entries.first().executor.id;
      var usertag = logs.entries.first().executor.tag;
      var userAvatar = logs.entries.first().executor.avatarURL({ dynamic: true });
  
      let roleCreate = new Discord.MessageEmbed()
      .setAuthor(usertag, userAvatar)
      .setThumbnail('https://cdn.discordapp.com/attachments/1091536665912299530/1153814321877495879/07D149C2-6EAC-4543-B8C8-04F8B543EEA3.png')
        .setDescription(`**Create Role**\n\n**By : <@${userID}>**\n**Role : ${role.name}**`)
        .setColor(`#857f99`)
        .setFooter(client.user.username, client.user.displayAvatarURL())
      logChannel.send({ embeds: [roleCreate] });
    });
  });
  
  
  client.on('roleDelete', async (role) => {
    let channel = "log-roles";
    if (!role.guild.me.permissions.has('EMBED_LINKS')) return;
    if (!role.guild.me.permissions.has('VIEW_AUDIT_LOG')) return;
  
    var logChannel = role.guild.channels.cache.find((c) => c.name === channel);
    if (!logChannel) return;
  
    role.guild.fetchAuditLogs().then((logs) => {
      var userID = logs.entries.first().executor.id;
      var usertag = logs.entries.first().executor.tag;
      var userAvatar = logs.entries.first().executor.avatarURL({ dynamic: true });
  
      let roleDelete = new Discord.MessageEmbed()
      .setAuthor(usertag, userAvatar)
        .setThumbnail(`https://cdn.discordapp.com/attachments/1091536665912299530/1153820347053920356/40A15AD6-0C21-43A5-A70A-6ED69615C182.png`)
        .setDescription(`**Role Delete**\n\n**Role : ${role.name}**\n**By : <@${userID}>**`)
        .setColor(`#857f99`)
        .setFooter(client.user.username, client.user.displayAvatarURL())
      logChannel.send({ embeds: [roleDelete] });
    });
  });
  
  
  client.on('roleUpdate', async (oldRole, newRole) => {
    let channel = "log-roles";
    if (!oldRole.guild.me.permissions.has('EMBED_LINKS')) return;
    if (!oldRole.guild.me.permissions.has('VIEW_AUDIT_LOG')) return;
  
    var logChannel = oldRole.guild.channels.cache.find((c) => c.name === channel);
    if (!logChannel) return;
  
    oldRole.guild.fetchAuditLogs().then((logs) => {
      var userID = logs.entries.first().executor.id;
      var usertag = logs.entries.first().executor.tag;
      var userAvatar = logs.entries.first().executor.avatarURL({ dynamic: true });
  
  
        let roleUpdateName = new Discord.MessageEmbed()
          .setAuthor(usertag, userAvatar)
          .setThumbnail(`https://cdn.discordapp.com/attachments/1091536665912299530/1164981210846605432/8C926555-671C-4F9C-9136-DAD2229375B4.png?ex=6545304c&is=6532bb4c&hm=8a5a4ec52a8f981a8af903a006bf85724abb877fe21eba0fe1d759c80b393d8c&`)
          .setColor(`#6d5873`)
          .setDescription(`**Edit Role**\n\n**Role : <@&${oldRole.id}>**\n**By : <@${userID}>**\n\`\`\`${oldRole.name} => ${newRole.name} ⇃\`\`\`\ `)
          .setFooter(client.user.username, client.user.displayAvatarURL())
  
        logChannel.send({ embeds: [roleUpdateName] });
  
  
        let permissionsAdded = [];
        let permissionsRemoved = [];
        
        newRole.permissions.toArray().forEach(perm => {
          if (!oldRole.permissions.has(perm)) {
            permissionsAdded.push(perm);
          }
        });
        
        oldRole.permissions.toArray().forEach(perm => {
          if (!newRole.permissions.has(perm)) {
            permissionsRemoved.push(perm);
          }
        });
        
        if (permissionsAdded.length > 0 || permissionsRemoved.length > 0) {
          let formattedPermissionsAdded = permissionsAdded.map(perm => `\`\`\`✅ - ${perm}\`\`\`\ `).join('\n');
          let formattedPermissionsRemoved = permissionsRemoved.map(perm => `\`\`\`❌ - ${perm}\`\`\`\ `).join('\n');
        
          let roleUpdateName = new Discord.MessageEmbed()
            .setAuthor(usertag, userAvatar)
            .setThumbnail('https://cdn.discordapp.com/attachments/1091536665912299530/1164975437320044564/F2090C33-D3A6-4816-BDBA-2AC2E4FDDA92.png?ex=65452aec&is=6532b5ec&hm=64a949b42b78aedd0bdeb626125a30f48eded796cbac1c589292444d1b555fa4&')
            .setColor(`#493d5d`)
            .setDescription(`**Edit Role**\n\n**By : <@${userID}>**\n**Role : <@&${oldRole.id}>**\n${formattedPermissionsAdded}${formattedPermissionsRemoved}`)
            .setFooter(client.user.username, client.user.displayAvatarURL())
        
          logChannel.send({ embeds: [roleUpdateName] });
        }
        
        
      if (oldRole.hexColor !== newRole.hexColor) {
        if (oldRole.hexColor === '#000000') {
          var oldColor = '`Default`';
        } else {
          var oldColor = oldRole.hexColor;
        }
        if (newRole.hexColor === '#000000') {
          var newColor = '`Default`';
        } else {
          var newColor = newRole.hexColor;
        }
  
        let roleUpdateColor = new Discord.MessageEmbed()
          .setTitle('Role Color Update')
          .setAuthor(usertag, userAvatar)
          .setThumbnail('https://cdn.discordapp.com/emojis/911385098413281300.png?size=80')
          .setColor(`#857f99`)
          .setDescription(
            `**Info Of User:**\n\`\`\`UpdateBy: ${usertag}\nUserID: ${userID}\`\`\`\n**Info Of Role:**\n\`\`\`RoleName: ${oldRole.name}\nOldColor: ${oldColor}\nNewColor: ${newColor}\nRoleID: ${oldRole.id}\`\`\``)
            .setFooter(client.user.username, client.user.displayAvatarURL())
  
        logChannel.send({ embeds: [roleUpdateColor] });
      }
    });
  });
  

  client.on('voiceStateUpdate', async (oldState, newState) => { 
    let channe5l = "log-vjoin-vexit";
    var logChannel = oldState.member.guild.channels.cache.find(c => c.name === channe5l); 
    if (!logChannel) return;
    if (oldState.member.bot) return;
    if (newState.member.bot) return;
    if (!newState.guild.id.includes(`${logChannel.guild.id}`)) return;
    if (!oldState.guild.id.includes(`${logChannel.guild.id}`)) return;
      
    if (!oldState.channelId && newState.channelId) {
      let entryTime = new Date().toLocaleTimeString('ar-EG', { hour: 'numeric', minute: 'numeric', hour12: true });
      let embed = new Discord.MessageEmbed()
        .setAuthor(newState.member.user.username, newState.member.user.displayAvatarURL())
        .setDescription(`**Join Voice**\n\n**Voice : <#${newState.channel.id}>**\n**User : <@${oldState.member.user.id}>**\n**Time : ${entryTime}**`)
        .setColor(`#183955`)
        .setFooter(client.user.username, client.user.displayAvatarURL())
        .setThumbnail(`https://cdn.discordapp.com/attachments/1093303174774927511/1138889079963009137/8B73770E-31D7-489A-8BF6-152D91D6D76A.png`);
      return logChannel.send({embeds: [embed]});
    }
    
    if (oldState.channelId && !newState.channelId && oldState.member.user.bot === false) {
      let entryTime = new Date().toLocaleTimeString('ar-EG', { hour: 'numeric', minute: 'numeric', hour12: true });
      let embed = new Discord.MessageEmbed()
      .setAuthor(oldState.member.user.username, oldState.member.user.displayAvatarURL())
      .setDescription(`**Leave Voice**\n\n**Voice : <#${oldState.channel.id}>**\n**User : <@${oldState.member.user.id}>**\n**Time : ${entryTime}**`)
        .setColor(`#183955`)
        .setFooter(client.user.username, client.user.displayAvatarURL())
        .setThumbnail(`https://cdn.discordapp.com/attachments/1093303174774927511/1138889077123465416/IMG_2593.png`);
      return logChannel.send({embeds: [embed]});
    }
  
    let channe7l = "log-move";
    var logChannel = oldState.member.guild.channels.cache.find(c => c.name === channe7l); 
    if (!logChannel) return;
    if (oldState.channelId !== newState.channelId) {
      let embed = new Discord.MessageEmbed()
      .setAuthor(oldState.member.user.username, oldState.member.user.displayAvatarURL())
      .setDescription(`**Voice Moved**\n\n**User : <@${newState.member.user.id}>**\n**Voice : <#${(oldState.channel?.id)}>**\n**Moved : <#${(newState.channel?.id)}>**\n\`\`\`${(oldState.channel?.name)} => ${(newState.channel?.name)}\`\`\`\ `)
        .setColor(`#4e9ca5`)
        .setFooter(client.user.username, client.user.displayAvatarURL())
        .setThumbnail(`https://cdn.discordapp.com/attachments/1093303174774927511/1138889767468146738/E242A7A8-FDB5-4F44-86F4-AE2161BFA543.png`);
      return logChannel.send({embeds: [embed]});
    }
  });
  

  
  client.on('guildBanAdd', async (member) => {
    let channel = "log-ban-unban";
    var logChannel = member.guild.channels.cache.find((c) => c.name === channel);
    if (!logChannel) return;
  
    const fetchedLogs = await member.guild.fetchAuditLogs({
      limit: 1,
      type: 'MEMBER_BAN_ADD',
    });
    const BanLog = fetchedLogs.entries.first();
    const { executor, reason } = BanLog; // Extract the reason from the BanLog
  
    let Embed = new Discord.MessageEmbed()
     .setAuthor(member.user.username, member.user.displayAvatarURL({ dynamic: true, size: 1024, format: 'png' }))
      .setDescription(`**Ban Member**\n\n**To : <@${member.user.id}>**\n**By : ${executor}**\n\`\`\`Reason : ${reason || 'No reason'}\`\`\``)
      .setColor(`#880013`)
      .setFooter(member.guild.name, member.guild.iconURL({ dynamic: true }))
      .setThumbnail(
        'https://cdn.discordapp.com/attachments/1093303174774927511/1138892172574326874/82073587-11BA-4E4B-AC8F-8857CD89282F.png'
      );
  
    logChannel.send({ embeds: [Embed] });
  });
  
  client.on('guildBanRemove', async (member) => {
    let channel = "log-ban-unban";
    var logChannel = member.guild.channels.cache.find((c) => c.name === channel);
    if (!logChannel) return;
    const fetchedLogs = await member.guild.fetchAuditLogs({
      limit: 1,
      type: 'MEMBER_BAN_REMOVE',
    });
    const BanLog = fetchedLogs.entries.first();
    const { executor } = BanLog;
  
    if (!logChannel) return;
  
    let Embed = new Discord.MessageEmbed()
      .setAuthor(member.user.username, member.user.displayAvatarURL({ dynamic: true, size: 1024, format: 'png' }))
      .setDescription(`**UnBan Member**\n\n**To : <@${member.user.id}>**\n**By : ${executor}**\n\`\`\`Reason : No reason\`\`\`\ `)
      .setColor(`#880013`)
      .setFooter(member.guild.name, member.guild.iconURL({ dynamic: true }))
      .setThumbnail(
        'https://cdn.discordapp.com/attachments/1093303174774927511/1138891905283928174/551F8C85-8827-41AF-9286-256F63BE2129.png'
      );
  
    logChannel.send({ embeds: [Embed] });
  });

  
  client.on('guildMemberRemove', async member => {
    let channel = "log-kick";
    var logChannel = member.guild.channels.cache.find((c) => c.name === channel);
    if (!logChannel) return;
  
    const fetchedLogs = await member.guild.fetchAuditLogs({
      limit: 1
    });
    const kickLog = fetchedLogs.entries.first();
    const { executor, target } = kickLog;
  
    if (kickLog.action == 'MEMBER_KICK' && kickLog.target.id == `${member.user.id}`) {
      let channel = "log-kick";
      var logChannel = member.guild.channels.cache.find((c) => c.name === channel);
      if (!logChannel) return;
  
      let Embed = new Discord.MessageEmbed()
      .setAuthor(member.user.username, member.user.displayAvatarURL({ dynamic: true, size: 1024, format: 'png' }))
        .setDescription(`**Kick Member**\n\n**To : <@${member.user.id}>**\n**By : ${executor}**\n\`\`\`Reason : No reason\`\`\`\ `)
        .setColor(`#101a3a`)
        .setFooter(member.guild.name, member.guild.iconURL({ dynamic: true }))
        .setThumbnail(`https://cdn.discordapp.com/attachments/1093303174774927511/1138886169384472627/F4570260-9C71-432E-87CC-59C7B4B13FD4.png`);
  
      logChannel.send({ embeds: [Embed] });
    }
  });