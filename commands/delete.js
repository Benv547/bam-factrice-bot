const { SlashCommandBuilder } = require('discord.js');
const scheduleDB = require('../database/schedule.js');

module.exports = {
    public: true,
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Permet de supprimer un événement.')
        .addStringOption(option =>
            option.setName('numero')
                .setDescription('Le numero de l\'événement')
                .setRequired(true)),
    async execute(interaction) {
        const numero = interaction.options.get('numero').value;

        try {
            const event = await scheduleDB.get(numero);
            if (event) {
                const schedule = await interaction.guild.scheduledEvents.fetch(event.id);
                await schedule.delete();
            }
        } catch {}

        await scheduleDB.deleteSchedule(numero);
        return await interaction.reply({ content: 'L\'événement a bien été supprimé.', ephemeral: true });
    },
};