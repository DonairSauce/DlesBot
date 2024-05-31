const { Client, GatewayIntentBits } = require('discord.js');
const cron = require('node-cron');
console.log(process.env.BOT_TOKEN);
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.once('ready', () => {
    console.log('Ready!');

    // Schedule a daily thread creation at 5 AM
    cron.schedule('0 5 * * *', () => {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        const channel = guild.channels.cache.get(process.env.CHANNEL_ID);
        // Generate today's date string 
        const today = new Date();
        const dateString = today.toLocaleDateString('en-US', {year:'numeric', month:'long',day:'numeric'});

        channel.threads.create({
            name: `Results for ${dateString}`,
            autoArchiveDuration: 1440, // 1 day
            reason: 'Daily thread for discussions'
        }).then(thread => console.log(`Created thread: ${thread.name}`))
        .catch(console.error);
    });
});
console.log(process.env.BOT_TOKEN);
client.login(process.env.BOT_TOKEN);
