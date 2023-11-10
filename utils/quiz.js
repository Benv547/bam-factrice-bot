const global = require('./global.js');
const scheduleDB = require("../database/schedule");
const responseDB = require("../database/response");
const quizDB = require("../database/quiz");
const orAction = require("../utils/orAction");

const { ActionRowBuilder, ButtonBuilder } = require("discord.js");

let participants = [];

let scores = [];

let questions = [];
let currentQuestion = 0;
let gain = 100;
const rules = '- Les réponses peuvent être à **choix ou à réponses libres**\n' +
    '- Certaines questions possèdent une image, soyez attentifs !\n' +
    '- Vous avez un **temps limité pour répondre** à chaque question\n' +
    '- Chaque bonne réponse vous rapporte **' + gain + ' <:piece:1045638309235404860>**\n';
const welcome = 'Bienvenue dans **le quiz de Bouteille à la mer** !\n\n' +
    'Vous êtes ici pour tenter de gagner de l\'argent.\n' +
    'Pour cela, vous devez répondre à des questions.\n' +
    'Plus vous aurez de bonnes réponses, plus vous gagnerez d\'argent.\n\n' +
    'Bonne chance !';
const channel_name = '🙋️│quiz';
const event_name = 'Le quiz de Bouteille à la mer';
const thumbnail = 'https://images.emojiterra.com/google/noto-emoji/unicode-15/color/256px/1f64b-2642.png';
const image = 'https://cdn.discordapp.com/attachments/1004073840093184000/1046546979146178680/Quizz.png';

module.exports = {
    create: async (guild, id) => {

        // Set event active
        await scheduleDB.setActive(id);
        const event = await scheduleDB.get(id);

        // Create channel
        const channel = await global.createChannel(guild, channel_name, welcome, image, id);
        // Create embed
        const embed = global.createFullEmbed(event_name, '**Le quiz va commencer <t:' + (Math.round(new Date().getTime() / 1000) + 60 * 5) + ':R> !**\n\n__**Rappel des règles :**__\n' + rules, thumbnail, null, null, null, false);
        // Send embed
        await channel.send({ embeds: [embed] });

        async function endQuiz(channel, id) {

            scores = scores.sort((a, b) => b.score - a.score);

            let messages = '';
            for (let i = 0; i < scores.length; i++) {
                messages += '**' + (i + 1) + '.** <@' + scores[i].id + '> avec **' + scores[i].score + '** bonne(s) réponse(s) !\n';
            }

            const embed = global.createFullEmbed(event_name, '**Le quiz est terminé !**\n\n__**Résultats :**__\n' + messages, thumbnail, null, null, null, false);
            await channel.send({ embeds: [embed] });

            if(await global.deleteChannel(id, channel, participants)) {
                participants = [];
                scores = [];
                questions = [];
                currentQuestion = 0;
            }
        }

        async function createQuiz(channel, id) {
            if (currentQuestion < questions.length) {
                setTimeout(async () => {
                    const question = questions[currentQuestion];
                    let answers = question.answers.split(';');

                    let ans = "";

                    let row = new ActionRowBuilder();
                    if (answers.length > 1) {
                        ans = "\n\n";
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
                    const embed = global.createFullEmbed(`Question ${currentQuestion + 1}`, question.question + ans + '\n\n(Réponse révélée <t:' + (Math.round(new Date().getTime() / 1000) + question.delay) + ':R>)', null, question.image_url, null, null, false);
                    const message = await channel.send({ embeds: [embed], components: [row] });

                    setTimeout(async () => {
                        let users = "Ils ont répondu juste :\n";
                        const responses = await responseDB.getAllResponses(id);
                        if (responses && responses.length > 0) {
                            for (const response of responses) {
                                let correct = false;
                                if (answers.length > 1) {
                                    const value = parseInt(response.response) + 1;
                                    if (value === question.correct_answer) {
                                        correct = true;
                                    }
                                } else {
                                    if (response.response.toLowerCase() === correctAnswer.toLowerCase()) {
                                        correct = true;
                                    }
                                }

                                if (correct) {
                                    await orAction.increment(response.id_user, gain);

                                    // check if user already exists
                                    if (scores.find(user => user.id === response.id_user)) {
                                        scores.find(user => user.id === response.id_user).score++;
                                    } else {
                                        scores.push({ id: response.id_user, score: 1 });
                                    }
                                    users += `<@${response.id_user}>\n`;
                                }

                                if (participants.includes(response.id_user) === false) {
                                    participants.push(response.id_user);
                                }
                            }
                        }

                        const embed = global.createFullEmbed(`Question ${currentQuestion + 1}`, `La bonne réponse était :\n**${correctAnswer}**\n\n` + users, question.image_url, null, null, false);
                        await message.edit({ embeds: [embed], components: [] });

                        await responseDB.deleteAllResponses(id);

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