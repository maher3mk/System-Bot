// const { Client, Intents, MessageActionRow, Modal, TextInputComponent, MessageEmbed, MessageButton } = require('discord.js');
// const { client, db, settings } = require('../../index');
// const config = require('../../config/settings');  // تأكد من ضبط المسار حسب الحاجة
// const { CronJob } = require('cron'); // Import CronJob

// const kimomazad = settings.Admins.DiscordLeder;
// const auctions = {};

// client.on('messageCreate', async (message) => {
//     if (message.content === '!مزاد') {
//         if (!message.member.roles.cache.has(kimomazad)) {
//             return;
//         }
//         const button = new MessageButton()
//             .setCustomId('startAuction')
//             .setLabel('بدء المزاد')
//             .setStyle('SUCCESS');

//         const row = new MessageActionRow().addComponents(button);

//         await message.reply({ content: 'اضغط علي الزر لانشاء المزاد.', components: [row] });
//     }
// });

// client.on('interactionCreate', async (interaction) => {
//     if (interaction.isButton()) {
//         if (interaction.customId === 'startAuction') {
//             const modal = new Modal()
//                 .setCustomId('startAuctionModal')
//                 .setTitle('Start Auction');

//             const itemInput = new TextInputComponent()
//                 .setCustomId('itemInput')
//                 .setLabel("السلعه")
//                 .setStyle('SHORT')
//                 .setPlaceholder('اكتب اسم السلعه.');

//             const startingBidInput = new TextInputComponent()
//                 .setCustomId('startingBidInput')
//                 .setLabel("السعر المبدئي")
//                 .setStyle('SHORT')
//                 .setPlaceholder('اكتب سعر المبدئي (بالارقام فقط).');

//             const durationInput = new TextInputComponent()
//                 .setCustomId('durationInput')
//                 .setLabel("زمن المزاد")
//                 .setStyle('SHORT')
//                 .setPlaceholder('اكتب زمن المزاد بالدقائق مثال (1m , 20m)');

//             const imageInput = new TextInputComponent()
//                 .setCustomId('imageInput')
//                 .setLabel("صورة السلعة")
//                 .setStyle('SHORT')
//                 .setPlaceholder('صورة السلعة اذا لم يكن لديك اكتب 0');

//             const row1 = new MessageActionRow().addComponents(itemInput);
//             const row2 = new MessageActionRow().addComponents(startingBidInput);
//             const row3 = new MessageActionRow().addComponents(durationInput);
//             const row4 = new MessageActionRow().addComponents(imageInput);

//             modal.addComponents(row1, row2, row3, row4);

//             await interaction.showModal(modal);
//         }

//         if (interaction.customId === 'placeBid') {
//             const modal = new Modal()
//                 .setCustomId('bidModal')
//                 .setTitle('Place Your Bid');

//             const priceInput = new TextInputComponent()
//                 .setCustomId('priceInput')
//                 .setLabel("سـعـرك")
//                 .setStyle('SHORT')
//                 .setPlaceholder('أدخل السعر الخاص بك (ارقام فقط)');

//             const row = new MessageActionRow().addComponents(priceInput);
//             modal.addComponents(row);

//             await interaction.showModal(modal);
//         }
//     }

//     if (interaction.customId === 'startAuctionModal') {
//         const item = interaction.fields.getTextInputValue('itemInput');
//         const startingBid = parseFloat(interaction.fields.getTextInputValue('startingBidInput'));
//         const duration = parseInt(interaction.fields.getTextInputValue('durationInput'));
//         const image = interaction.fields.getTextInputValue('imageInput');

//         const channel = client.channels.cache.get(config.Rooms.PublishedAuctions); // Directly get the channel by ID

//         if (!item || isNaN(startingBid) || isNaN(duration) || duration <= 0) {
//             return interaction.reply({ content: 'لقد وضعت شيء خاطئ حاول مجددا.', ephemeral: true });
//         }

//         if (!channel) {
//             return interaction.reply({ content: 'روم المزاد خاطئ تأكد من الاسم او الأيدي.', ephemeral: true });
//         }

//         auctions[channel.id] = {
//             item,
//             highestBid: startingBid,
//             highestBidder: null,
//             bids: [],
//             endTime: Date.now() + duration * 60000,
//             image: image === '0' ? null : image
//         };

//         const { embeds, components } = await createAuctionEmbed(item, startingBid, duration, image === '0' ? null : image);
//         const auctionMessage = await channel.send({ embeds, components });

//         auctions[channel.id].messageId = auctionMessage.id;

//         const job = new CronJob(new Date(Date.now() + duration * 60000), () => {
//             endAuction(channel.id);
//         });
//         job.start();

//         await interaction.reply({ content: 'تم بدأ المزاد بنجاح !', ephemeral: true });
//     }

//     if (interaction.customId === 'bidModal') {
//         const auction = auctions[interaction.channel.id];
//         if (!auction) {
//             return interaction.reply({ content: 'لقد انتهي المزاد بالفعل.', ephemeral: true });
//         }

//         const newPrice = parseFloat(interaction.fields.getTextInputValue('priceInput'));
//         if (isNaN(newPrice) || newPrice <= auction.highestBid) {
//             return interaction.reply({ content: 'حدث خطأ يجب أن تضع رقم أعلي من أعلي سعر للمزايدة.', ephemeral: true });
//         }

