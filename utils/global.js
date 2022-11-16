const { categoryEvent } = require('../config.json');
const { ChannelType, EmbedBuilder } = require('discord.js');
const scheduleDB = require("../database/schedule");

module.exports = {
    name: 'global',
    createChannel: async (guild, channel_name, welcome_message) => {

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
        // Set cooldown
        await channel.setRateLimitPerUser(60);

        // Send welcome message
        if (welcome_message) {
            const embed = new EmbedBuilder()
                .setTitle('Bienvenue dans le salon ' + channel_name)
                .setDescription(welcome_message)
                .setColor(0x2f3136)
                .setTimestamp();
            await channel.send({ content: '<@&817346750464917544> **Evénement**', embeds: [embed] });
        }

        return channel;
    },
    deleteChannel: async (id, channel) => {
        await scheduleDB.deletePastSchedules();
        if (await scheduleDB.get(id) === null) {
            await channel.send({ content: '** **\n👋 **L\'événement est terminé** et le salon va être supprimé.\nL\'équipe de Bouteille à la Mer vous remercie de votre participation !' });
            // wait 5 minutes
            setTimeout(async () => {
                // delete channel
                await channel.delete();
            }, 1000 * 60 * 5);
        }
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