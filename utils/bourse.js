const global = require('./global.js');
const scheduleDB = require("../database/schedule");
const responseDB = require("../database/response");
const orAction = require("../utils/orAction");

const { ActionRowBuilder, ButtonBuilder } = require("discord.js");
const recordDB = require("../database/record");

let participants = [];

let turn = 10;
let start = 100;
const rules = '- Vous avez **' + turn + ' tours** pour gagner le plus d\'argent possible\n' +
    '- Vous pouvez acheter ou vendre autant d\'actions que vous voulez à chaque tour\n' +
    '- Vous devez posséder les pièces d\'or nécessaires pour acheter des actions\n' +
    '- Toutes les actions achetées seront vendues automatiquement à la fin du dernier tour\n';
const welcome = 'Bienvenue à vous, **jeunes entrepreneurs** !\n\n' +
    'Vous êtes ici pour **investir dans notre entreprise** et gagner de l\'argent.\n' +
    'Pour cela, vous devez **acheter et vendre des actions** quand la bourse est ouverte.\n\n' +
    'Bonne chance !';
const channel_name = '📈│bourse';
const event_name = 'La bourse de Bouteille à la mer';
const thumbnail = 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/325/chart-increasing_1f4c8.png';
const image = 'https://cdn.discordapp.com/attachments/1004073840093184000/1047549105544634378/Bourse.png';

module.exports = {
    create: async (guild, id) => {

        // Set event active
        await scheduleDB.setActive(id);

        // Create channel
        const channel = await global.createChannel(guild, channel_name, welcome, image, id);
        // Create embed
        const embed = global.createFullEmbed(event_name, '**Le prochain tour va commencer <t:' + (Math.round(new Date().getTime() / 1000) + 60 * 2) + ':R> !**\n\n__**Rappel des règles :**__\n' + rules, thumbnail, null, null, null, false);
        // Send embed
        await channel.send({ embeds: [embed] });

        async function endBourse(channel, id) {

            // Get all responses
            const responses = await responseDB.getAllResponses(id);
            if (responses && responses.length > 0) {
                for (const response of responses) {
                    const value = parseInt(response.response);
                    if (value > 0) {
                        // Add money to user
                        await orAction.increment(response.id_user, value * start);
                    }

                    if (participants.includes(response.id_user) === false) {
                        participants.push(response.id_user);
                    }
                }
            }

            let embed = global.createFullEmbed('La bourse est terminée', `Les dernières actions ont été vendues à **${start} <:piece:1045638309235404860> l'unité**.`, thumbnail, null, null, null, false);
            await channel.send({ embeds: [embed] });

            await scheduleDB.setValue(id, null);
            await scheduleDB.setInactive(id);
            if(await global.deleteChannel(id, channel)) {
                const schedule = await scheduleDB.get(id);
                await recordDB.insertRecordWithDate(participants.length, 'event', schedule.start);
                participants = [];
            }
            await responseDB.deleteAllResponses(id);
        }

        async function createBourse(channel, id) {
            if (turn > 0) {
                setTimeout(async () => {

                    const oldStart = start;

                    start = start + Math.floor(Math.random() * 50) - 25;
                    start = Math.max(start, 25);
                    start = Math.min(start, 1000);
                    await scheduleDB.setValue(id, start);

                    let emoji = '📈';
                    if (start < oldStart) {
                        emoji = '📉';
                    }

                    let embed = global.createFullEmbed('La bourse est ouverte', `${emoji} La valeur de l'action est de **${start}** <:piece:1045638309235404860>\n\n` + '(Changement de la valeur de l\'action <t:' + (Math.round(new Date().getTime() / 1000) + 60 * 1) + ':R>)', null, null, null, null, false);
                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('bourse_buy')
                                .setLabel('Acheter')
                                .setStyle('Success'),
                            new ButtonBuilder()
                                .setCustomId('bourse_sell')
                                .setLabel('Vendre')
                                .setStyle('Danger'),
                        );

                    const message = await channel.send({embeds: [embed], components: [row]});
                    turn--;
                    await createBourse(channel, id);
                }, 1000 * 60);
            } else {
                start = start + Math.floor(Math.random() * 50) - 25;
                start = Math.max(start, 25);
                start = Math.min(start, 1000);
                setTimeout(async () => {
                    await endBourse(channel, id);
                }, 1000 * 60);
            }
        }

        turn = 10;
        start = 100;
        setTimeout(async () => {
            await createBourse(channel, id);
        }, 1000 * 60);
    }
};