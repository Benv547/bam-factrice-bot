const { SlashCommandBuilder, ModalBuilder, ActionRowBuilder, ButtonBuilder, ComponentType, range} = require('discord.js');
var harryDB = require('../database/harry.js');
const {createFullEmbed} = require("../utils/global");

const EMOJI_BY_NAME = {
    'vide': '<:vide:1157338954501193789>',
    'gryffondor1': '<:griffondor1:1157338917704564747>',
    'gryffondor2': '<:gryffondor2:1157338919294226503>',
    'gryffondor3': '<:gryffondor3:1157338922398007366>',
    'gryffondor4': '<:gryffondor4:1157338923547238542>',
    'gryffondor5': '<:gryffondor5:1157338926550372494>',
    'serpentard1': '<:serpentard1:1157338943705059368>',
    'serpentard2': '<:serpentard2:1157339169417347222>',
    'serpentard3': '<:serpentard3:1157338947354116146>',
    'serpentard4': '<:serpentard4:1157339170633682965>',
    'serpentard5': '<:serpentard5:1157339172630183957>',
    'poufsouffle1': '<:poufsouffle1:1157338927846391841>',
    'poufsouffle2': '<:poufsouffle2:1157338930157453392>',
    'poufsouffle3': '<:poufsouffle3:1157338931558363176>',
    'poufsouffle4': '<:poufsouffle4:1157338933202518146>',
    'poufsouffle5': '<:poufsouffle5:1157338935412924446>',
    'serdaigle1': '<:serdaigle1:1157338936998367253>',
    'serdaigle2': '<:serdaigle2:1157339165525028914>',
    'serdaigle3': '<:serdaigle3:1157338941184294922>',
    'serdaigle4': '<:serdaigle4:1157338915104112670>',
    'serdaigle5': '<:serdaigle5:1157339168205180928>',
}

module.exports = {
    public: true,
    data: new SlashCommandBuilder()
        .setName('classement')
        .setDescription('Permet de voir le classement des maisons'),
    async execute(interaction) {
        const dbUser = await harryDB.getHarryUser(interaction.user.id);
        if (!dbUser) {
            return await interaction.reply({content: 'Tu n\'as pas encore choisi ta maison, tu peux le faire avec la commande /choixpeau', ephemeral: true});
        }

        const pointsByHouse = await harryDB.getPointsByHouse();
        const steps = [1000000000000, 1000000000000, 100000, 50000, 10000, 1000, 0, 0, 0];

        let message = '';
        for (const i of [...Array(steps.length - 1).keys()]) {
            console.log(i)
            for (const house of pointsByHouse) {
                console.log(house)
                const points = house.points;
                const name = house.house;

                let index = '-1';

                if (points >= steps[i] && points < steps[i - 1]) {
                    index = '3';
                }
                else if (points >= steps[i - 1]) {
                    index = '4';
                }

                if (i === 0) {
                    index = '1';
                }
                else if (i === 1) {
                    index = '2';
                }
                if (i === steps.length - 2) {
                    index = '5';
                }
                const key = name.toLowerCase() + index;
                if (index === '-1') {
                    message += EMOJI_BY_NAME['vide'];
                } else {
                    message += EMOJI_BY_NAME[key];
                }
                console.log(message)
            }
            message += ' \n'
        }
        message += '\n';

        for (const house of pointsByHouse) {
            message += '**' + house.house + '** : ' + house.points + ' points\n';
        }

        const embed = createFullEmbed('Le classement', message, null, null, null, 'Consultez l\'évolution de vos points : #coupes_des_maisons.');
        await interaction.reply({embeds: [embed], ephemeral: true});
    },
};