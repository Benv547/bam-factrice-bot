const { SlashCommandBuilder } = require('discord.js');
const quizDB = require('../database/quiz.js');

module.exports = {
    public: true,
    data: new SlashCommandBuilder()
        .setName('quizadd')
        .setDescription('Permet d\'ajouter une question à un quiz.')
        .addStringOption(option =>
            option.setName('name')
                .setDescription("Le nom du quiz")
                .setRequired(true))
        .addStringOption(option =>
            option.setName('question')
                .setDescription("La question à ajouter")
                .setRequired(true))
        .addStringOption(option =>
            option.setName('answer_1')
                .setDescription("Réponse 1")
                .setRequired(true))
        .addStringOption(option =>
            option.setName('correct_answer')
                .setDescription("Réponse correcte (1, 2, 3 ou 4)")
                .setRequired(true))
        .addStringOption(option =>
            option.setName('image_url')
                .setDescription("L'image de la question"))
        .addStringOption(option =>
            option.setName('answer_2')
                .setDescription("Réponse 2"))
        .addStringOption(option =>
            option.setName('answer_3')
                .setDescription("Réponse 3"))
        .addStringOption(option =>
            option.setName('answer_4')
                .setDescription("Réponse 4"))
        .addStringOption(option =>
            option.setName('delay')
                .setDescription("Délais de réponse (en secondes)")),
    async execute(interaction) {
        const name = interaction.options.get('name').value;
        const question = interaction.options.get('question').value;
        const correct = interaction.options.get('correct_answer').value;
        let delay = interaction.options.get('delay');
        let image_url = interaction.options.get('image_url');
        const answer_1 = interaction.options.get('answer_1');
        const answer_2 = interaction.options.get('answer_2');
        const answer_3 = interaction.options.get('answer_3');
        const answer_4 = interaction.options.get('answer_4');

        let text_answer = answer_1.value;
        if (answer_2 !== null) {
            text_answer += ";" + answer_2.value;
        }
        if (answer_3 !== null) {
            text_answer += ";" + answer_3.value;
        }
        if (answer_4 !== null) {
            text_answer += ";" + answer_4.value;
        }

        if (delay !== null) {
            delay = delay.value;
        } else {
            delay = 30;
        }

        if (image_url !== null) {
            image_url = image_url.value;
        }

        if (await quizDB.getQuiz(name) === null) {
            return await interaction.reply({ content: 'Le quiz n\'exite pas.', ephemeral: true });
        }

        await quizDB.createQuestion(name, question, image_url, text_answer, correct, delay);
        return await interaction.reply({ content: 'La question **' + question + '** a bien été créée.', ephemeral: true });
    }
};