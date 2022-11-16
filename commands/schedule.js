const { SlashCommandBuilder } = require('discord.js');
const scheduleDB = require('../database/schedule.js');

module.exports = {
    public: true,
    data: new SlashCommandBuilder()
        .setName('schedule')
        .setDescription('Permet de plannifier un événement.')
        .addStringOption(option =>
            option.setName('name')
                .setDescription("Le nom de l'événement")
                .setRequired(true)
                .setChoices(
                    { name: 'Plus/Moins', value: 'plusmoins' },
                    { name: 'Juste prix', value: 'justeprix' },
                    { name: 'Loto', value: 'loto' },
                    { name: 'Bourse', value: 'bourse' },
                ))
        .addStringOption(option =>
            option.setName('date')
                .setDescription('La date de l\'événement')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('hour_start')
                .setDescription('L\'heure de début de l\'événement')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('hour_end')
                .setDescription('L\'heure de fin de l\'événement')
                .setRequired(true)),
    async execute(interaction) {
        const name = interaction.options.get('name').value;
        const date_value = interaction.options.get('date').value;
        const hour_start_value = interaction.options.get('hour_start').value;
        const hour_end_value = interaction.options.get('hour_end').value;

        // check if the date format is correct
        const date_regex = new RegExp('^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$');
        if (!date_regex.test(date_value)) {
            return await interaction.reply({ content: 'Veuillez insérer une date valide.', ephemeral: true });
        }

        // check if the hour format is correct
        const hour_regex = new RegExp('^[0-9]{2}:[0-9]{2}$');
        if (!hour_regex.test(hour_start_value) || !hour_regex.test(hour_end_value)) {
            return await interaction.reply({ content: 'Veuillez insérer une heure valide.', ephemeral: true });
        }

        const date_with_hour_start = date_value + ' ' + hour_start_value + ':00';
        const date_with_hour_end = date_value + ' ' + hour_end_value + ':00';

        const date_start = new Date(date_with_hour_start);
        const date_end = new Date(date_with_hour_end);

        if (date_start > date_end) {
            return await interaction.reply({ content: 'L\'heure de début doit être inférieure à l\'heure de fin.', ephemeral: true });
        }

        await scheduleDB.createSchedule(name, date_start, date_end);
        return await interaction.reply({ content: 'L\'événement a bien été ajouté le ' + date_value + ' de ' + hour_start_value + ' à ' + hour_end_value + '.', ephemeral: true });
    }
};