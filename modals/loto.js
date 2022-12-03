const scheduleDB = require("../database/schedule");
const responseDB = require("../database/response");
const userDB = require("../database/user");
const orAction = require("../utils/orAction");

const mise = 100;
const number = 5;

module.exports = {
    name: 'loto',
    async execute(interaction) {
        const valueString = interaction.fields.getTextInputValue('loto');

        const events = await scheduleDB.getNowSchedulesActive();
        if (!events || events.length === 0) {
            return await interaction.reply({content: "Il n'y a pas d'événement en cours.", ephemeral: true});
        }

        // ([0-9]{1,2} ?- ?){" + str(number-1) + "}[0-9]{1,2}
        const regex = new RegExp("^([0-9]{1,2} ?- ?){" + (number-1) + "}[0-9]{1,2}$");
        if (!regex.test(valueString)) {
            return await interaction.reply({content: `Veuillez entrer ${number} nombres séparés par des tirets pour votre grille.\n(*Exemple: 1 - 2 - 3 - ...*)`, ephemeral: true});
        }

        const userId = await userDB.getUser(interaction.user.id);
        if (userId == null) {
            // Add the user to the database
            await userDB.createUser(interaction.user.id, 0, 0);
        }

        if (!await orAction.reduce(interaction.user.id, mise)) {
            return await interaction.reply({content: `Vous n'avez pas assez d'or pour jouer. Il vous faut **au moins ${mise} <:piece:1045638309235404860>**.`, ephemeral: true});
        }


        const event = events[0];
        const response = await responseDB.getUserResponse(event.id, interaction.user.id);
        if (response) {
            return await interaction.reply({content: `Vous avez déjà donné cette réponse.`, ephemeral: true});
        } else {
            await responseDB.createResponse(event.id, interaction.user.id, valueString);
            return await interaction.reply({content: `Votre réponse "**${valueString}**" a bien été prise en compte.`, ephemeral: true});
        }
    }
};