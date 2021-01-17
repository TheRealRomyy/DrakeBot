const Command = require("../../structure/Commands.js");

class Nickall extends Command {

    constructor(client) {
        super(client, {
            name: "nickall",
            aliases: [ "nick-all" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "MANAGE_NICKNAMES", "CHANGE_NICKNAME" ],
            userPerms: [ "MANAGE_NICKNAMES" ],
            cooldown: 10,
            restriction: []
        });
    };

    async run(message, args, data) {

        if(!args[0]) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "nickall <nickname>"
        });

        const filter = (reaction, user) => {
            return ['👍', '👎'].includes(reaction.emoji.name) && user.id === message.author.id;
        };

        let nick = args.join(" ");

        async function nickAll() {
            await message.guild.members.cache.forEach((member) => {
                member.setNickname(nick).catch(() => {});
            });

            return msg.delete().catch(() => {});
        };

        let msg = await message.channel.send(message.drakeWS("moderation/nickall:CONFIRM", {
            emoji: "question"
        }));

        await msg.react('👍');
        await msg.react('👎');
        
        await msg.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] }).then(collected => {
            let reaction = collected.first();
            let reactionName = reaction.emoji.name;
            if(reactionName == '👍') { 
                nickAll();
                return message.drake("moderation/nickall:SUCCES", {
                    emoji: "succes"
                });
            } else {
                msg.delete().catch(() => {});
                return message.delete().catch(() => {});
            }
        }).catch(collected => {
            msg.delete().catch(() => {});
            return message.delete().catch(() => {});
        });
    };
};

module.exports = Nickall;