//         auction.highestBid = newPrice;
//         auction.highestBidder = interaction.user.id;
//         auction.bids.push({ bidder: interaction.user.username, amount: newPrice });
//         await updateAuctionEmbed(interaction.channel, auction);
//         await interaction.reply({ content: `انت الأن صاحب اعلي مزايدة للآن السعر الذي وضعته : ${newPrice}k`, ephemeral: true });
//     }
// });

// async function createAuctionEmbed(item, startingBid, duration, image) {
//     if (!item || isNaN(startingBid) || !duration) {
//         console.error("Invalid parameters provided.");
//         return;
//     }

//     const server = client.guilds.cache.first(); // Get the first guild
//     const serverPfp = server ? server.iconURL() : null; // Get server's profile picture

//     const auctionEmbed = new MessageEmbed()
//         .setColor('#0099ff')
//         .setTitle('مـزاد جـديـد')
//         .setDescription('زايد علي هذه السلعة !')
//         .addFields(
//             { name: 'السلعه:', value: item || 'لا يوجد', inline: true },
//             { name: 'السعر المبدئي:', value: `${startingBid}k`, inline: true },
//             { name: 'أعلي سعر مزايدة:', value: `${startingBid}k`, inline: true },
//             { name: 'صاحب أعلي سعر مزايدة:', value: 'لا يوجد مزايدات بعد', inline: true },
//             { name: 'ينتهي في:', value: `<t:${Math.floor((Date.now() + duration * 60000) / 1000)}:R>`, inline: true }
//         )
//         .setThumbnail(serverPfp)
//         .setImage(image || "https://media.discordapp.net/attachments/1221887365182914570/1221887502382792824/20240325_212004.png?ex=66d165aa&is=66d0142a&hm=d098dd684eb2743c12ae4144364d3bcdda707765c41faac1a706108bbb87616d&format=webp&quality=lossless&width=1439&height=525&")

//     const placeBidButton = new MessageButton()
//         .setCustomId('placeBid')
//         .setLabel('مزايدة')
//         .setStyle('PRIMARY');

//     const row = new MessageActionRow().addComponents(placeBidButton);

//     return { embeds: [auctionEmbed], components: [row] };
// }

// async function updateAuctionEmbed(channel, auction) {
//     const message = await channel.messages.fetch(auction.messageId);
//     if (!message) return;

//     const server = client.guilds.cache.first(); // Get the first guild
//     const serverPfp = server ? server.iconURL() : null; // Get server's profile picture

//     const auctionEmbed = new MessageEmbed()
//         .setColor('#0099ff')
//         .setTitle('مـزاد جـديـد')
//         .setDescription('زايد علي هذه السلعة !')
//         .addFields(
//             { name: 'السلعه:', value: auction.item, inline: false },
//             { name: 'أعلي سعر مزايدة:', value: `${auction.highestBid}k`, inline: false },
//             { name: 'صاحب أعلي سعر مزايدة:', value: auction.highestBidder ? `<@${auction.highestBidder}>` : 'لا يوجد مزايدات بعد', inline: false },
//             { name: 'ينتهي في:', value: `<t:${Math.floor(auction.endTime / 1000)}:R>`, inline: false }
//         )
//         .setThumbnail(serverPfp)
//         .setImage(auction.image || "https://media.discordapp.net/attachments/1221887365182914570/1221887502382792824/20240325_212004.png?ex=66d165aa&is=66d0142a&hm=d098dd684eb2743c12ae4144364d3bcdda707765c41faac1a706108bbb87616d&format=webp&quality=lossless&width=1439&height=525&")

//     const placeBidButton = new MessageButton()
//         .setCustomId('placeBid')
//         .setLabel('مزايدة')
//         .setStyle('PRIMARY');

//     const row = new MessageActionRow().addComponents(placeBidButton);

//     await message.edit({ embeds: [auctionEmbed], components: [row] });
// }

// async function endAuction(auctionId) {
//     const auction = auctions[auctionId];
//     if (!auction) return;

//     const channel = client.channels.cache.get(auctionId);
//     if (!channel) return;

//     const message = await channel.messages.fetch(auction.messageId);
//     if (!message) return;

//     const resultEmbed = new MessageEmbed()
//         .setColor('#0099ff')
//         .setTitle('نتيجة المزاد')
//         .addFields(
//             { name: 'السلعه:', value: auction.item, inline: false },
//             { name: 'أعلي سعر مزايدة:', value: `${auction.highestBid}k`, inline: false },
//             { name: 'صاحب أعلي سعر مزايدة:', value: auction.highestBidder ? `<@${auction.highestBidder}>` : 'لا يوجد مزايدات بعد', inline: false },
//             { name: 'انتهي في:', value: `<t:${Math.floor(auction.endTime / 1000)}:R>`, inline: false }
//         )
//         .setThumbnail(await client.users.fetch(auction.highestBidder).then(user => user.displayAvatarURL()) || null)
//         .setFooter('شكرا للمشاركة!');

//     await message.edit({ embeds: [resultEmbed], components: [] });
//     delete auctions[auctionId];
// }
