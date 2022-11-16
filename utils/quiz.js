const global = require('./global.js');
const scheduleDB = require("../database/schedule");
const responseDB = require("../database/response");
const quizDB = require("../database/quiz");
const orAction = require("../utils/orAction");

const { ActionRowBuilder, ButtonBuilder } = require("discord.js");

let questions = [];
let currentQuestion = 0;
let gain = 100;
const rules = '';
const welcome = 'Bienvenue dans **le quiz** !';
const channel_name = '🙋️│quiz';
const event_name = 'Le quiz';
const thumbnail = 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/325/person-raising-hand_1f64b.png';

module.exports = {
    create: async (guild, id) => {

        // Set event active
        await scheduleDB.setActive(id);
        const event = await scheduleDB.get(id);

        // Create channel
        const channel = await global.createChannel(guild, channel_name, welcome);
        // Create embed
        const embed = global.createFullEmbed(event_name, '**Le prochain tour va commencer dans 5 minutes !**\n\n__**Rappel des règles :**__\n' + rules, thumbnail, null, null, null, false);
        // Send embed
        await channel.send({ embeds: [embed] });

        async function endQuiz(channel, id) {
            await scheduleDB.setInactive(id);
            await global.deleteChannel(id, channel);
            await responseDB.deleteAllResponses(id);
        }

        async function createQuiz(channel, id) {
            if (currentQuestion < questions.length) {
                setTimeout(async () => {
                    const question = questions[currentQuestion];
                    let answers = question.answers.split(';');

                    let ans = "\n\n";

                    let row = new ActionRowBuilder();
                    if (answers.length > 1) {
                        const emojiLetters = ['🇦', '🇧', '🇨', '🇩'];
                        const letters = ['A', 'B', 'C', 'D'];
                        for (let i = 0; i < answers.length; i++) {
                            row.addComponents(new ButtonBuilder().setCustomId('quiz_' + i.toString()).setLabel(letters[i]).setStyle('Secondary'));
                            ans += emojiLetters[i] + ' ' + answers[i] + '\n';
                        }
                    } else {
                        row.addComponents(new ButtonBuilder().setCustomId('quiz_modal').setLabel('Répondre').setStyle('Success'));
                    }

                    const correctAnswer = answers[question.correct_answer-1];
                    const embed = global.createFullEmbed(`Question ${currentQuestion + 1}`, question.question + ans, question.image_url, null, null, 'Vous avez ' + question.delay + ' secondes pour répondre !', false);
                    const message = await channel.send({ embeds: [embed], components: [row] });

                    setTimeout(async () => {
                        let users = "Ils ont répondu juste :\n";
                        const responses = await responseDB.getAllResponses(id);
                        if (responses && responses.length > 0) {
                            for (const response of responses) {
                                if (answers.length > 1) {
                                    const value = parseInt(response.response) + 1;
                                    if (value === question.correct_answer) {
                                        // Add money to user
                                        await orAction.increment(response.id_user, gain);
                                        users += `<@${response.id_user}>\n`;
                                    }
                                } else {
                                    if (response.response.toLowerCase() === correctAnswer.toLowerCase()) {
                                        // Add money to user
                                        await orAction.increment(response.id_user, gain);
                                        users += `<@${response.id_user}>\n`;
                                    }
                                }
                            }
                        }

                        const embed = global.createFullEmbed(`Question ${currentQuestion + 1}`, `La bonne réponse était :\n**${correctAnswer}**\n\n` + users, question.image_url, null, null, false);
                        await message.edit({ embeds: [embed], components: [] });

                        currentQuestion++;
                        await createQuiz(channel, id);
                    }, 1000 * question.delay);

                }, 1000 * 60);
            } else {
                await endQuiz(channel, id);
            }
        }

        setTimeout(async () => {
            questions = await quizDB.getQuestions(event.value);
            await createQuiz(channel, id);
        }, 1000 * 60 * 4);
    }
};