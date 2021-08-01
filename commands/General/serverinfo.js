const Command = require("../../structure/Commands");
const { MessageEmbed } = require("discord.js");

class Serverinfo extends Command {

    constructor(client) {
        super(client, {
            name: "serverinfo",
            aliases: [ "si", "guildinfo", "serveur", "server", "serveurinfo", "guild" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "EMBED_LINKS", "SEND_MESSAGES" ],
            userPerms: [],
            cooldown: 3,
            restriction: [],

            slashCommandOptions: {
                description: "Get info about the current server"
            }
        });
    };

    async run(message, args, data) {

        const guild = message.guild;
        const guildOwner = this.client.users.cache.get(guild.ownerId);

        const voiceChannelCount = message.guild.channels.cache.filter(c => c.type === 'voice').size;
        const textChannelCount = message.guild.channels.cache.filter(c => c.type === 'text').size;
        const categoryChannels = message.guild.channels.cache.filter(c => c.type === 'category').size;
        const roleList = (message.guild.roles.cache.size < 25 ? message.guild.roles.cache.filter(r => r.name !== '#everyone').map(role => role).join(', ') : message.drakeWS("general/serverinfo:TOO"));

        const embed = new MessageEmbed()
        .setAuthor(guild.name, guild.iconURL({ dynamic: true }))
        .setFooter(this.client.cfg.footer)
        .setTitle(message.drakeWS("general/serverinfo:TITLE", {
            guildName: guild.name
        }))
        .setColor("RANDOM")
        .setThumbnail(message.guild.iconURL({format: 'png', dynamic: true, size: 1024}))
        .addField(message.drakeWS("general/serverinfo:OWNER", {
            emoji: "owner"
        }), guildOwner.username + " ||(" + guild.ownerId + ")||", true)
        .addField(message.drakeWS("general/serverinfo:REGION", {
            emoji: "map"
        }), `${guild.preferredLocale ? guild.preferredLocale : "Any"}`, true)
        .addField(message.drakeWS("general/serverinfo:CREATE", {
            emoji: "calendar"
        }), `${message.time.printDate(guild.createdAt)}`, true)
        .addField(message.drakeWS("general/serverinfo:CHANNELS", {
            emoji: "channels"
        }), categoryChannels + " " + message.drakeWS("general/serverinfo:CATEGORIES") +  " | "  + textChannelCount +  " " + message.drakeWS("general/serverinfo:TEXT_CHANNELS") + " | "  + voiceChannelCount + " " + message.drakeWS("general/serverinfo:VOICE_CHANNELS"), false)
        .addField(message.drakeWS("general/serverinfo:MEMBERS", {
            emoji: "man"
        }), guild.memberCount + " " + message.drakeWS("general/serverinfo:MEMBERS"), true)
        .addField(message.drakeWS("general/serverinfo:BOOSTS", {
            emoji: "serverBoost"
        }), guild.premiumSubscriptionCount + " " + message.drakeWS("general/serverinfo:BOOSTS") + " | " + (guild.premiumTier == "NONE" ? "0" : guild.premiumTier) + " " + message.drakeWS("general/serverinfo:LEVEL"), true)
        .addField(message.drakeWS("general/serverinfo:EMOJIS", {
            emoji: "smile"
        }), `${guild.emojis.cache.size}`, true)
        .addField(message.drakeWS("general/serverinfo:ROLELIST", {
            emoji: "roleList",
            count: message.guild.roles.cache.size
        }), `${roleList}`, false)

        message.channel.send({
            embeds: [embed]
        });
    };

    async runInteraction(interaction, data) {

        const guild = interaction.guild;
        const guildOwner = this.client.users.cache.get(guild.ownerId);

        const voiceChannelCount = interaction.guild.channels.cache.filter(c => c.type === 'voice').size;
        const textChannelCount = interaction.guild.channels.cache.filter(c => c.type === 'text').size;
        const categoryChannels = interaction.guild.channels.cache.filter(c => c.type === 'category').size;
        const roleList = (interaction.guild.roles.cache.size < 25 ? interaction.guild.roles.cache.filter(r => r.name !== '#everyone').map(role => role).join(', ') : interaction.drakeWS("general/serverinfo:TOO"));

        const embed = new MessageEmbed()
        .setAuthor(guild.name, guild.iconURL({ dynamic: true }))
        .setFooter(this.client.cfg.footer)
        .setTitle(interaction.drakeWS("general/serverinfo:TITLE", {
            guildName: guild.name
        }))
        .setColor("RANDOM")
        .setThumbnail(interaction.guild.iconURL({format: 'png', dynamic: true, size: 1024}))
        .addField(interaction.drakeWS("general/serverinfo:OWNER", {
            emoji: "owner"
        }), guildOwner.username + " ||(" + guild.ownerId + ")||", true)
        .addField(interaction.drakeWS("general/serverinfo:REGION", {
            emoji: "map"
        }), `${guild.preferredLocale ? guild.preferredLocale : "Any"}`, true)
        .addField(interaction.drakeWS("general/serverinfo:CREATE", {
            emoji: "calendar"
        }), `${interaction.time.printDate(guild.createdAt)}`, true)
        .addField(interaction.drakeWS("general/serverinfo:CHANNELS", {
            emoji: "channels"
        }), categoryChannels + " " + interaction.drakeWS("general/serverinfo:CATEGORIES") +  " | "  + textChannelCount +  " " + interaction.drakeWS("general/serverinfo:TEXT_CHANNELS") + " | "  + voiceChannelCount + " " + interaction.drakeWS("general/serverinfo:VOICE_CHANNELS"), false)
        .addField(interaction.drakeWS("general/serverinfo:MEMBERS", {
            emoji: "man"
        }), guild.memberCount + " " + interaction.drakeWS("general/serverinfo:MEMBERS"), true)
        .addField(interaction.drakeWS("general/serverinfo:BOOSTS", {
            emoji: "serverBoost"
        }), guild.premiumSubscriptionCount + " " + interaction.drakeWS("general/serverinfo:BOOSTS") + " | " + (guild.premiumTier == "NONE" ? "0" : guild.premiumTier) + " " + interaction.drakeWS("general/serverinfo:LEVEL"), true)
        .addField(interaction.drakeWS("general/serverinfo:EMOJIS", {
            emoji: "smile"
        }), `${guild.emojis.cache.size}`, true)
        .addField(interaction.drakeWS("general/serverinfo:ROLELIST", {
            emoji: "roleList",
            count: interaction.guild.roles.cache.size
        }), `${roleList}`, false)

        interaction.reply({
            embeds: [embed]
        });
    };
};

module.exports = Serverinfo;