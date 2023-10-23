const { SlashCommandBuilder, ModalBuilder, ActionRowBuilder, ButtonBuilder, ComponentType } = require('discord.js');
var harryDB = require('../database/harry.js');

const ROLE_BY_HOUSE = {
    'Gryffondor': '1166079951682941012',
    'Poufsouffle': '1166078941338021929',
    'Serdaigle': '1166080509546340352',
    'Serpentard': '1166079587265032373'
};

const QUIZ_MAISON = [
    {
        question: 'Quelle est la qualité qui te correspond le plus ?',
        answers: [
            {
                emoji: '🔥',
                name: 'Hardiesse',
                value: 'Gryffondor'
            },
            {
                emoji: '🙏',
                name: 'Patience',
                value: 'Poufsouffle'
            },
            {
                emoji: '🧠',
                name: 'Créativité',
                value: 'Serdaigle'
            },
            {
                emoji: '👊',
                name: 'Détermination',
                value: 'Serpentard'
            }
        ]
    },
    {
        question: 'De quelle créature te sens-tu le plus proche ?',
        answers: [
            {
                emoji: '💰',
                name: 'Niffleur',
                value: 'Serpentard'
            },
            {
                emoji: '😺',
                name: 'Fléreur',
                value: 'Gryffondor'
            },
            {
                emoji: '🪶',
                name: 'Hippogriffe',
                value: 'Poufsouffle'
            },
            {
                emoji: '🌕',
                name: 'Veaudelune',
                value: 'Serdaigle'
            }
        ]
    },
    {
        question: 'Pour toi, quelle est la potion la plus utile ?',
        answers: [
            {
                emoji: '🧪',
                name: 'Polynectar',
                value: 'Serpentard'
            },
            {
                emoji: '🍺',
                name: 'Felix Felicis',
                value: 'Poufsouffle'
            },
            {
                emoji: '🧙',
                name: 'Amortentia',
                value: 'Serdaigle'
            },
            {
                emoji: '🧹',
                name: 'Potion de ratatinage',
                value: 'Gryffondor'
            }
        ]
    },
    {
        question: 'Choisis deux clubs pour ton temps libre :',
        answers: [
            {
                emoji: '⭐',
                name: 'Club de chant et d\'astronomie',
                value: 'Serdaigle'
            },
            {
                emoji: '🧹',
                name: 'Quidditch et echecs sorciers',
                value: 'Gryffondor'
            },
            {
                emoji: '🌱',
                name: 'Bavboules et jardinage',
                value: 'Poufsouffle'
            },
            {
                emoji: '🧪',
                name: 'Club de potions et de duel',
                value: 'Serpentard'
            }
        ]
    },
    {
        question: 'Que n\'aimes tu pas faire ?',
        answers: [
            {
                emoji: '🖊️',
                name: 'Aller en cours',
                value: 'Serpentard'
            },
            {
                emoji: '🧹',
                name: 'Voler sur un balai',
                value: 'Poufsouffle'
            },
            {
                emoji: '🍺',
                name: 'Aller à Pré-au-Lard',
                value: 'Serdaigle'
            },
            {
                emoji: '📚',
                name: 'Aller à la bibliothèque',
                value: 'Gryffondor'
            }
        ]
    }
];

module.exports = {
    public: true,
    data: new SlashCommandBuilder()
        .setName('choixpeau')
        .setDescription('Permet de choisir sa maison.'),
    async execute(interaction) {
        const dbUser = await harryDB.getHarryUser(interaction.user.id);
        if (dbUser) {
            return await interaction.reply({ content: 'Tu as déjà choisi ta maison.', ephemeral: true });
        }

        const houseChoice = {
            'Gryffondor': 0,
            'Poufsouffle': 0,
            'Serdaigle': 0,
            'Serpentard': 0
        };

        await this.displayNextQuestion(interaction, QUIZ_MAISON, 0, houseChoice);
    },

    async displayNextQuestion(interaction, questions, index, houseChoice) {
        const actionRow = new ActionRowBuilder();

        const question = questions[index];
        for (const answer of question.answers) {
            const button = new ButtonBuilder()
                .setCustomId(`choixpeau_${answer.value}`)
                .setLabel(answer.name)
                .setStyle('Primary')
                .setEmoji(answer.emoji);

            actionRow.addComponents(button);
        }

        const message = await interaction.reply({
            content: question.question,
            components: [actionRow],
            fetchReply: true,
            ephemeral: true
        });

        const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 15000 });

        collector.on('collect', async i => {
            const house = i.customId.split('_')[1];
            houseChoice[house]++;

            if (index === questions.length - 1) {

                const houses = [];
                // duplicate for each house x times like the value of houseChoice['Griffondor']
                for (const house in houseChoice) {
                    for (let i = 0; i < houseChoice[house]; i++) {
                        houses.push(house);
                    }
                }
                const random = Math.floor(Math.random() * houses.length);

                const role = interaction.guild.roles.cache.get(ROLE_BY_HOUSE[houses[random]]);
                await interaction.member.roles.add(role);

                await harryDB.createHarryUser(interaction.user.id, 0, houses[random]);
                collector.stop();
                await i.reply({ content: `Tu es dans la maison ${houses[random]}.`, ephemeral: true});
                return
            }
            collector.stop();
            await this.displayNextQuestion(i, questions, index + 1, houseChoice);
            return
        });
    }
};