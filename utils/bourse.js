const global = require('./global.js');
const scheduleDB = require("../database/schedule");
const responseDB = require("../database/response");
const orAction = require("../utils/orAction");

const { ActionRowBuilder, ButtonBuilder } = require("discord.js");

let participants = [];

let labels = [];
let cours = [];
let bonus = [];

const nbTurns = 15;
let turn = nbTurns;
let start = 100;
const rules = '- Vous avez **' + turn + ' tours** pour gagner le plus d\'argent possible\n' +
    '- Vous pouvez acheter ou vendre autant d\'actions que vous voulez à chaque tour\n' +
    '- Vous devez posséder les <:piece:1045638309235404860> nécessaires pour acheter des actions\n' +
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
            let message = '';

            // Get all responses
            const responses = await responseDB.getAllResponses(id);
            if (responses && responses.length > 0) {
                for (const response of responses) {
                    const responseValue = parseInt(response.response.split(';')[0]);
                    let responseGain = parseInt(response.response.split(';')[1]);
                    if (responseValue > 0) {
                        // Add money to user
                        await orAction.increment(response.id_user, responseValue * start);
                        responseGain += responseValue * start;
                    }

                    if (responseGain > 0) {
                        message += '📈 <@' + response.id_user + '> a gagné **' + responseGain + ' <:piece:1045638309235404860>** !\n';
                    } else {
                        message += '📉 <@' + response.id_user + '> a perdu **' + Math.abs(responseGain) + ' <:piece:1045638309235404860>** !\n';
                    }

                    if (participants.includes(response.id_user) === false) {
                        participants.push(response.id_user);
                    }
                }
            }

            let embed = global.createFullEmbed('La bourse est terminée', `Les dernières actions ont été vendues à **${start} <:piece:1045638309235404860> l'unité**.\n\n${message}`, thumbnail, await createChart(), null, null, false);
            await channel.send({ embeds: [embed] });

            await scheduleDB.setValue(id, null);
            await scheduleDB.setInactive(id);
            if(await global.deleteChannel(id, channel, participants)) {
                participants = [];
            }
            await responseDB.deleteAllResponses(id);
        }

        async function createBourse(channel, id) {
            if (turn > 0) {
                setTimeout(async () => {

                    const oldStart = start;

                    start = start + Math.floor(Math.random() * 60) - 30;
                    start = tryKrash(start);

                    start = Math.max(start, 25);
                    start = Math.min(start, 1000);

                    const b = await calculateBonus();

                    labels.push(nbTurns - turn);

                    let emoji = '📈';
                    if (start + b < oldStart) {
                        emoji = '📉';
                    }

                    let diff = start - oldStart;
                    if (diff > 0) {
                        diff = '+' + diff;
                    }

                    if (b >= 0) {
                        diff += ' +' + b;
                    } else {
                        diff += ' ' + b;
                    }

                    const percentageKrask = percentageKrash(start);
                    const krash = percentageKrask > 15 ? '⚠️ Attention, risque de krash estimé à **' + percentageKrask + '% !**\n' : '';

                    let embed = global.createFullEmbed('La bourse est ouverte (' + (nbTurns - turn + 1) + '/' + nbTurns + ')', `${emoji} La valeur de l'action est de **${start + b}** (*${ diff }*) <:piece:1045638309235404860>\n${krash}\n` + '(Changement de la valeur de l\'action <t:' + (Math.round(new Date().getTime() / 1000) + 60 * 1) + ':R>)', null, null, null, null, false);

                    start += b;
                    await scheduleDB.setValue(id, start);
                    cours.push(start);

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

                    await channel.send({embeds: [embed], components: [row]});
                    turn--;
                    await createBourse(channel, id);
                }, 1000 * 60);
            } else {
                setTimeout(async () => {
                    start = start + Math.floor(Math.random() * 60) - 30;
                    start = Math.max(start, 25);
                    start = Math.min(start, 1000);
                    cours.push(start);
                    labels.push(nbTurns - turn);
                    await endBourse(channel, id);
                }, 1000 * 60);
            }
        }

        function tryKrash(s) {
            const krash = Math.floor(Math.random() * 100);
            if (krash < percentageKrash(s)) {
                return 0;
            }
            return s;
        }

        function percentageKrash(s) {
            return Math.min(Math.round((s * s / 2500)), 25);
        }

        async function calculateBonus() {
            const responses = await responseDB.getAllResponses(id);
            if (responses && responses.length > 0) {
                let nbActions = 0;
                for (const response of responses) {
                    const responseValue = parseInt(response.response.split(';')[0]);
                    nbActions += responseValue;
                }
                bonus.unshift(nbActions);

                // choose a random number between 0 and 3
                const random = Math.floor(Math.random() * 4);
                if (bonus.length > random) {
                    let bonusValue = bonus[random];
                    bonusValue = Math.round(bonusValue / responses.length);
                    bonusValue = Math.min(bonusValue, 20);
                    bonusValue -= 10;
                    return bonusValue;
                }
            }
            return 0;
        }

        async function createChart() {
            const QuickChart = require('quickchart-js');
            const chart = new QuickChart();

            chart.setConfig({
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            type: 'line',
                            label: 'Valeur de l\'action',
                            data: cours,
                            borderColor: 'rgb(0,178,255)',
                            backgroundColor: 'rgba(0,178,255, 0.25)',
                            borderWidth: 1,
                            fill: 'start',
                            yAxisID: 'y',
                        },
                        {
                            type: 'bar',
                            label: 'Valeurs positives',
                            data: cours.map((value, index) => {
                                if (index === 0) {
                                    return 0;
                                }
                                return Math.max(value - cours[index - 1], 0);
                            }),
                            backgroundColor: 'rgb(0,255,0)',
                            yAxisID: 'y1',
                        },
                        {
                            type: 'bar',
                            label: 'Valeurs négatives',
                            data: cours.map((value, index) => {
                                if (index === 0) {
                                    return 0;
                                }
                                return Math.min(value - cours[index - 1], 0);
                            }),
                            backgroundColor: 'rgb(255,0,0)',
                            yAxisID: 'y1',
                        },
                    ]
                },
                options: {
                    scales: {
                        xAxes: [
                            {
                                stacked: true,
                            },
                        ],
                        yAxes: [
                            {
                                id: 'y',
                                type: 'linear',
                                position: 'left',
                                stacked: true,
                            },
                            {
                                id: 'y1',
                                type: 'linear',
                                position: 'right',
                                stacked: true,
                            }
                        ],
                    },
                }
            })
            .setWidth(800)
            .setHeight(400)
            .setBackgroundColor('transparent');

            // Print the chart URL
            return chart.getUrl();
        }

        labels = [];
        cours = [];
        bonus = [];
        turn = nbTurns;
        start = 100;
        setTimeout(async () => {
            await createBourse(channel, id);
        }, 1000 * 60);
    }
};