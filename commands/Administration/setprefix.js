const Command = require("../../structure/Commands");
const { Constants: { ApplicationCommandOptionTypes } } = require("discord.js");

class Setprefix extends Command {

	constructor (client) {
		super(client, {
			name: "setprefix",
			aliases: [ "set-prefix" ],
			dirname: __dirname,
			enabled: true,
			botPerms: [ "SEND_MESSAGES" ],
			userPerms: [ "MANAGE_GUILD" ],
			cooldown: 0,
			restriction: [],

			slashCommandOptions: {
				description: "Set DrakeBot's prefix on this server",
				options: [
					{
						name: "prefix",
						type: ApplicationCommandOptionTypes.STRING,
						required: true,
						description: "What's the new prefix ?"
					}
				]
			}
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

	async runInteraction(interaction, data) {

        let prefix = interaction.options.getString("prefix");

        data.guild.prefix = prefix;
        await data.guild.save();

        return interaction.reply({
			content: interaction.drakeWS("administration/setprefix:SUCCES", {
				emoji: "succes",
				newPrefix: prefix
			})
        });
    };
};

module.exports = Setprefix;