const scheduleDB = require("../database/schedule");
const responseDB = require("../database/response");
const userDB = require("../database/user");

module.exports = {
    name: 'quiz',
    async execute(interaction) {
        const valueString = interaction.fields.getTextInputValue('quiz');

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
        const response = await responseDB.getUserResponse(event.id, interaction.user.id);
        if (response) {
            await responseDB.updateResponse(event.id, interaction.user.id, valueString);
            return await interaction.reply({content: `Votre réponse a bien été mise à jour.`, ephemeral: true});
        } else {
            await responseDB.createResponse(event.id, interaction.user.id, valueString);
            return await interaction.reply({content: `Votre réponse a bien été prise en compte.`, ephemeral: true});
        }
    }
};