const Command = require("../../structure/Commands.js");

class UnNickall extends Command {

    constructor(client) {
        super(client, {
            name: "un-nickall",
            aliases: [ "reset-nick-all", "reset-nickall" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "MANAGE_NICKNAMES", "CHANGE_NICKNAME" ],
            userPerms: [ "MANAGE_NICKNAMES" ],
            cooldown: 10,
            restriction: []
        });
    };

    async run(message, args, data) {

        const filter = (reaction, user) => {
            return ['👍', '👎'].includes(reaction.emoji.name) && user.id === message.author.id;
        };

        async function unNick() {
            await message.guild.members.cache.forEach((member) => {
                member.setNickname(null).catch(() => {});
            });

            return msg.delete().catch(() => {});
        };

        let msg = await message.channel.send(message.drakeWS("moderation/un-nickall:CONFIRM", {
            emoji: "question"
        }));

        await msg.react('👍');
        await msg.react('👎');
        
        await msg.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] }).then(collected => {
            let reaction = collected.first();
            let reactionName = reaction.emoji.name;
            if(reactionName == '👍') { 
                unNick();
                return message.drake("moderation/un-nickall:SUCCES", {
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

module.exports = UnNickall;