const Command = require("../../structure/Commands.js");
const { Constants: { ApplicationCommandOptionTypes } } = require("discord.js");

class Setlang extends Command {

    constructor(client) {
        super(client, {
            name: "setlang",
            aliases: [ "set-lang", "lang", "language" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "EMBED_LINKS", "SEND_MESSAGES" ],
            userPerms: [ "MANAGE_GUILD" ],
            cooldown: 10,
            restriction: [],

            slashCommandOptions: {
                description: "Setup DrakeBot's language in this server",
                options: [
                    {
                        name: "language",
                        type: ApplicationCommandOptionTypes.STRING,
                        required: true,
                        description: "What's the new language ?",
                        choices: [
                            {
                                name: "French 🇫🇷",
                                value: "fr"
                            },
                            {
                                name: "English 🇬🇧",
                                value: "en"
                            }
                        ]
                    }
                ]
            }
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

        if(language.name === "en-US") message.channel.send({
            content: "**:flag_gb: The language is now english !**"
        });
        else if(language.name === "fr-FR") message.channel.send({
            content: "**:flag_fr: La langue est désormais le français !**"
        });

		data.guild.language = language.name;
		await data.guild.save();
    };

    async runInteraction(interaction, data) {

        const language = this.client.cfg.lang.find((l) => l.name === interaction.options.getString("language") || l.aliases.includes(interaction.options.getString("language")));

        if(language.name === data.guild.language) return interaction.reply({
            content: interaction.drakeWS("administration/setlang:ALREADY", {
                emoji: "error"
            }),
            ephemeral: true
        });

        if(language.name === "en-US") interaction.reply({
            content: "**:flag_gb: The language is now english !**"
        });
        else if(language.name === "fr-FR") interaction.reply({
            content: "**:flag_fr: La langue est désormais le français !**"
        });

		data.guild.language = language.name;
		await data.guild.save();
    };
};

module.exports = Setlang;