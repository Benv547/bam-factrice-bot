const global = require('./global.js');
const scheduleDB = require("../database/schedule");
const responseDB = require("../database/response");
const orAction = require("../utils/orAction");

const rouleaux1 = [
    '🍋',
    '🔥',
    '🍒',
    '🍫',
    '🍋',
    '🍒',
    '🍋',
    '🍋',
    '🍒',
    '🍋',
    '🍫',
];

const rouleaux2 = [
    '🍋',
    '🍒',
    '🔥',
    '🍋',
    '🍒',
    '🍋',
    '🍫',
    '🍒',
    '🍋',
    '🍋',
    '🍒',
];

const rouleaux3 = [
    '🍋',
    '🍫',
    '🍋',
    '🍒',
    '🍋',
    '🔥',
    '🍒',
    '🍋',
    '🍫',
    '🍋',
    '🍒',
];

const { ActionRowBuilder, ButtonBuilder, ComponentType } = require('discord.js');

let participants = [];

const mise = 100;
const rules = '- Vous devez au minimum miser **' + mise + ' <:piece:1045638309235404860>** pour jouer\n\n' +
            '**Les gains sont les suivants :**\n' +
            '- **🍒 x 2** : 2 x MISE\n' +
            '- **🍫 x 2** : 3 x MISE\n' +
            '- **🔥 x 2** : 4 x MISE\n' +
            '- **🍋 x 3** : 1 x MISE\n' +
            '- **🍒 x 3** : 5 x MISE\n' +
            '- **🍫 x 3** : 10 x MISE\n' +
            '- **🔥 x 3** : 50 x MISE\n';

const welcome = 'Bienvenue dans le casino de **Bouteille à la mer** !\n\n' +
    'Vous êtes ici pour tenter de gagner de l\'argent.\n' +
    'Pour cela, vous pourrez jouer sur différentes machines à sous.\n\n' +
    'Bonne chance !';
const channel_name = '💸│casino';
const event_name = 'Machines à sous';
const thumbnail = 'https://images.emojiterra.com/google/noto-emoji/unicode-15/color/256px/1f4b0.png';
const image = 'https://cdn.discordapp.com/attachments/1004073840093184000/1172697849054642226/machine_a_sous.png';

// Display machine a sous
//  |4 3 2|
//  /-----\
// | 5 6 1 |
//  \-----/
//  |7 8 9|
function displayMachineASous(mise, gain_total = 0, mise_total = 0) {
    // Choose random number for each rouleau
    // And display other numbers around

    // Choose random number for each rouleau
    const rouleau1 = rouleaux1[Math.floor(Math.random() * rouleaux1.length)];
    const rouleau2 = rouleaux2[Math.floor(Math.random() * rouleaux2.length)];
    const rouleau3 = rouleaux3[Math.floor(Math.random() * rouleaux3.length)];

    // Display other following numbers around
    const rouleau4 = rouleaux1[(rouleaux1.indexOf(rouleau1) + 1) % rouleaux1.length];
    const rouleau5 = rouleaux2[(rouleaux2.indexOf(rouleau2) + 1) % rouleaux2.length];
    const rouleau6 = rouleaux3[(rouleaux3.indexOf(rouleau3) + 1) % rouleaux3.length];
    const rouleau7 = rouleaux1[(rouleaux1.indexOf(rouleau1) + rouleaux1.length - 1) % rouleaux1.length];
    const rouleau8 = rouleaux2[(rouleaux2.indexOf(rouleau2) + rouleaux2.length - 1) % rouleaux2.length];
    const rouleau9 = rouleaux3[(rouleaux3.indexOf(rouleau3) + rouleaux3.length - 1) % rouleaux3.length];

    const win = calculateWin(mise, rouleau1, rouleau2, rouleau3);

    // Display machine a sous
    let machine = '**[ MACHINE ]**\n' +
    '--------------\n' +
    rouleau4 + '  :  ' + rouleau5 + '  :  ' + rouleau6 + '\n' +
    '\n' +
    rouleau1 + '  :  ' + rouleau2 + '  :  ' + rouleau3 + ' **<**\n' +
    '\n' +
    rouleau7 + '  :  ' + rouleau8 + '  :  ' + rouleau9 + '\n' +
    '--------------\n' +
    '| : : : : 🎰 : : : : |\n' +
    '\n';
    if (mise > 0) {
        machine += 'Mise : **' + mise + ' <:piece:1045638309235404860>**\n' +
        'Gain : **' + win + ' <:piece:1045638309235404860>**\n\n' + 
        'Mise total : **' + mise_total + ' <:piece:1045638309235404860>**\n' + 
        'Gain total : **' + (gain_total + win) + ' <:piece:1045638309235404860>**\n';
    }

    return [machine, win];
}

