const Command = require("../../structure/Commands.js");
const { MessageEmbed } = require("discord.js");

class Ban extends Command {

    constructor(client) {
        super(client, {
            name: "ban",
            aliases: [],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "BAN_MEMBERS" ],
            userPerms: [ "BAN_MEMBERS"],
            cooldown: 3,
            restriction: []
        });
    };

    async run(message, args, data) {

        let client = this.client;
        const filter = (reaction, user) => {
            return ['👍', '👎'].includes(reaction.emoji.name) && user.id === message.author.id;
        };

        if(!args[0]) return message.drake("errors:NOT_CORRECT", {
            usage: data.guild.prefix + "ban <user> (reason)",
            emoji: "error"
        });
        
        const member = message.mentions.members.first() || message.guild.member(client.users.cache.get(args[0]));

        if(!member) return message.drake("misc:MEMBER_NOT_FOUND", {
            emoji: "error"
        });

        if(member.id === message.author.id) return message.drake("misc:YOURSELF", {
            emoji: "error"
        });

        const memberPosition = member.roles.highest.position;
        const moderationPosition = message.member.roles.highest.position;
        if(moderationPosition < memberPosition) return message.drake("misc:SUPERIOR", {
            emoji: "error"
        });

        if(!member.kickable) return message.drake("moderation/ban:NOT_BANABLE", {
            emoji: "error"
        });

        const memberData = await client.db.findOrCreateMember(member, message.guild);

        let reason = args.slice(1).join(" ");
        if(!reason) reason = message.drakeWS("misc:NO_REASON");

        let logReason = message.drakeWS("moderation/ban:LOG", {
            moderator: message.author.username,
            reason
        });

        async function ban() {
            await member.send(message.drakeWS("moderation/ban:BAN_DM", {
                emoji: "ban",
                username: member.user.username,
                server: message.guild.name,
                moderator: message.author.tag,
                reason
            })).catch(() => {});
    
            await message.guild.members.ban(member.user, { reason: logReason } ).then(() => {
                data.guild.cases++;
                data.guild.save();

                const caseInfo = {
                    moderator: message.author.id,
                    date: Date.now(),
                    type: "ban",
                    case: data.guild.cases,
                    reason: reason,
                };
                
                memberData.sanctions.push(caseInfo);
                memberData.save();

                if(data.guild.plugins.logs.mod) {
                    if(!client.channels.cache.get(data.guild.plugins.logs.mod)) {
                        data.guild.plugins.logs.mod = false;
                    };
    
                    client.functions.sendModLog("ban", member.user, client.channels.cache.get(data.guild.plugins.logs.mod), message.author, data.guild.cases, reason);
                };
                
                return client.functions.sendSanctionMessage(message, "ban", member.user, reason)
            }).catch((error) => {
                client.functions.sendErrorCmd(client, message, this.help.name, error);
            });

            await data.guild.save()
        };

        let msg = await message.channel.send(message.drakeWS("moderation/ban:CONFIRM", {
            emoji: "question",
            user: member.user.tag,
            reason: reason
        }));

        await msg.react('👍');
        await msg.react('👎');
        
        await msg.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] }).then(collected => {
            let reaction = collected.first();
            let reactionName = reaction.emoji.name;
            if(reactionName == '👍') { 
                ban();
                message.delete().catch(() => {});
                return msg.delete().catch(() => {});
            } else {
                message.drake("common:CANCEL", { emoji: "succes"});
                msg.delete().catch(() => {});
                return message.delete().catch(() => {});
            }
        }).catch(collected => {
            msg.delete().catch(() => {});
            return message.delete().catch(() => {});
        });
    };  
};

module.exports = Ban;