const Command = require("../../structure/Commands.js");
const { MessageAttachment, MessageEmbed } = require("discord.js");
const canvacord = require("canvacord");

class Test extends Command {

	constructor (client) {
		super(client, {
            name: "test",
            aliases: [],
			dirname: __dirname,
			enabled: true,
			botPers: [],
			userPerms: [],
            cooldown: 3,
            restriction: [ "MODERATOR" ]
		});
	}

	async run (message, args, data) {

        const embed = new MessageEmbed()
        .setAuthor("Author")
        .addField("Première", "```Première```", true)
        .addField("Deuxième", "```Deuxième```", true)

        return message.channel.send(embed);
	};
};

module.exports = Test;