const Command = require("../../structure/Commands.js");
const { MessageEmbed, Constants: { ApplicationCommandOptionTypes } } = require("discord.js");

class ChannelInfo extends Command {

    constructor(client) {
        super(client, {
            name: "channelinfo",
            aliases: ["channel-info", "channel", "salon", "ci"],
            enabled: true,
            dirname: __dirname,
            botPerms: ["MANAGE_CHANNELS"],
            userPerms: [],
            restriction: [],
            
            slashCommandOptions: {
                description: "Get info about a channel",
                options: [
                    {
                        name: "channel",
                        required: false,
                        type: ApplicationCommandOptionTypes.CHANNEL,
                        description: "The channel that you want to get some info"
                    }
                ]
            }
        });
    };

    async run(message, args, data) {
        
        const channel = message.mentions.channels.first() || this.client.channels.cache.get(args[0]) || message.channel;

        if(!channel || channel.type === "category") return message.drake("general/channelinfo:NOT_FOUND", {
            emoji: "error"
        });

        const embed = new MessageEmbed()
        .setTitle(message.drakeWS("general/channelinfo:TITLE", {
            channel: channel.name,
            emoji: "channel"
        }))
        .setFooter(this.client.cfg.footer)
        .setColor("RANDOM")
        .addField(this.client.emotes.channelsType[channel.type] + " Type", message.drakeWS("common:" + channel.type.toUpperCase()), true)
        .addField(this.client.emotes["nfsw"] + " NFSW", channel.nfsw ? message.drakeWS("common:YES") : message.drakeWS("common:NO"), true)
        .addField(this.client.emotes["medal"] + " Position", "#" + channel.rawPosition, true)
        .setThumbnail(channel.guild.iconURL({ dynamic: true }))
        .addField(this.client.emotes["pushpin"] + " Topic", (channel.topic !== null && channel.topic.length < 284) ? channel.topic : message.drakeWS("general/channelinfo:NO_TOPIC"), true)

        return message.channel.send({
            embeds: [embed]
        });
    };

    async runInteraction(interaction, data) {
        
        const channel = interaction.options.getChannel("channel") || interaction.channel;

        if(!channel || channel.type.toLowerCase() === "category" || channel.type.toLowerCase() === "guild_category") return interaction.reply({
            content: interaction.drakeWS("general/channelinfo:NOT_FOUND", {
                emoji: "error"
            }),
            ephemeral: true
        });

        const embed = new MessageEmbed()
        .setTitle(interaction.drakeWS("general/channelinfo:TITLE", {
            channel: channel.name,
            emoji: "channel"
        }))
        .setFooter(this.client.cfg.footer)
        .setColor("RANDOM")
        .addField(this.client.emotes.channelsType[channel.type.toLowerCase()] + " Type", interaction.drakeWS("common:" + channel.type.toUpperCase()), true)
        .addField(this.client.emotes["nfsw"] + " NFSW", channel.nfsw ? interaction.drakeWS("common:YES") : interaction.drakeWS("common:NO"), true)
        .addField(this.client.emotes["medal"] + " Position", "#" + channel.rawPosition, true)
        .setThumbnail(channel.guild.iconURL({ dynamic: true }))
        .addField(this.client.emotes["pushpin"] + " Topic", (channel.topic != null && channel.topic.length < 284) ? channel.topic : interaction.drakeWS("general/channelinfo:NO_TOPIC"), true)

        return interaction.reply({
            embeds: [embed]
        });
    };
};

module.exports = ChannelInfo;