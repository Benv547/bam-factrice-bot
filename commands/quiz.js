const { SlashCommandBuilder } = require('discord.js');
const quizDB = require('../database/quiz.js');

module.exports = {
    public: true,
    data: new SlashCommandBuilder()
        .setName('quiz')
        .setDescription('Permet de voir le planning des événements.'),
    async execute(interaction) {
        const quizs = await quizDB.getQuizs();
        let message = '';

        if (quizs === null) {
            message = 'Il n\'y a pas de quiz.';
        } else {
            for (const quiz of quizs) {
                message += '**' + quiz.quiz_name + '**\n';
                const questions = await quizDB.getQuestions(quiz.quiz_name);
                for (const question of questions) {
                    message += '- #' + question.id + ' : "**' + question.question + '**" (' + question.delay + 's)';
                    if (question.image_url !== null) {
                        message += ' ([image](' + question.image_url + '))';
                    }
                    message += '\n';

                    const answers = question.answers.split(';');
                    for (let i = 0; i < answers.length; i++) {
                        if (question.correct_answer === i + 1) {
                            message += '    - "' + answers[i] + '" x\n';
                        } else {
                            message += '    - "' + answers[i] + '"\n';
                        }
                    }
                }
                message += '\n';
            }
        }
        return await interaction.reply({ content: message, ephemeral: true });
    }
};