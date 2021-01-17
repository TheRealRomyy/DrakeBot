const Command = require("../../structure/Commands.js");

class Setlang extends Command {

    constructor(client) {
        super(client, {
            name: "setlang",
            aliases: [ "set-lang", "lang", "language" ],
            dirname: __dirname,
            enalbled: true,
            botPerms: [ "EMBED_LINKS", "SEND_MESSAGES" ],
            userPerms: [ "MANAGE_GUILD" ],
            cooldown: 10,
            restriction: []
        });
    };

    async run(message, args, data) {

        const language = this.client.cfg.lang.find((l) => l.name === args[0] || l.aliases.includes(args[0]));

        if(language.name === data.guild.language) return message.drake("administration/setlang:ALREADY", {
            emoji: "error"
        });

		if(!args[0] || !language) return message.drake("errors:NOT_CORRECT", {
                usage: data.guild.prefix + "setlang <fr/en>",
                emoji: "error"
			});

		data.guild.language = language.name;
		await data.guild.save();
        
        if(language.name === "en-US") return message.channel.send("**:flag_gb: The language is now english !**");
        else if(language.name === "fr-FR") return message.channel.send("**:flag_fr: La langue est désormais le français !**");
    };
};

module.exports = Setlang;