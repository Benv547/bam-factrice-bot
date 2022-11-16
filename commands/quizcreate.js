const { SlashCommandBuilder } = require('discord.js');
const scheduleDB = require('../database/schedule.js');
const quizDB = require('../database/quiz.js');

module.exports = {
    public: true,
    data: new SlashCommandBuilder()
        .setName('quizcreate')
        .setDescription('Permet de créer un quiz.')
        .addStringOption(option =>
            option.setName('name')
                .setDescription("Le nom du quiz")
                .setRequired(true)),
    async execute(interaction) {
        const name = interaction.options.get('name').value;

        if (await quizDB.getQuiz(name) !== null) {
            return await interaction.reply({ content: 'Le quiz existe déjà.', ephemeral: true });
        }
        await quizDB.createQuiz(name);
        return await interaction.reply({ content: 'Le quiz **' + name + '** a bien été créé.', ephemeral: true });
    }
};