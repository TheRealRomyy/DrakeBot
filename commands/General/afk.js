const Command = require("../../structure/Commands");
const { Constants: { ApplicationCommandOptionTypes } } = require("discord.js");

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

            slashCommandOptions: {
                description: "Set an afk status",
                options: [
                    {
                        name: "status",
                        type: ApplicationCommandOptionTypes.STRING,
                        required: true,
                        description: "Your afk status",
                    }
                ]
            }
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

    async runInteraction(interaction, data) {

        let reason = interaction.options.getString("status");

        interaction.reply({
            content: interaction.drakeWS("general/afk:SUCCES", {
                emoji: "succes",
                reason
            })
        });

        data.user.afk = reason;
        data.user.save();
    };
};

module.exports = Afk;