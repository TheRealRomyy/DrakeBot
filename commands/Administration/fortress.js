const Command = require("../../structure/Commands.js");

class Fortress extends Command {

    constructor(client) {
        super(client, {
            name: "fortress",
            aliases: ["forteresse"],
            enabled: false,
            dirname: __dirname,
            botPerms: [ "ADMINISTRATOR" ],
            userPerms: [ "ADMINISTRATOR" ],
            restriction: []
        });
    };

    async run(message, args, data) {

        let filter = (reaction, user) => {
            return ['👍', '👎'].includes(reaction.emoji.name) && user.id === message.author.id;
        };
        let confirmationMsg = null;

        async function WaitForReaction(msg) {

            let reaction = null;
    
            await msg.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] }).then(collected => {
                reaction = collected.first();
                reaction.users.remove(message.author.id).catch(() => {});
            }).catch(collected => {
                return cancel();
            });
    
            if(reaction == null) return;
            return reaction.emoji.name;
        };

        async function cancel() {
            confirmationMsg.delete().catch(() => {});
            message.delete().catch(() => {});
        };

        if(data.guild.fortress) {

            data.guild.fortress = false;
            await data.guild.save();

            return message.drake("administration/fortress:SUCCES_DISABLED", {
                emoji: "succes"
            });

        } else {
            confirmationMsg = await message.channel.send(message.drakeWS("administration/fortress:CONFIRMATION", {
                emoji: "question"
            }));

            await confirmationMsg.react('👍');
            await confirmationMsg.react('👎');

            let reaction = await WaitForReaction(confirmationMsg);

            if(reaction == '👍') {

                confirmationMsg.delete().catch(() => {});

                data.guild.fortress = true;
                await data.guild.save()

                return message.drake("administration/fortress:SUCCES", {
                    emoji: "succes"
                });

            } else if(reaction == '👎') {
                confirmationMsg.delete().catch(() => {});

                return message.drake("common:CANCEL", {
                    emoji: "succes"
                });
            } else {
                return cancel()
            };
        };
    };
};

module.exports = Fortress;