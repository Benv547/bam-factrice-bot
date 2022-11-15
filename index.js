// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');

const { Client, GatewayIntentBits, Collection} = require('discord.js');
const { token } = require('./token.json');

global.invites = new Collection();
global.semaphore = [];

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
    ],
});


// Commands Handler
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
}
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});


// Events Handler
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}


// Buttons Handler
client.buttons = new Collection();
const buttonsPath = path.join(__dirname, 'buttons');
const buttonFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith('.js'));

for (const file of buttonFiles) {
    const filePath = path.join(buttonsPath, file);
    const button = require(filePath);
    client.buttons.set(button.name, button);
}
client.on('interactionCreate', async interaction => {
    try {
        if (interaction.isButton()) {
            const button = client.buttons.get(interaction.customId.split('_')[0]);
            if (!button) return;

            try {
                await button.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({
                    content: 'There was an error while executing the button script !',
                    ephemeral: true
                });
            }
        } else {
            return;
        }
    }
    catch (error) {
        console.error(error);
    }
})


// Modals Handler
client.modals = new Collection();
const modalsPath = path.join(__dirname, 'modals');
const modalFiles = fs.readdirSync(modalsPath).filter(file => file.endsWith('.js'));

for (const file of modalFiles) {
    const filePath = path.join(modalsPath, file);
    const modal = require(filePath);
    client.modals.set(modal.name, modal);
}
client.on('interactionCreate', async interaction => {
    try {
        if(interaction.isModalSubmit()) {
            const modal = client.modals.get(interaction.customId.split('_')[0]);
            if(!modal) return;

            try {
                await modal.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error while executing the modal script !', ephemeral: true});
            }
        } else {
            return;
        }
    }
    catch (error) {
        console.error(error);
    }
})


// client.on('messageCreate', async message => {
//     console.log('test');
//     if (message.content.startsWith('!test')) {
//         console.log('test2')
//         await message.channel.send('test');
//     }
// })


// Login to Discord with your client's token
client.login(token);