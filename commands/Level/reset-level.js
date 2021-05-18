const Command = require("../../structure/Commands.js");

class ResetLevel extends Command {

    constructor(client) {
        super(client, {
            name: "reset-level",
            aliases: ["reset-xp", "resetlevel", "reset-lvl"],
            dirname: __dirname,
            enabled: true,
            botPerms: [],
            userPerms: ["MANAGE_GUILD"],
            cooldown: 5,
            restriction: []
        });
    };

    async run(message, args, data) {

        let waitMsg = null;

        const filter = (reaction, user) => {
            return ['👍', '👎'].includes(reaction.emoji.name) && user.id === message.author.id;
        };
    
        async function WaitForReaction(msg) {
    
            let reaction = null;
    
            await msg.awaitReactions(filter, { max: 1, time: 30000, errors: ['time'] }).then(collected => {
                reaction = collected.first();
            }).catch(collected => {
                waitMsg.delete();
                message.drake("misc:CANCEL", {
                    emoji: "succes"
                });
                return message.delete();
            });
    
            if(reaction == null) return;
            return reaction.emoji.name;
        };
    
        if(args[0]) {
    
            const member = message.mention.members.first() || message.guild.member(this.client.users.cache.get(args[0]));
            if(!member) return message.drake("errors:NOT_CORRECT", {
                emoji: "error",
                usage: data.guild.prefix + "reset-level (user)"
            });
    
            waitMsg = await message.drake("level/reset-level:WANT?", {
                emoji: "question",
                toreset: member.user.username
            });
    
            await waitMsg.react('👍');
            await waitMsg.react('👎');
    
            const acceptOrDecline = await WaitForReaction(waitMsg);
    
            waitMsg.delete();
    
            if(acceptOrDecline == '👍') {
    
                const memberData = (member.id === message.author.id ? data.member : await this.client.db.findOrCreateMember(member, message.guild));
    
                memberData.level = 1;
                memberData.exp = 0;
                memberData.exptotal = 0;
                await memberData.save();
    
                return message.drake("level/reset-level:SUCCES_MEMBER", {
                    emoji: "succes",
                    username: member.user.username
                });
    
            } else {
                message.drake("misc:CANCEL", {
                    emoji: "succes"
                });
                return message.delete();
            }
    
        } else {
    
            waitMsg = await message.channel.send(message.drakeWS("level/reset-level:WANT?", {
                emoji: "question",
                toreset: "Guild: `" + message.guild.name + "`"
            }));
    
            await waitMsg.react('👍');
            await waitMsg.react('👎');
    
            const acceptOrDecline = await WaitForReaction(waitMsg);
    
            waitMsg.delete();
    
            if(acceptOrDecline == '👍') {
    
                const members = await this.client.db.fetchGuildMembers(message.guild.id);
    
                await members.forEach(async (m) => {
                    const memberData = await this.client.db.findOrCreateMember(m, message.guild);
                    memberData.level = 1;
                    memberData.exp = 0;
                    memberData.exptotal = 0;
                    await memberData.save();
                });
    
    
                return message.drake("level/reset-level:SUCCES_GUILD", {
                    emoji: "succes",
                    guild: message.guild.name
                });
    
            } else {
                message.drake("misc:CANCEL", {
                    emoji: "succes"
                });
                return message.delete();
            }
    
        }
    };
};

module.exports = ResetLevel;