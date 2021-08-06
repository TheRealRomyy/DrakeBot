const Command = require("../../structure/Commands");
const { Constants: { ApplicationCommandOptionTypes } } = require("discord.js");

class Setsymbol extends Command {

	constructor (client) {
		super(client, {
			name: "setsymbol",
			aliases: [ "set-symbol" ],
			dirname: __dirname,
			enabled: true,
			botPerms: [ "SEND_MESSAGES" ],
			userPerms: [ "MANAGE_GUILD" ],
			cooldown: 0,
			restriction: [],

			slashCommandOptions: {
				description: "Setup a symbol for DrakeBot's economy system (default is $)",
				options: [
					{
						name: "symbol",
						type: ApplicationCommandOptionTypes.STRING,
						required: true,
						description: "What's the new symbol ?"
					}
				]
			}
		});
	};

	async run (message, args, data) {

        let symbol = args[0];

        if(!symbol) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "setsymbol <symbol>"
        });

		if(symbol.length > 1) return message.drake("administration/setsymbol:TOO_LONG", {
			emoji: "error"
		});

        data.guild.symbol = symbol;
        await data.guild.save();

        return message.drake("administration/setsymbol:SUCCES", {
            emoji: "succes",
            newSymbol: symbol
        });
    };

	async runInteraction (interaction, data) {

        let symbol = interaction.options.getString("symbol");

		if(symbol.length > 1) return interaction.reply({
			content: interaction.drakeWS("administration/setsymbol:TOO_LONG", {
				emoji: "error"
			}),
			ephemeral: true
		});

        data.guild.symbol = symbol;
        await data.guild.save();

        return interaction.reply({
			content: interaction.drakeWS("administration/setsymbol:SUCCES", {
				emoji: "succes",
				newSymbol: symbol
			})
        });
    };
};

module.exports = Setsymbol;