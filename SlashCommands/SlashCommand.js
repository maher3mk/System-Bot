const { client, db } = require('../index');
   
client.on('ready', async () => {
  await client.application.commands.set([
  {
    name : 'Warn seller', 
    type : 'MESSAGE'
  },


  ])
})