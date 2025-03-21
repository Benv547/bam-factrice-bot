const { categoryEvent } = require('../config.json');
const { ChannelType, EmbedBuilder } = require('discord.js');
const scheduleDB = require("../database/schedule");
const recordDB = require("../database/record");

module.exports = {
    name: 'global',
    createChannel: async (guild, channel_name, welcome_message, image, id) => {

        // Find channel in category
        let channel = guild.channels.cache.find((channel) => channel.name === channel_name && channel.parentId === categoryEvent);
        if (channel) {
            return channel;
        }

        // Create channel
        channel = await guild.channels.create({
            name: channel_name,
            type: ChannelType.GuildText,
            parent: categoryEvent
        });

        try {
            await guild.scheduledEvents.edit(id, {
                entityMetadata: {
                    location: '<#' + channel.id + '>',
                },
                status: 2
            })
        } catch {}

        // Set cooldown
        await channel.setRateLimitPerUser(5);

        // Send welcome message
        if (welcome_message) {
            const embed = new EmbedBuilder()
                .setTitle('Bienvenue dans le salon ' + channel_name)
                .setDescription(welcome_message)
                .setColor(0x2f3136)
                .setImage(image)
                .setTimestamp();
            await channel.send({ content: '<@&817346750464917544> **Evénement**', embeds: [embed] });
        }

        return channel;
    },
    deleteChannel: async (id, channel, participants) => {

        const schedule = await scheduleDB.get(id);
        if (schedule.type === 'quiz') {
            await scheduleDB.deleteSchedule(id);
        }
        await scheduleDB.deletePastSchedules();
        if (await scheduleDB.get(id) === null) {
            await recordDB.insertRecordWithDate(participants.length, 'event', schedule.start);
            await channel.send({ content: '** **\n👋 **L\'événement est terminé** et le salon va être supprimé.\nL\'équipe de Bouteille à la Mer vous remercie de votre participation !' });
            // wait 5 minutes
            setTimeout(async () => {
                // delete channel
                await channel.delete();
            }, 1000 * 60 * 5);
            return true;
        }
        return false;
    },
    createFullEmbed: function (title, description, thumbnail, image, color, footer, timestamp = true) {
        const embed = new EmbedBuilder();
        if (title) {
            embed.setTitle(title);
        }
        if (description) {
            embed.setDescription(description);
        }
        if (thumbnail) {
            embed.setThumbnail(thumbnail);
        }
        if (image) {
            embed.setImage(image);
        }
        if (timestamp) {
            embed.setTimestamp();
        }
        if (footer) {
            embed.setFooter({ text: footer });
        }
        if (color) {
            embed.setColor(color);
        } else {
            embed.setColor(0x2f3136);
        }
        return embed;
    }
};