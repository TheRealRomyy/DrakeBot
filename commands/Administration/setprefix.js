const Command = require("../../structure/Commands");

class Setprefix extends Command {

	constructor (client) {
		super(client, {
			name: "setprefix",
			aliases: [ "set-prefix" ],
			dirname: __dirname,
			enabled: false,
			botPerms: [ "SEND_MESSAGES" ],
			userPerms: [ "MANAGE_GUILD" ],
			cooldown: 0,
			restriction: [],
		});
	};

	async run (message, args, data) {

        let prefix = args[0];

        if(!prefix) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "setprefix <prefix>"
        });

        data.guild.prefix = prefix;
        await data.guild.save();

        return message.drake("administration/setprefix:SUCCES", {
            emoji: "succes",
            newPrefix: prefix
        });
    };
};

module.exports = Setprefix;