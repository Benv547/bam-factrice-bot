const { SlashCommandBuilder, GuildScheduledEventEntityType, GuildScheduledEventPrivacyLevel} = require('discord.js');
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
        let date_end = new Date(date_start);
        date_end.setHours(date_end.getHours() + 1);

        console.log(date_start);
        console.log(date_end);


        let image = 'https://cdn.discordapp.com/attachments/1004073840093184000/1046546979146178680/Quizz.png';
        if (await quizDB.getQuiz(name) === null) {
            return await interaction.reply({ content: 'Le quiz n\'existe pas.', ephemeral: true });
        }

        const schedule = await interaction.guild.scheduledEvents.create({
            name: 'Quiz ' + name,
            entityType: GuildScheduledEventEntityType.External,
            entityMetadata: {
                location: 'https://discord.gg/9apgeeBYS9',
            },
            privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
            scheduledStartTime: date_start,
            scheduledEndTime: date_end,
            description: 'Venez participer au **Quiz ' + name + '** le **' + date_value + '** à **' + hour_start_value + '** !\nN\'oubliez pas de **prendre la notification "EVENEMENT"** dans <#825800880095625236> pour être notifié lors du lancement.\n\nToutes les règles seront expliquées lors du début de l\'événement.\n(*Cet événement a été créé automatiquement par un bot.*)',
            image: image,
        });

        await scheduleDB.createScheduleWithValue(schedule.id, 'quiz', date_start, date_end, name);
        return await interaction.reply({ content: 'Le quiz **' + name + '** a bien été ajouté le ' + date_value + ' à ' + hour_start_value + '.', ephemeral: true });
    }
};