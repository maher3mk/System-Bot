const { Client, GatewayIntentBits, MessageActionRow, Modal, TextInputComponent, MessageEmbed, Permissions, MessageButton } = require('discord.js');
const { client, db, settings } = require('../../index');
const config = require('../../config/settings'); 
const { createEmbed } = require('../../function/function/Embed');
const fs = require('fs');
const path = require('path');

client.on("interactionCreate", async interaction => {
    if(!interaction.isButton)return;

    if(interaction.customId == "modalmz"){
    const modal = new Modal()
      .setCustomId('mzadmodal')
      .setTitle('تعبئة بيانات المزاد');

    const item = new TextInputComponent()
      .setCustomId('sl3a')
      .setLabel(`عنوان السلعة التي تريد نشرها`)
      .setStyle('SHORT')
      .setRequired(true);
    const description = new TextInputComponent()
      .setCustomId('osf')
      .setLabel(`وصف السلعة التي وضعت عنوانها`)
      .setStyle('SHORT')
      .setRequired(true);

    const pics = new TextInputComponent()
      .setCustomId('pics')
      .setLabel(`رابط الصورة واحدة فقط ! ( اختياري )`)
      .setStyle('SHORT')
      .setRequired(false);
      

    const firstActionRowwww = new MessageActionRow().addComponents(item);
    const thhreee = new MessageActionRow().addComponents(description);
    const secondActionRowwww = new MessageActionRow().addComponents(pics);

    modal.addComponents(firstActionRowwww, thhreee, secondActionRowwww);

    await interaction.showModal(modal);
    }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isModalSubmit()) return;

  if (interaction.customId === 'mzadmodal') {
try {
      const sl3a = interaction.fields.getTextInputValue('sl3a');
      const osf = interaction.fields.getTextInputValue('osf');
      const pic = interaction.fields.getTextInputValue('pics');
    
    let roww = new MessageActionRow().addComponents(
            new MessageButton().setLabel(`نـشر المـزاد`).setStyle('SUCCESS').setCustomId("nshr"),
            new MessageButton().setLabel(`حـذف الـمزاد`).setStyle('DANGER').setCustomId("7thf"))
            let embed = new MessageEmbed()
            .setTitle(`**ســلـعــة جــديــدة**`)
            .addFields(
                {
                    name: `> **الـسلـعـة:**`,
                    value: `${sl3a}`,
                    inline: false
                },
                {
                    name: `> **وصـف الســلعـة:**`,
                    value: `${osf}`,
                    inline: false
                },
                {
                    name: `> **بـدايــة الـمـزايـدة:**`,
                    value: `30k`,
                    inline: false
                },
                {
                    name: `> **صــاحـب السـلعـة:**`,
                    value: `|| ${interaction.user} ||`,
                    inline: false
                }
            )
    .setFooter(interaction.guild.name, interaction.guild.iconURL())
    .setThumbnail(interaction.guild.iconURL())
    .setTimestamp();
        const chlog = client.channels.cache.get(config.Rooms.AuctionRoom);
    if(pic){
embed.setImage(pic)
    }
    await chlog.send({content: `**- تم نشر مزاد جديد من قبل ${interaction.user}**`, embeds: [embed],components: [roww]});
    await chlog.send({ files: [settings.ServerInfo.line] });

    if(config.line){
        await chlog.send({content: `${config.line}`})
    }
   await interaction.message.delete();
    await interaction.reply({embeds: [], components: [], content: `تـم ارسـال مـزادك فــي روم عـروض بـنـجـاح ✅
${interaction.user}`});

}catch(err){console.log(err)}
  }
});