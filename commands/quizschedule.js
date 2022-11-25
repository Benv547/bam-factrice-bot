const { SlashCommandBuilder } = require('discord.js');
const scheduleDB = require('../database/schedule.js');
const quizDB = require('../database/quiz.js');

module.exports = {
    public: true,
    data: new SlashCommandBuilder()
        .setName('quizschedule')
        .setDescription('Permet de plannifier un quiz.')
        .addStringOption(option =>
            option.setName('name')
                .setDescription("Le nom du quiz")
                .setRequired(true))
        .addStringOption(option =>
            option.setName('date')
                .setDescription('La date de l\'événement')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('hour_start')
                .setDescription('L\'heure de début de l\'événement')
                .setRequired(true)),
    async execute(interaction) {
        const name = interaction.options.get('name').value;
        const date_value = interaction.options.get('date').value;
        const hour_start_value = interaction.options.get('hour_start').value;

        // check if the date format is correct
        const date_regex = new RegExp('^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$');
        if (!date_regex.test(date_value)) {
            return await interaction.reply({ content: 'Veuillez insérer une date valide.', ephemeral: true });
        }

        // check if the hour format is correct
        const hour_regex = new RegExp('^[0-9]{2}:[0-9]{2}$');
        if (!hour_regex.test(hour_start_value)) {
            return await interaction.reply({ content: 'Veuillez insérer une heure valide.', ephemeral: true });
        }

        const date_with_hour_start = date_value + ' ' + hour_start_value + ':00';
        const date_start = new Date(date_with_hour_start);
        const date_end = date_start;

        // let image = 'https://cdn.discordapp.com/attachments/841000000000000000/841000000000000000/unknown.png';
        if (await quizDB.getQuiz(name) === null) {
            return await interaction.reply({ content: 'Le quiz n\'existe pas.', ephemeral: true });
        }

        const schedule = await interaction.guild.scheduledEvents.create({
            name: 'Quiz ' + name,
            privacyLevel: 'GUILD_ONLY',
            scheduledStartTime: date_start,
            description: 'Venez participer au Quiz ' + name + '\n(*Cet événement a été créé automatiquement par un bot.*)',
        });

        await scheduleDB.createScheduleWithValue(schedule.id, 'quiz', date_start, date_end, name);
        return await interaction.reply({ content: 'Le quiz **' + name + '** a bien été ajouté le ' + date_value + ' à ' + hour_start_value + '.', ephemeral: true });
    }
};