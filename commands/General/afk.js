const Command = require("../../structure/Commands");

class Afk extends Command {

    constructor(client) {
        super(client, {
            name: "afk",
            aliases: [ "settafk" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "EMBED_LINKS", "SEND_MESSAGES" ],
            userPerms: [],
            cooldown: 3,
            restriction: [],
        });
    };

    async run(message, args, data) {

        let reason = args.join(" ");

        if(!reason) return message.drake("errors:NOT_CORRECT", {
            usage: data.guild.prefix + "afk <reason>",
            emoji: "error"
        });

        message.drake("general/afk:SUCCES", {
            emoji: "succes",
            reason
        });

        data.user.afk = reason;
        data.user.save();
    };
};

module.exports = Afk;