const { SlashCommandBuilder } = require('discord.js');
const scheduleDB = require('../database/schedule.js');

module.exports = {
    public: true,
    data: new SlashCommandBuilder()
        .setName('planning')
        .setDescription('Permet de voir le planning des événements.'),
    async execute(interaction) {
        const schedules = await scheduleDB.getFutureSchedules();
        let message = '';

        if (schedules === null) {
            message = 'Il n\'y a pas d\'événement prévu.';
        } else {
            schedules.forEach(schedule => {
                message += 'N°' + schedule.id + ' - **' + schedule.type + '** du ' + schedule.start.toLocaleString() + ' au ' + schedule.end.toLocaleString() + '\n';
            });
        }
        return await interaction.reply({ content: message, ephemeral: true });
    }
};