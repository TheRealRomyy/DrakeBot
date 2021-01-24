const Command = require("../../structure/Commands.js");

class Nuke extends Command {

    constructor(client) {
        super(client, {
            name: "nuke",
            aliases: [],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "MANAGE_CHANNELS", "MANAGE_MESSAGES" ],
            userPerms: [ "MANAGE_CHANNELS", "MANAGE_MESSAGES" ],
            cooldown: 5,
            restriction: []
        });
    };

    async run(message, args, data) {
                
        const filter = (reaction, user) => {
            return ['👍', '👎'].includes(reaction.emoji.name) && user.id === message.author.id;
        };

        async function nuke() {
            const position = message.channel.position;
            const newChannel = await message.channel.clone();
            await message.channel.delete();
            newChannel.setPosition(position);

            return newChannel.send(message.drakeWS("moderation/nuke:SUCCES", {
                emoji: "nuke",
                author: message.author
            }));
        };

        let msg = await message.channel.send(message.drakeWS("moderation/nuke:CONFIRM", {
            emoji: "question"
        }));

        await msg.react('👍');
        await msg.react('👎');
        
        await msg.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] }).then(collected => {
            let reaction = collected.first();
            let reactionName = reaction.emoji.name;
            if(reactionName == '👍') { 
                return nuke();
            } else {
                return cancel();
            }
        }).catch(collected => {
            return cancel();
        });

        async function cancel() {
            console.log("Cancel")
            msg.delete();
            message.delete();
        };
    };
};

module.exports = Nuke;