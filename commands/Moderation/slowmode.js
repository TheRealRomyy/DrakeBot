const Command = require("../../structure/Commands.js");
const ms = require("ms");

class Slowmode extends Command {

    constructor(client) {
        super(client, {
            name: "slowmode",
            aliases: ["slow-mode"],
            enabled: true,
            dirname: __dirname,
            botPerms: ["MANAGE_CHANNELS"],
            userPerms: ["MANAGE_CHANNELS"],
            restriction: []
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
            time: time !== 0 ? message.time.convertMS(time * 1000) : 0,
            channel: "<#" + channel.id + ">"
        });
    };
};

module.exports = Slowmode;