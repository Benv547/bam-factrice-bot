const { SlashCommandBuilder } = require('discord.js');
const quizDB = require('../database/quiz.js');

module.exports = {
    public: true,
    data: new SlashCommandBuilder()
        .setName('quizdelete')
        .setDescription('Permet de supprimer un quiz.')
        .addStringOption(option =>
            option.setName('name')
                .setDescription("Le nom du quiz")
                .setRequired(true)),
    async execute(interaction) {
        const name = interaction.options.get('name').value;
        await quizDB.deleteQuiz(name);
        return await interaction.reply({ content: 'Le quiz **' + name + '** a bien été supprimé.', ephemeral: true });
    }
};