const Command = require("../../structure/Commands.js");

class Morpion extends Command {

    constructor(client) {
        super(client, {
            name: "morpion",
            aliases: [],
            enabled: true,
            botPerms: [],
            dirname: __dirname,
            userPerms: [],
            cooldown: 5,
            restriction: []
        });
    };

    async run(message, args, data) {

        let client = this.client;

        let tableauDeJeux = [" ", " ", " ", " ", " ", " ", " ", " ", " "];
        let stop = false;

        // Create filter
        const filter = (m) => m.author.id === message.author.id;
        const opt = { max: 1, time: 60000, errors: [ "time" ] };

        async function askToPlay() {
            // Ask what is to play
            let msg = await message.channel.send(client.emotes["question"] + " **Quel case vouler vous jouer ?** (de 1 à 9)");

            // Get first response
            let collected = await message.channel.awaitMessages(filter, opt).catch(() => {});
            if(!collected || !collected.first()) {
                stop = true;
                msg.delete().catch(() => {});
                return message.drake("common:CANCEL", {
                    emoji: "succes"
                });
            };

            const confMessage = collected.first().content;
            if(confMessage === "cancel" || isNaN(confMessage) || parseInt(confMessage) > 9 || parseInt(confMessage) === 0) {
                stop = true;
                msg.delete().catch(() => {});
                return message.drake("common:CANCEL", {
                    emoji: "succes"
                });
            };
            msg.delete().catch(() => {});
            collected.first().delete().catch(() => {});

            return confMessage;
        };

        async function loop() {

            if(stop) return;

            let choice = await askToPlay();

            if(await isCaseFree(parseInt(choice))) {
                tableauDeJeux[parseInt(choice) - 1] = "V";
                tableau.edit("```" + tableauDeJeux[0] + " | " + tableauDeJeux[1] + " | " + tableauDeJeux[2] + "\n" + tableauDeJeux[3] + " | " + tableauDeJeux[4] + " | " + tableauDeJeux[5] + "\n" + tableauDeJeux[6] + " | " + tableauDeJeux[7] + " | " + tableauDeJeux[8] + "```");
                loop();
            } else {
                message.channel.send(client.emotes["error"] + " **Cette case n'est pas libre !**").then(m => m.delete({
                    timeout: 3000
                }));
                loop();
            };
        };

        async function isCaseFree(slot) {
            if(tableauDeJeux[slot - 1] == " ") {
                return true
            } else {
                return false;
            };
        };

        let tableau = await message.channel.send("```" + tableauDeJeux[0] + " | " + tableauDeJeux[1] + " | " + tableauDeJeux[2] + "\n" + tableauDeJeux[3] + " | " + tableauDeJeux[4] + " | " + tableauDeJeux[5] + "\n" + tableauDeJeux[6] + " | " + tableauDeJeux[7] + " | " + tableauDeJeux[8] + "```");
        loop();
    };
};

module.exports = Morpion;