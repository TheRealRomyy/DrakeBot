const Command = require("../../structure/Commands.js");

class ClearMyData extends Command {

    constructor(client) {
        super(client, {
            name: "clear-my-data",
            aliases: ["data-clear", "clear-data"],
            enabled: true,
            dirname: __dirname,
            botPerms: [],
            userPerms: [],
            restriction: [],

            slashCommandOptions: {
                description: "Clear the data than DrakeBot store about you"
            }
        });
    };

    async run(message, args, data) {

        data.user.names = [];
        await data.user.save();

        return message.drake("general/clear-my-data:SUCCES", {
            emoji: "succes"
        });
    };

    async runInteraction(interaction, data) {

        data.user.names = [];
        await data.user.save();

        interaction.reply({
            content: interaction.drakeWS("general/clear-my-data:SUCCES", {
                emoji: "succes"
            })
        });
    };
};

module.exports = ClearMyData;