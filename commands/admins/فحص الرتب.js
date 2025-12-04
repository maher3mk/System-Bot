const { Intents, Collection, Client, GuildMember, MessageActionRow, WebhookClient, MessagePayload, GatewayIntentBits, MessageSelectMenu, Modal, MessageEmbed, MessageButton, MessageAttachment, Permissions, TextInputComponent } = require('discord.js');
const { client, db, dbpoint, settings } = require('../../index');
const { createEmbed } = require('../../function/function/Embed');
const moment = require('moment');

client.on('messageCreate', async message => {
    if (message.content.startsWith(settings.prefix + 'mr')) {
        if (!message.member.roles.cache.has(settings.Admins.DiscordLeder)) {
            return message.reply("You do not have permission to use this command.");
        }
        try {
            let role;
            if (message.mentions.roles.size > 0) {
                role = message.mentions.roles.first();
            } else {
                const roleId = message.content.split(/\s+/)[1];
                if (!roleId) return message.reply("Please mention a role or provide a role ID.");
                role = message.guild.roles.cache.get(roleId);
                if (!role) return message.reply("The role does not exist.");
            }

            await message.guild.members.fetch();
            let map = role.members.map(rr => `**<@${rr.id}> (${rr.id})**`).join("\n");
            const embed = createEmbed({
                interaction: message,
                title: `Info About \`${role.name}\` `,
                description: `**Members Count Have This Role:** \`${role.members.size}\`\n
                **Members :**\n
                ${map}\n
                **Role Is Created At :** \`${moment(role.createdAt).format('DD/MM/YYYY h:mm')}\``
            });

            await message.reply({ embeds: [embed] });

        } catch (err) {
            console.error("An error occurred:", err);
            message.reply("An error occurred while executing the command. Please check the console for more details.");
        }
    }
});
