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
            restriction: []
        });
    };

    async run(message, args, data) {

        data.user.names = [];
        await data.user.save();

        return message.drake("general/clear-my-data:SUCCES", {
            emoji: "succes"
        });
    };
};

module.exports = ClearMyData;