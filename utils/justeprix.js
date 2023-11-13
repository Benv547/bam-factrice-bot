const global = require('./global.js');
const scheduleDB = require("../database/schedule");
const responseDB = require("../database/response");
const {ActionRowBuilder, ButtonBuilder} = require("discord.js");

let participants = [];

const mise = 10;
const gain = 500;
const rules = '- Le but est de deviner un nombre entier **entre 1 et 100 000**\n' +
    '- Vous pouvez donner autant de proposition que vous voulez à chaque tour\n' +
    '- Vous avez **3 minutes** pour trouver le nombre\n' +
    '- Chaque proposition vous coûte **' + mise + ' <:piece:1045638309235404860>**\n' +
    '- Si vous trouvez le nombre, vous gagnez **' + gain + ' <:piece:1045638309235404860>**\n';
const welcome = 'Bienvenue dans le **jeu du juste prix** !\n\n' +
    'Vous allez devoir **deviner le juste prix** que le bot a choisi.\n' +
    'Pour cela, vous devez donner des réponses et trouver le prix.\n\n' +
    'Bonne chance !';
const channel_name = '💳│juste_prix';
const event_name = 'Le juste prix';
const thumbnail = 'https://images.emojiterra.com/google/noto-emoji/unicode-15/color/256px/1f4b3.png';
const image = 'https://cdn.discordapp.com/attachments/1004073840093184000/1047240491974021120/Juste_Prix.png';

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

        // EVENT START IN 5 MINUTES
        setTimeout(async () => {

            // select a random number between 1 and 1000
            const value = Math.floor(Math.random() * 100000) + 1;
            await scheduleDB.setValue(id, value);

            // create the embed
            const embed = global.createFullEmbed(event_name, `Je pense à un nombre entre **1 et 100 000**, quel est le juste prix ?\n\n` + '(Résultat révélé <t:' + (Math.round(new Date().getTime() / 1000) + 60 * 3) + ':R>)', null, null, null, null, false);
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
                            texte += `📈 <@${response.id_user}> a gagné ${gain} <:piece:1045638309235404860> !\n`;
                        }

                        if (participants.includes(response.id_user) === false) {
                            participants.push(response.id_user);
                        }
                    }
                    embed.setDescription(texte);
                } else {
                    embed.setDescription('Personne n\'a joué !');
                }
                await channel.send({ embeds: [embed] });

                await scheduleDB.setValue(id, null);
                await scheduleDB.setInactive(id);
                if(await global.deleteChannel(id, channel, participants)) {
                    participants = [];
                }
                await responseDB.deleteAllResponses(id);
            }, 1000 * 60 * 3);


        }, 1000 * 60 * 2);
    }
};