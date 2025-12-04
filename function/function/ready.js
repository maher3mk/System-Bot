const registerWarnCommand = require('../../SlashCommands/SlashCommand'); 
module.exports = (client, chalk) => {
   client.on('ready', async () => {
    console.log(chalk.yellow(`${client.user.tag} is ready`));
    client.user.setPresence({
        status: 'idle', 
        activities: [{
            name: 'Trust Bot',
            type: 'WATCHING' 
        }]
    });
}); 
}