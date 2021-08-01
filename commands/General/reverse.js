const Command = require("../../structure/Commands.js");
const { Constants: { ApplicationCommandOptionTypes } } = require("discord.js");

class Reverse extends Command {

    constructor(client) {
        super(client, {
            name: "reverse",
            aliases: [],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "SEND_MESSAGES" ],
            userPerms: [],
            cooldown: 3,
            restriction: [],

            slashCommandOptions: {
                description: "Reverse a text",
                options: [
                    {
                        name: "text",
                        type: ApplicationCommandOptionTypes.STRING,
                        required: true,
                        description: "The text you want to reverse"
                    }
                ]
            }
        });
    };

    async run(message, args, data) {

        if(!args[0]) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "reverse <text>"
        });

        let i1 = 0
        let texteFinal = ""
        var texte = args.join(" ");
        for(i1 = texte.length - 1; i1 >- 1; i1--) texteFinal += texte[i1];

        if(texteFinal.includes("@here")) return message.drake("general/reverse:HERE", {
            emoji: "error"
        });

        if(texteFinal.includes("@everyone")) return message.drake("general/reverse:EVERYONE", {
            emoji: "error"
        });

        return message.channel.send({
            content: texteFinal
        });
    };

    async runInteraction(interaction, data) {

        let i1 = 0
        let texteFinal = ""
        var texte = interaction.options.getString("text");
        for(i1 = texte.length - 1; i1 >- 1; i1--) texteFinal += texte[i1];

        if(texteFinal.includes("@here")) return interaction.reply({
            content: interaction.drakeWS("general/reverse:HERE", {
                emoji: "error"
            }),
            ephemeral: true
        });

        if(texteFinal.includes("@everyone")) return interaction.reply({
            content: interaction.drakeWS("general/reverse:EVERYONE", {
                emoji: "error"
            }),
            ephemeral: true
        });

        return interaction.reply({
            content: texteFinal
        });
    };
};

module.exports = Reverse;