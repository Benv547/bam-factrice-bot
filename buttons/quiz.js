const responseDB = require("../database/response");
const scheduleDB = require("../database/schedule");
const orAction = require("../utils/orAction");
const userDB = require("../database/user");
const {ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder} = require("discord.js");

module.exports = {
    name: 'quiz',
    async execute(interaction) {
        const events = await scheduleDB.getNowSchedulesActive();
        if (events && events.length > 0) {
            const event = events[0];

            const userId = await userDB.getUser(interaction.user.id);
            if (userId == null) {
                // Add the user to the database
                await userDB.createUser(interaction.user.id, 0, 0);
            }

            const responseType = interaction.customId.split('_')[1];
            if (responseType === 'modal') {
                const modal = new ModalBuilder()
                    .setCustomId('quiz')
                    .setTitle('Répondez au quiz !');

                // Add components to modal
                const input = new TextInputBuilder()
                    .setCustomId('quiz')
                    .setLabel("Quelle est votre réponse ?")
                    // Paragraph means multiple lines of text.
                    .setStyle(TextInputStyle.Paragraph)
                    .setMaxLength(100);

                // An action row only holds one text input,
                // so you need one action row per text input.
                const primaryActionRow = new ActionRowBuilder().addComponents(input);

                // Add inputs to the modal
                modal.addComponents(primaryActionRow);

                // Show the modal to the user
                await interaction.showModal(modal);
                return;
            }

            const response = await responseDB.getUserResponse(event.id, interaction.user.id);
            if (response) {
                await responseDB.updateResponse(event.id, interaction.user.id, responseType);
                return await interaction.reply({content: "Vous réponse a bien été mise à jour.", ephemeral: true});
            }

            await responseDB.createResponse(event.id, interaction.user.id, responseType);
            return await interaction.reply({content: "Votre réponse a bien été prise en compte.", ephemeral: true});
        }
        return await interaction.reply({content: "Il n'y a pas d'événement en cours.", ephemeral: true});
    }
};