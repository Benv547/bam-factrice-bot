var harryDB = require('../database/harry.js');
const {createFullEmbed} = require("../utils/global");
const channelID = '1166083338717642772';
const sendChannelID = '1166073789000462336';

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        // if message is a webhook message, return
        const content = message.content;
        let regex = /Member ([0-9]+) win ([0-9]+) points/g;
        let match = regex.exec(content);
        if (match && message.channelId === channelID) {
            console.log(match)
            const user = message.guild.members.cache.find(m => m.user.id === match[1]);
            if (user) {
                await this.increment(user.id, parseInt(match[2]));
                const dbUser = await harryDB.getHarryUser(user.id);
                if (!dbUser) {
                    return;
                }
                // wait between 3 and 10 minutes
                setTimeout(async (match, dbUser) => {
                    const embed = createFullEmbed('', '**' + match[2] + ' points** pour **' + dbUser.house + '** !', null, null, null, null, true);
                    const channel = await message.guild.channels.fetch(sendChannelID);
                    return await channel.send({ content: '', embeds: [embed] });
                }, Math.floor(Math.random() * (600000 - 180000 + 1) + 180000), match, dbUser);
            }
        }
        regex = /Member ([0-9]+) loose ([0-9]+) points/g;
        match = regex.exec(content);
        if (match) {
            const user = message.guild.members.cache.find(m => m.user.id === match[1]);
            if (user) {
                await this.decrement(user.id, parseInt(match[2]));
                const dbUser = await harryDB.getHarryUser(user.id);
                if (!dbUser) {
                    return;
                }
                // wait between 3 and 10 minutes
                setTimeout(async () => {
                    const embed = createFullEmbed('',  match[2] + ' points **en moins** pour ' + dbUser.house, null, null, null, null, true);
                    const channel = await message.guild.channels.fetch(channelID);
                    return await channel.send({ content: '', embeds: [embed] });
                }, Math.floor(Math.random() * (600000 - 180000 + 1) + 180000));
            }
        }
    },

    async increment(userId, qte) {
        // Find user in database
        const user = await harryDB.getHarryUser(userId);
        if (!user) {
            return;
        }
        // Increment user points
        await harryDB.incr_points(userId, qte);
    },

    async decrement(userId, qte) {
        // Find user in database
        const user = await harryDB.getHarryUser(userId);
        if (!user) {
            return;
        }
        // Increment user points
        await harryDB.decr_points(userId, -qte);
    },

    async get(userId) {
        // Find user in database
        return await harryDB.getHarryUser(userId);
    }
};