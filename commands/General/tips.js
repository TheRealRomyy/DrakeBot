const Command = require("../../structure/Commands.js");

class Tips extends Command {

    constructor(client) {
        super(client, {
            name: "tips",
            aliases: ["astuces", "astuce"],
            dirname: __dirname,
            enabled: false,
            botPerms: [],
            userPerms: [],
            cooldown: 2,
            restriction: []
        });
    };

    async run(message, args, data) {

        let number = this.client.functions.getRandomInt(1, this.client.cmds.size);

        return message.drake("general/tips:TIPS_" + number);
    };
};

module.exports = Tips;