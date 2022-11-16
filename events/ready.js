const scheduleDB = require("../database/schedule");
const { guildId } = require("../config.json");
const plusmoins = require("../utils/plusmoins");
const justeprix = require("../utils/justeprix");

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
                        // create the channel
                        await plusmoins.create(guild, schedule.id);
                    } else if (schedule.type === 'justeprix') {
                        // create the channel
                        await justeprix.create(guild, schedule.id);
                    }
                }
            }

            setTimeout(checkEvents, 1000 * 60);
        }
        checkEvents();
    },
};