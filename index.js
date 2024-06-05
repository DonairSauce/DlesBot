const { Client, GatewayIntentBits } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const cron = require('node-cron');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions] });

// Register slash commands
const commands = [
    {
        name: 'createthread',
        description: 'Manually create a thread for today’s results'
    }
];

const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);

rest.put(
    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
    { body: commands }
).then(() => console.log('Successfully registered application commands.'))
.catch(console.error);

client.once('ready', () => {
    console.log('Ready!');

    // Schedule a daily thread creation at 5 AM
    cron.schedule('0 5 * * *', () => {
        createThread();
    });
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'createthread') {
        await interaction.deferReply();
        createThread().then(response => {
            interaction.editReply(response);
        }).catch(error => {
            console.error('Error during thread creation:', error);
            interaction.editReply('Failed to create thread.');
        });
    }
});

function createThread() {
    return new Promise(async (resolve, reject) => {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        if (!guild) {
            reject('Failed to retrieve guild.');
            return;
        }

        const channel = guild.channels.cache.get(process.env.CHANNEL_ID);
        if (!channel) {
            reject('Failed to retrieve channel.');
            return;
        }

        const today = new Date();
        const dateString = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        channel.threads.create({
            name: `Results for ${dateString}`,
            autoArchiveDuration: 1440, // 1 day
            reason: 'Daily thread for discussions'
        }).then(thread => {
            console.log(`Created thread: ${thread.name}`);
            resolve(`Created thread: ${thread.name}`);
        }).catch(error => {
            console.error('Failed to create thread:', error);
            reject('Failed to create thread.');
        });
    });
}

client.login(process.env.BOT_TOKEN);