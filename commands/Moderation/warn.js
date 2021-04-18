const Command = require("../../structure/Commands.js");
const { MessageEmbed } = require("discord.js");

class Warn extends Command {

    constructor(client) {
        super(client, {
            name: "warn",
            aliases: [],
            dirname: __dirname,
            enabled: true,
            botPerms: [],
            userPerms: [ "MANAGE_MESSAGES"],
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
            usage: data.guild.prefix + "warn <user> (reason)",
            emoji: "error"
        });
        
        const member = message.mentions.members.first() || message.guild.member(args[0]);

        if(!member) return message.drake("misc:MEMBER_NOT_FOUND", {
            emoji: "error"
        });

        if(member.id === message.author.id) return message.drake("misc:YOURSELF", {
            emoji: "error"
        });

        if(member.user.bot) return message.drake("moderation/warn:WARN_BOT", {
            emoji: "error"
        });

        const memberPosition = member.roles.highest.position;
        const moderationPosition = message.member.roles.highest.position;
        if(moderationPosition < memberPosition) return message.drake("misc:SUPERIOR", {
            emoji: "error"
        });

        const memberData = await client.db.findOrCreateMember(member, message.guild);

        let reason = args.slice(1).join(" ");
        if(!reason) reason = message.drakeWS("misc:NO_REASON");

        let msg = await message.channel.send(message.drakeWS("moderation/warn:CONFIRM", {
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
                client.functions.warn(member, message, message.author, data.guild, reason, memberData, client);
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

module.exports = Warn;