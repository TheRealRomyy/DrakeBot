const Command = require("../../structure/Commands.js");

class Setsuggest extends Command {

    constructor(client) {
        super(client, {
            name: "setsuggest",
            aliases: [ "set-suggest" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "MANAGE_CHANNELS" ],
            userPerms: [ "MANAGE_GUILD" ],
            cooldown: 5,
            restriction: []
        });
    };

    async run(message, args, data) {

        if(data.guild.plugins.suggestions != null) {

            data.guild.plugins.suggestions = null;
            await data.guild.save();

            return message.drake("administration/setsuggest:DISABLED", {
                emoji: "succes"
            });
        };

        if(!args[0]) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "setsuggest <channel>"
        });

        let channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.guild.channels.cache.find(ch => ch.name === args[0]);

        if(!channel) return message.drake("administration/setsuggest:CHANNEL_NOT_FOUND", {
            emoji: "error"
        });

        if(channel.type == "voice") return message.drake("administration/setsuggest:VOICE", {
            emoji: "error"
        });

        data.guild.plugins.suggestions = channel.id;
        await data.guild.save();

        return message.drake("administration/setsuggest:SUCCES", {
            emoji: "succes",
            channel: "<#" + channel.id + ">"
        });
    };
};

module.exports = Setsuggest;