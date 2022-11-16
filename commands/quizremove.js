const { SlashCommandBuilder } = require('discord.js');
const quizDB = require('../database/quiz.js');

module.exports = {
    public: true,
    data: new SlashCommandBuilder()
        .setName('quizremove')
        .setDescription('Permet de créer un quiz.')
        .addStringOption(option =>
            option.setName('name')
                .setDescription("Le nom du quiz")
                .setRequired(true))
        .addStringOption(option =>
            option.setName('question_id')
                .setDescription("La question à supprimer")
                .setRequired(true)),
    async execute(interaction) {
        const name = interaction.options.get('name').value;
        const question = interaction.options.get('question_id').value;

        await quizDB.deleteQuestion(name, question);
        return await interaction.reply({ content: 'La question **#' + question + '** a bien été supprimée.', ephemeral: true });
    }
};