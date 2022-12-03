const responseDB = require("../database/response");
const scheduleDB = require("../database/schedule");
const orAction = require("../utils/orAction");
const userDB = require("../database/user");

const mise = 100;

module.exports = {
    name: 'plusmoins',
    async execute(interaction) {
        const events = await scheduleDB.getNowSchedulesActive();
        if (events && events.length > 0) {
            const event = events[0];

            const userId = await userDB.getUser(interaction.user.id);
            if (userId == null) {
                // Add the user to the database
                await userDB.createUser(interaction.user.id, 0, 0);
            }

            const response = await responseDB.getUserResponse(event.id, interaction.user.id);
            if (response) {
                return await interaction.reply({content: "Vous avez déjà répondu.", ephemeral: true});
            }

            if (!await orAction.reduce(interaction.user.id, mise)) {
                return await interaction.reply({content: `Vous n'avez pas assez d'or pour jouer. Il vous faut **au moins ${mise} <:piece:1045638309235404860>**.`, ephemeral: true});
            }

            const responseType = interaction.customId.split('_')[1];
            await responseDB.createResponse(event.id, interaction.user.id, responseType);
            return await interaction.reply({content: "Votre réponse a bien été prise en compte.", ephemeral: true});
        }
        return await interaction.reply({content: "Il n'y a pas d'événement en cours.", ephemeral: true});
    }
};