function calculateWin(mise, rouleau1, rouleau2, rouleau3) {
    let win = 0;
    if (rouleau1 === rouleau2 && rouleau2 === rouleau3) {
        if (rouleau1 === '🍋') {
            win = mise;
        } else if (rouleau1 === '🍒') {
            win = 5 * mise;
        } else if (rouleau1 === '🍫') {
            win = 10 * mise;
        } else if (rouleau1 === '🔥') {
            win = 50 * mise;
        }
    } else if (rouleau1 === rouleau2 || rouleau2 === rouleau3 || rouleau1 === rouleau3) {
        let rouleauToCheck = rouleau1;
        if (rouleau1 === rouleau2 || rouleau1 === rouleau3) {
            rouleauToCheck = rouleau1;
        } else if (rouleau2 === rouleau3) {
            rouleauToCheck = rouleau2;
        }

        if (rouleauToCheck === '🍒') {
            win = 2 * mise;
        } else if (rouleauToCheck === '🍫') {
            win = 3 * mise;
        } else if (rouleauToCheck === '🔥') {
            win = 4 * mise;
        }

    }
    return win;
}

module.exports = {
    create: async (guild, id) => {

        // Set event active
        await scheduleDB.setActive(id);
        // Create channel
        const channel = await global.createChannel(guild, channel_name, welcome, image, id);

        // Create button to launch machine à sous
        const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('machine')
                        .setLabel('Ouvrir une machine à sous')
                        .setStyle('Primary'),
                );

        // Create embed
        const embed = global.createFullEmbed(event_name, '**Vous voulez jouer ?**\n\n__**Rappel des règles :**__\n' + rules, thumbnail, null, null, null, false);
        // Send embed
        const message = await channel.send({ embeds: [embed], components: [row] });

        // Create collector
        // 1. Create a collector
        // 2. Send a message with the machine a sous display and button to reroll it
        // 3. When the button is clicked, reroll the machine a sous display
        const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 1000 * 60 * 60 });
        collector.on('collect', async i => {
            if (i.customId === 'machine') {

                if (participants.includes(i.user.username)) {
                    await i.reply({ content: 'Vous avez déjà une machine à sous.', ephemeral: true });
                    return;
                }
                participants.push(i.user.username);
                
                // Send a new machine a sous display
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('machine_1')
                            .setLabel(mise + ' x1')
                            .setStyle('Success'),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('machine_5')
                            .setLabel(mise + ' x5')
                            .setStyle('Primary'),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('machine_10')
                            .setLabel(mise + ' x10')
                            .setStyle('Danger'),
                    );


                // Create embed
                const [machine, _] = displayMachineASous(0);
                const embed = global.createFullEmbed("Machine à sous de " + i.user.username, machine, null, null, null, null, false);

                // Send embed
                const message = await channel.send({ embeds: [embed], components: [row] });

                // Create collector
                const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 1000 * 60 * 60 });
                // When the button is clicked, reroll the machine a sous display
                collector.on('collect', async i => {
                    const customId_type = i.customId.split('_')[1];
                    const miseMultiplier = parseInt(customId_type);
                    if (i.customId.startsWith('machine_') && i.user.username === message.embeds[0].title.replace('Machine à sous de ', '')) {
                        if (!await orAction.reduce(i.user.id, mise * miseMultiplier)) {
                            return await i.reply({ content: 'Vous n\'avez pas assez d\'argent pour jouer sur cette machine à sous.', ephemeral: true });
                        }
                        // get mise total and gain total from embed
                        let mise_total = 0;
                        let gain_total = 0;

                        const description = message.embeds[0].description;
                        const lines = description.split('\n');
                        for (const line of lines) {
                            if (line.startsWith('Mise total')) {
                                mise_total = parseInt(line.split('**')[1]);
                            } else if (line.startsWith('Gain total')) {
                                gain_total = parseInt(line.split('**')[1]);
                            }
                        }

                        const [machine, win] = displayMachineASous(mise * miseMultiplier, gain_total, mise_total + mise * miseMultiplier);
                        const embed = global.createFullEmbed("Machine à sous de " + i.user.username, machine, null, null, null, null, false);
                        if (win > 0) {
                            await orAction.increment(i.user.id, win);
                        }
                        await i.update({ embeds: [embed] });
                    } else {
                        await i.reply({ content: 'Vous ne pouvez pas jouer sur cette machine à sous.', ephemeral: true });
                    }
                });
            }
            await i.deferUpdate();
        });

        // wait 5 minute
        setTimeout(async () => {

            await scheduleDB.setInactive(id);
            if(await global.deleteChannel(id, channel, participants)) {
                participants = [];
            }
            await responseDB.deleteAllResponses(id);
        }, 1000 * 60 * 5);
    },
};