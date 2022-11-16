const {ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder} = require("discord.js");

module.exports = {
    name: 'bourse',
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId(interaction.customId);

        const bourseType = interaction.customId.split('_')[1];
        if (bourseType === 'buy') {
            modal.setTitle('Acheter des actions');
        } else if (bourseType === 'sell') {
            modal.setTitle('Vendre des actions');
        }

        // Add components to modal
        const input = new TextInputBuilder()
            .setCustomId('bourse')
            .setLabel("Combien d'actions ?")
            // Paragraph means multiple lines of text.
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(5);

        // An action row only holds one text input,
        // so you need one action row per text input.
        const primaryActionRow = new ActionRowBuilder().addComponents(input);

        // Add inputs to the modal
        modal.addComponents(primaryActionRow);

        // Show the modal to the user
        await interaction.showModal(modal);
    }
};