const global = require('./global.js');
const scheduleDB = require("../database/schedule");
const responseDB = require("../database/response");
const {ActionRowBuilder, ButtonBuilder} = require("discord.js");
const orAction = require("./orAction");

const mise = 10;
const rules = 'Le but du jeu est de **deviner le juste prix** que le bot a choisi.\n\n' +
    'Vous avez **2 minutes** pour donner vos réponses (chaque réponse coûte **' + mise + ' pièces d\'or**).';
const welcome = 'Bienvenue dans le jeu du **Juste Prix** !';
const channel_name = '💰│juste_prix';
const event_name = 'Le juste prix';
const thumbnail = 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/325/money-bag_1f4b0.png';
const gain = 500;

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

            // select a random number between 1 and 100 000
            const value = Math.floor(Math.random() * 10000) + 1;
            await scheduleDB.setValue(id, value);

            // create the embed
            const embed = global.createFullEmbed(event_name, `Je pense à un nombre entre 1 et 10 000, quel est le juste prix ?`, null, null, null, null, false);
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('justeprix')
                        .setLabel('Répondre')
                        .setStyle('Primary'),
                );
            // send the embed
            const message = await channel.send({ embeds: [embed], components: [row] });

            // wait 1 minute
            setTimeout(async () => {

                await message.edit({ components: [] });

                // get all responses
                const responses = await responseDB.getAllResponses(id);
                if (responses !== null && responses.length > 0) {

                    let texte = `Le juste prix était **${value}**.\n\n`;

                    for (const response of responses) {
                        const responseValue = parseInt(response.response);
                        if (responseValue === value) {
                            texte += `📈 <@${response.id_user}> a gagné ${gain} pièces d'or !\n`;
                        }
                    }
                    embed.setDescription(texte);
                } else {
                    embed.setDescription('Personne n\'a joué !');
                }
                await channel.send({ embeds: [embed] });

                await scheduleDB.setValue(id, null);
                await scheduleDB.setInactive(id);
                await global.deleteChannel(id, channel);
                await responseDB.deleteAllResponses(id);
            }, 1000 * 60);


        }, 1000 * 60);
    }
};