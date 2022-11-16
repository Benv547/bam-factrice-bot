const scheduleDB = require("../database/schedule");
const { guildId } = require("../config.json");
const plusmoins = require("../utils/plusmoins");
const justeprix = require("../utils/justeprix");
const loto = require("../utils/loto");
const bourse = require("../utils/bourse");
const quiz = require("../utils/quiz");

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);

        const checkEvents = async () => {
            console.log("Checking events...");

            const schedules = await scheduleDB.getNowSchedulesNotActive();
            if (schedules && schedules.length > 0) {
                // get the guild
                const guild = client.guilds.cache.get(guildId);

                // for each schedule
                for (const schedule of schedules) {
                    if (schedule.type === 'plusmoins') {
                        await plusmoins.create(guild, schedule.id);
                    } else if (schedule.type === 'justeprix') {
                        await justeprix.create(guild, schedule.id);
                    } else if (schedule.type === 'loto') {
                        await loto.create(guild, schedule.id);
                    } else if (schedule.type === 'bourse') {
                        await bourse.create(guild, schedule.id);
                    } else if (schedule.type === 'quiz') {
                        await quiz.create(guild, schedule.id);
                    }
                }
            }

            setTimeout(checkEvents, 1000 * 60);
        }
        checkEvents();
    },
};