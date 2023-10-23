const { SlashCommandBuilder, ModalBuilder, ActionRowBuilder, ButtonBuilder, ComponentType } = require('discord.js');
var harryDB = require('../database/harry.js');
const {createFullEmbed} = require("../utils/global");

module.exports = {
    public: true,
    data: new SlashCommandBuilder()
        .setName('points')
        .setDescription('Permet de voir vos points'),
    async execute(interaction) {
        const dbUser = await harryDB.getHarryUser(interaction.user.id);
        if (!dbUser) {
            return await interaction.reply({content: 'Tu n\'as pas encore choisi ta maison, tu peux le faire avec la commande /choixpeau', ephemeral: true});
        }

        const message = 'Vous êtes dans la maison **' + dbUser.house + '**.\n' +
            'Vous avez actuellement **' + dbUser.points + '** points. Ces points sont ajoutés ou retirés en fonction de vos actions sur le serveur.\n\n' +
            'Pour voir le classement des maisons, utilisez la commande /classement.\n\n';

        const embed = createFullEmbed('Vos points', message, null, null, null, 'Consultez l\'évolution de vos points : #coupes_des_maisons.');
        await interaction.reply({embeds: [embed], ephemeral: true});
    },
};