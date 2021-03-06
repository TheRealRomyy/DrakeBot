const Command = require("../../structure/Commands");

class Setbio extends Command {

    constructor(client) {
        super(client, {
            name: "setbio",
            aliases: [ "set-bio", "setdesc", "set-desc" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "SEND_MESSAGES", "EMBED_LINKS" ],
            userPerms: [],
            cooldown: 10,
            restriction: []
        });
    };

    async run(message, args, data) {

        let bio = args.join(" ");

        if(!bio) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "setbio <bio>"
        });

        data.user.description = bio;
        await data.user.save();

        return message.drake("general/setbio:SUCCES", {
            emoji: "succes"
        });
    };
};

module.exports = Setbio;