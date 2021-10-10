const Command = require("../../structure/Commands.js");
const ms = require("ms");
const { Constants: { ApplicationCommandOptionTypes } } = require("discord.js");

class Slowmode extends Command {

    constructor(client) {
        super(client, {
            name: "slowmode",
            aliases: ["slow-mode"],
            enabled: true,
            dirname: __dirname,
            botPerms: ["MANAGE_CHANNELS"],
            userPerms: ["MANAGE_CHANNELS"],
            restriction: [],

            slashCommandOptions: {
                description: "⏱️ Update a channel's slowmode",
                options: [
                    {
                        name: "time",
                        type: ApplicationCommandOptionTypes.STRING,
                        required: true,
                        description: "What's the new slowmode ?"
                    },
                    {
                        name: "channel",
                        type: ApplicationCommandOptionTypes.CHANNEL,
                        required: false,
                        description: "On which channel ?"
                    }
                ]
            }
        });
    };

    async run(message, args, data) {

        const channel = message.guild.channels.cache.get(args[1]) || message.mentions.channels.first() || message.channel;

        if(!message.guild.channels.cache.has(channel.id)) return message.drake("moderation/slowmode:CHANNEL_NOT_HERE", {
            emoji: "error"
        });

        if(!args[0]) {
            if(channel.rateLimitPerUser != 0) {
                channel.setRateLimitPerUser(0).catch(error => {
                    return message.drake("moderation/slowmode:ERROR", {
                        emoji: "error",
                        error: error
                    });
                });
    
                return message.drake("moderation/slowmode:SUCCES_DISABLED", {
                    emoji: "succes",
                    channel: "<#" + channel.id + ">"
                });
            } else {
                return message.drake("moderation/slowmode:ALREADY_DISABLED", {
                    emoji: "error"
                });
            };
        };

        let time = isNaN(args[0]) ? (ms(args[0]) / 1000) : args[0];

        if(isNaN(time)) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "slowmode <time> (channel)"
        });

        if(time < 0 || time > 21600) return message.drake("moderation/slowmode:TOO_LONG", {
            emoji: "error"
        });

        if(time === channel.rateLimitPerUser) return message.drake("moderation/slowmode:ALREADY_TIME", {
            emoji: "error",
            time: message.time.convertMS(time * 1000)
        });

        channel.setRateLimitPerUser(time).catch(error => {
            return message.drake("moderation/slowmode:ERROR", {
                emoji: "error",
                error: error
            });
        });

        return message.drake("moderation/slowmode:SUCCES", {
            emoji: "succes",
            time: time != 0 ? message.time.convertMS(time * 1000) : "0",
            channel: "<#" + channel.id + ">"
        });
    };

    async runInteraction(interaction, data) {

        const channel = interaction.options.getChannel("channel") || interaction.channel;
        
        let time = interaction.options.getString("time");
        time = isNaN(time) ? (ms(time) / 1000) : time;

        if(!interaction.guild.channels.cache.has(channel.id)) return interaction.reply({
            content: interaction.drakeWS("moderation/slowmode:CHANNEL_NOT_HERE", {
                emoji: "error"
            }),
            ephemeral: true
        });

        if(isNaN(time)) return interaction.reply({
            content: interaction.drakeWS("errors:NOT_CORRECT", {
                emoji: "error",
                usage: data.guild.prefix + "slowmode <time> (channel)"
            }),
            ephemeral: true
        });

        if(time == 0) {
            if(channel.rateLimitPerUser != 0) {
                channel.setRateLimitPerUser(0).catch(error => {
                    return interaction.reply({
                        content: interaction.drakeWS("moderation/slowmode:ERROR", {
                            emoji: "error",
                            error: error
                        }),
                        ephemeral: true
                    });
                });
    
                return interaction.reply({
                    content: interaction.drakeWS("moderation/slowmode:SUCCES_DISABLED", {
                        emoji: "succes",
                        channel: "<#" + channel.id + ">"
                    })
                });
            } else {
                return interaction.reply({
                    content: interaction.drakeWS("moderation/slowmode:ALREADY_DISABLED", {
                        emoji: "error"
                    }),
                    ephemeral: true
                });
            };
        };

        if(time < 0 || time > 21600) return interaction.reply({
            content: interaction.drakeWS("moderation/slowmode:TOO_LONG", {
                emoji: "error"
            }),
            ephemeral: true
        });

        if(time === channel.rateLimitPerUser) return interaction.reply({
            content: interaction.drakeWS("moderation/slowmode:ALREADY_TIME", {
                emoji: "error",
                time: message.time.convertMS(time * 1000)
            }),
            ephemeral: true
        });

        channel.setRateLimitPerUser(time).catch(error => {
            return interaction.reply({
                content: interaction.drakeWS("moderation/slowmode:ERROR", {
                    emoji: "error",
                    error: error
                }),
                ephemeral: true
            });
        });

        return interaction.reply({
            content: interaction.drakeWS("moderation/slowmode:SUCCES", {
                emoji: "succes",
                time: time !== 0 ? interaction.time.convertMS(time * 1000) : 0,
                channel: "<#" + channel.id + ">"
            })
        });
    };
};

module.exports = Slowmode;