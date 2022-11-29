const { SlashCommandBuilder, GuildScheduledEventEntityType, GuildScheduledEventPrivacyLevel } = require('discord.js');
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
        const old_date_value = interaction.options.get('date').value;

        const dateParts = old_date_value.split("/");
        const date_value = dateParts[1] + '/' + dateParts[0] + '/' + dateParts[2];

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

        const date_with_hour_start = date_value + ' ' + hour_start_value + ':00+01:00';
        const date_with_hour_end = date_value + ' ' + hour_end_value + ':00+01:00';


        const date_start = new Date(date_with_hour_start);
        const date_end = new Date(date_with_hour_end);

        if (date_start > date_end) {
            return await interaction.reply({ content: 'L\'heure de début doit être inférieure à l\'heure de fin.', ephemeral: true });
        }

        let real_name = name;
        let image = null;
        if (name === 'plusmoins') {
            image = 'https://cdn.discordapp.com/attachments/1004073840093184000/1045984968834306098/Plus_Ou_Moins.png';
            real_name = 'Plus/Moins';
        }
        else if (name === 'justeprix') {
            // image
            real_name = 'Juste prix';
        }
        else if (name === 'bourse') {
            // image
        }
        else if (name === 'loto') {
            image = 'https://cdn.discordapp.com/attachments/1004073840093184000/1045985072555241572/Loto.png';
        }
        real_name = real_name.charAt(0).toUpperCase() + real_name.slice(1);

        const schedule = await interaction.guild.scheduledEvents.create({
            name: real_name,
            entityType: GuildScheduledEventEntityType.External,
            entityMetadata: {
                location: 'https://discord.gg/9apgeeBYS9',
            },
            privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
            scheduledStartTime: date_start,
            scheduledEndTime: date_end,
            description: 'Venez participer au **' + real_name + '** le **' + old_date_value + '** de **' + hour_start_value + ' à ' + hour_end_value + '** !\nN\'oubliez pas de **prendre la notification "EVENEMENT"** dans <#825800880095625236> pour être notifié lors du lancement.\n\nToutes les règles seront expliquées lors du début de l\'événement.\n(*Cet événement a été créé automatiquement par un bot.*)',
            image: image,
        });

        await scheduleDB.createSchedule(schedule.id, name, date_start, date_end);

        return await interaction.reply({ content: 'L\'événement a bien été ajouté le ' + old_date_value + ' de ' + hour_start_value + ' à ' + hour_end_value + '.', ephemeral: true });
    }
};