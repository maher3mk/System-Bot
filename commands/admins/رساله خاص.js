const { Client, MessageEmbed } = require('discord.js');
const { client, settings } = require('../../index');

client.on("messageCreate", async (message) => {
  if (message.content.startsWith(settings.prefix + 'dm')) {

    if (!message.member.roles.cache.has(settings.Admins.DiscordLeder)) {
      return message.channel.send("**ليس لديك صلاحيات كافية لإرسال الرسالة.**");
    }

    const args = message.content.split(" ").slice(1);
    const userId = args.shift();
    const content = args.join(" ");
    const user = client.users.cache.get(userId);

    if (!user || !content) {
      return message.channel.send("**الرجاء كتابة الأمر بشكل صحيح: `-dm (user id) (message)`**");
    }

    try {
      const embed = new MessageEmbed()
        .setDescription(content)
        .setColor("RANDOM");

      await user.send(`**رسالة من: ${message.author.tag}**`);
      await user.send({ embeds: [embed] });
      await user.send({ files: [settings.ServerInfo.line] });

      await message.channel.send("**تم إرسال الرسالة بنجاح!**");

    } catch (err) {
      console.error(err);
      await message.channel.send("**تعذر إرسال الرسالة، قد يكون الخاص مغلقاً للمستخدم.**");
    }
  }
});