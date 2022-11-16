const global = require('./global.js');
const scheduleDB = require("../database/schedule");
const responseDB = require("../database/response");
const orAction = require("../utils/orAction");

const { ActionRowBuilder, ButtonBuilder } = require("discord.js");

const playing_card_value = ['AS', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'VALET', 'DAME', 'ROI'];
const playing_card_color = ['PIQUE', 'COEUR', 'CARREAU', 'TREFLE'];


const rules = 'Le but du jeu est **de deviner si la carte suivante sera plus ou moins forte** que la précédente.\n' +
        '**Pour jouer**, il suffit de cliquer sur le bouton correspondant à votre choix (*plus, égal ou moins*).\n\n' +
        'Vous aurez **5 minutes pour jouer** et vous devez miser **100 pièces d\'or**.\n\n';
const welcome = 'Bienvenue dans le jeu du **Plus ou Moins** !';
const channel_name = '🧮│plus_ou_moins';
const event_name = 'Plus ou Moins';
const thumbnail = 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/325/abacus_1f9ee.png';
const mise = 100;

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

            // select a random card
            const value = playing_card_value[Math.floor(Math.random() * playing_card_value.length)];
            const color = playing_card_color[Math.floor(Math.random() * playing_card_color.length)];

            // create the embed
            const embed = global.createFullEmbed(event_name, `La carte est le **${value} de ${color}**, quelle sera la suivante ?`, null, null, null, null, false);
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('plusmoins_plus')
                        .setLabel('Plus')
                        .setStyle('Success'),
                    new ButtonBuilder()
                        .setCustomId('plusmoins_egal')
                        .setLabel('Egal')
                        .setStyle('Secondary'),
                    new ButtonBuilder()
                        .setCustomId('plusmoins_moins')
                        .setLabel('Moins')
                        .setStyle('Danger'),
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

                    const nextValue = playing_card_value[Math.floor(Math.random() * playing_card_value.length)];
                    const nextColor = playing_card_color[Math.floor(Math.random() * playing_card_color.length)];
                    let texte = `La carte tirée est le **${nextValue} de ${nextColor}**.\n\n`;

                    let resp = "plus";
                    if (value === nextValue) {
                        resp = "egal";
                    } else if (playing_card_value.indexOf(value) > playing_card_value.indexOf(nextValue)) {
                        resp = "moins";
                    }

                    for (const response of responses) {
                        if (response.response === resp) {
                            texte += `📈 <@${response.id_user}> a gagné ${mise} pièces d'or !\n`;
                            await orAction.increment(response.id_user, mise*2);
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