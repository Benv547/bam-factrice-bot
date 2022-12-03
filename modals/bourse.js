const scheduleDB = require("../database/schedule");
const responseDB = require("../database/response");
const userDB = require("../database/user");
const orAction = require("../utils/orAction");

module.exports = {
    name: 'bourse',
    async execute(interaction) {
        const bourseType = interaction.customId.split('_')[1];
        const valueString = interaction.fields.getTextInputValue('bourse');
        let value = -1;
        try {
            value = parseInt(valueString);
        } catch (e) {
            return await interaction.reply({ content: 'Veuillez entrer un nombre.', ephemeral: true });
        }

        const events = await scheduleDB.getNowSchedulesActive();
        if (!events || events.length === 0) {
            return await interaction.reply({content: "Il n'y a pas d'événement en cours.", ephemeral: true});
        }

        const userId = await userDB.getUser(interaction.user.id);
        if (userId == null) {
            // Add the user to the database
            await userDB.createUser(interaction.user.id, 0, 0);
        }

        const event = events[0];
        let responseValue = 0;
        let responseGain = 0;
        const response = await responseDB.getUserResponse(event.id, interaction.user.id);
        if (!response) {
            await responseDB.createResponse(event.id, interaction.user.id, responseValue + ';' + responseGain);
        } else {
            responseValue = parseInt(response.response.split(';')[0]);
            responseGain = parseInt(response.response.split(';')[1]);
        }

        const mise = parseInt(event.value) * value;
        if (bourseType === 'buy') {
            if (!await orAction.reduce(interaction.user.id, mise)) {
                return await interaction.reply({content: `Vous n'avez pas assez d'or pour jouer. Il vous faut **au moins ${mise} <:piece:1045638309235404860>**.`, ephemeral: true});
            }
            await responseDB.updateResponse(event.id, interaction.user.id, (responseValue + value) + ';' + (responseGain - mise));
            return await interaction.reply({content: `Vous avez acheté **${value}** action(s) pour **${mise}** <:piece:1045638309235404860>.\nVous avez maintenant **${responseValue + value}** action(s) et votre gain est de **${responseGain - mise}** <:piece:1045638309235404860>.`, ephemeral: true});
        } else {
            if (responseValue < value) {
                return await interaction.reply({content: `Vous ne pouvez pas vendre plus que ce que vous avez acheté.`, ephemeral: true});
            }
            await orAction.increment(interaction.user.id, mise);
            await responseDB.updateResponse(event.id, interaction.user.id, (responseValue - value) + ';' + (responseGain + mise));
            return await interaction.reply({content: `Vous avez vendu **${value}** action(s) pour **${mise}** <:piece:1045638309235404860>.\nVous avez maintenant **${responseValue - value}** action(s) et votre gain est de **${responseGain + mise}** <:piece:1045638309235404860>.`, ephemeral: true});
        }
    }
};