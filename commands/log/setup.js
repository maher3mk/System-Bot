const { Intents, Collection, Client, GuildMember, MessageActionRow, WebhookClient,MessagePayload, GatewayIntentBits, MessageSelectMenu, Modal, MessageEmbed,MessageButton, MessageAttachment, Permissions, TextInputComponent} = require('discord.js');
const { client, db , settings} = require('../../index');
const { createEmbed  } = require('../../function/function/Embed')

client.on('messageCreate', async message => {
  if (message.content.startsWith(`${settings.prefix}log-creat`)) {
    if (!settings.Owners.includes(message.author.id)) return;

    const guild = message.guild;
    const channels = [
      "log-join-leave", "log-ban-unban", "log-kick", "log-messages", "log-pic",
      "log-roles", "log-links", "log-nickname", "log-channels", "log-vjoin-vexit",
      "log-move", "log-tmute-untmute", "log-bots"
    ];

    const loadingMessage = await message.channel.send("Creating logs...");

    let category = guild.channels.cache.find(c => c.name === "logs" && c.type === "GUILD_CATEGORY");

    if (!category) {
      category = await guild.channels.create("logs", {
        type: "GUILD_CATEGORY",
        permissionOverwrites: [
          { id: guild.roles.everyone.id, deny: ["SEND_MESSAGES", "VIEW_CHANNEL"] }
        ]
      });
    }

    for (let ch of channels) {
      const exists = guild.channels.cache.find(c =>
        c.name === ch &&
        c.type === "GUILD_TEXT" &&
        c.parentId === category.id
      );

      if (!exists) {
        await guild.channels.create(ch, {
          type: "GUILD_TEXT",
          parent: category.id
        });
      }
    }

    await loadingMessage.edit("✅ Done created logs!");
  }
});
