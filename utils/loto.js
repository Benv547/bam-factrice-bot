const global = require('./global.js');
const scheduleDB = require("../database/schedule");
const responseDB = require("../database/response");
const orAction = require("../utils/orAction");

const { ActionRowBuilder, ButtonBuilder } = require("discord.js");

const mise = 100;
const number = 5;
const rules = 'Le but du jeu est de trouver les **' + number + ' nombres gagnants**.\n' +
    'Pour cela, vous devez **remplir une grille** de ' + number + ' nombres allant de **1 à 99** (*ex: 1 - 2 - 3 - ...*).\n\n' +
    'Pour jouer, il vous faut **au moins ' + mise + ' pièce(s) d\'or**.\n';
const welcome = 'Bienvenue dans le jeu du **Loto** !';
const channel_name = '💸│loto';
const event_name = 'Loto';
const thumbnail = 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/325/money-with-wings_1f4b8.png';

module.exports = {
    create: async (guild, id) => {

        // Set event active
        await scheduleDB.setActive(id);

        // Create channel
        const channel = await global.createChannel(guild, channel_name, welcome);
        // Create embed
        const embed = global.createFullEmbed(event_name, '**Le prochain tour va commencer dans 5 minutes !**\n\n__**Rappel des règles :**__\n' + rules, thumbnail, null, null, null, false);
        // Send embed
        await channel.send({ embeds: [embed] });

        // EVENT START IN 5 MINUTES
        setTimeout(async () => {

            // create the embed
            const embed = global.createFullEmbed(event_name, `**Le tirage sera effectué dans 5 minutes !**`, null, null, null, null, false);
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('loto')
                        .setLabel('Donner une grille')
                        .setStyle('Primary'),
                );

            // send the embed
            const message = await channel.send({ embeds: [embed], components: [row] });

            // wait 1 minute
            setTimeout(async () => {

                // remove buttons from message
                await message.edit({ components: [] });
                let embed = global.createFullEmbed('**Résultat de la partie :**', "", null, null, null, null, false);

                // get all responses
                const responses = await responseDB.getAllResponses(id);
                if (responses !== null && responses.length > 0) {

                    // get 5 numbers between 1 and 99
                    const numbers = [];
                    for (let i = 0; i < number; i++) {
                        let number = Math.floor(Math.random() * 99) + 1;
                        while (numbers.includes(number)) {
                            number = Math.floor(Math.random() * 99) + 1;
                        }
                        numbers.push(number);
                    }
                    let texte = `**Les numéros gagnants sont :**\n`;
                    for (let i = 0; i < numbers.length; i++) {
                        texte += numbers[i] + ' - ';
                    }
                    texte = texte.substring(0, texte.length - 3);
                    texte += '\n\n';

                    for (const response of responses) {

                        const responseNumbers = response.response.split('-');
                        const responseNumbersInt = [];
                        for (let i = 0; i < responseNumbers.length; i++) {
                            responseNumbersInt.push(parseInt(responseNumbers[i]));
                        }
                        const distinctNumbers = [...new Set(responseNumbersInt)];

                        let count = 0;
                        for (let i = 0; i < distinctNumbers.length; i++) {
                            if (numbers.includes(distinctNumbers[i])) {
                                count++;
                            }
                        }

                        if (count > 0) {
                            texte += `📈 <@${response.id_user}> a gagné ${mise*(2 * count * count)} pièces d'or !\n`;
                            await orAction.increment(response.id_user, mise * (2 * count * count));
                        } else {
                            texte += `📉 <@${response.id_user}> a perdu ${mise} pièces d'or !\n`;
                        }
                    }
                    embed.setDescription(texte);
                } else {
                    embed.setDescription('Personne n\'a joué !');
                }
                await channel.send({ embeds: [embed] });

                await scheduleDB.setInactive(id);
                await global.deleteChannel(id, channel);
                await responseDB.deleteAllResponses(id);
            }, 1000 * 60 * 5);


        }, 1000 * 60 * 5);
    },
};