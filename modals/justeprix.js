const scheduleDB = require("../database/schedule");
const responseDB = require("../database/response");
const userDB = require("../database/user");
const orAction = require("../utils/orAction");

const mise = 10;
const gain = 500;

module.exports = {
    name: 'justeprix',
    async execute(interaction) {
        const valueString = interaction.fields.getTextInputValue('justeprix');
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

        if (!await orAction.reduce(interaction.user.id, mise)) {
            return await interaction.reply({content: `Vous n'avez pas assez d'or pour jouer. Il vous faut **au moins ${mise} pièce(s) d'or**.`, ephemeral: true});
        }


        const event = events[0];
        const response = await responseDB.getUserResponse(event.id, interaction.user.id);
        if (response) {
            const eventValue = parseInt(response.response);
            if (eventValue === value) {
                return await interaction.reply({content: `Vous avez déjà donné cette réponse.`, ephemeral: true});
            }
            await responseDB.updateResponse(event.id, interaction.user.id, value);
        } else {
            await responseDB.createResponse(event.id, interaction.user.id, value);
        }

        const eventValue = parseInt(event.value);
        if (eventValue === value) {
            await orAction.increment(interaction.user.id, gain);
            await interaction.reply({content: `Bravo ! Vous avez trouvé le juste prix ! Vous gagnez **${gain} pièce(s) d'or**.`, ephemeral: true});
        } else if (eventValue > value) {
            await interaction.reply({content: `Le juste prix est plus grand que ${value}.`, ephemeral: true});
        } else {
            await interaction.reply({content: `Le juste prix est plus petit que ${value}.`, ephemeral: true});
        }
    }
};