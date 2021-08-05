const Command = require("../../structure/Commands");

class Setsymbol extends Command {

	constructor (client) {
		super(client, {
			name: "setsymbol",
			aliases: [ "set-symbol" ],
			dirname: __dirname,
			enabled: false,
			botPerms: [ "SEND_MESSAGES" ],
			userPerms: [ "MANAGE_GUILD" ],
			cooldown: 0,
			restriction: [],
		});
	};

	async run (message, args, data) {

        let symbol = args[0];

        if(!symbol) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "setsymbol <symbol>"
        });

        data.guild.symbol = symbol;
        await data.guild.save();

        return message.drake("administration/setsymbol:SUCCES", {
            emoji: "succes",
            newSymbol: symbol
        });
    };
};

module.exports = Setsymbol;