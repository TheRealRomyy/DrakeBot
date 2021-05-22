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
        
        const user = message.mentions.users.first() || client.users.cache.get(args[0]);

        if(!user) return message.drake("misc:USER_NOT_FOUND", {
            emoji: "error"
        });

        if(user.id === message.author.id) return message.drake("misc:YOURSELF", {
            emoji: "error"
        });

        let reason = args.slice(1).join(" ").replace("-f", "").trim();
        if(!reason) reason = message.drakeWS("misc:NO_REASON");

        const member = message.guild.member(user.id);
        if(!member && !message.content.includes("-f")) return message.drake("moderation/ban:NOT_HERE", {
            emoji: "error",
            prefix: data.guild.prefix,
            user: user.id,
            reason: reason !== message.drakeWS("misc:NO_REASON") ? reason : "Spam"
        });

        if(member) {
            const memberPosition = member.roles.highest.position;
            const moderationPosition = message.member.roles.highest.position;
            if(moderationPosition < memberPosition) return message.drake("misc:SUPERIOR", {
                emoji: "error"
            });

            if(!member.kickable) return message.drake("moderation/ban:NOT_BANABLE", {
                emoji: "error"
            });
        };

        const memberData = member ? await client.db.findOrCreateMember(member, message.guild) : null;
        
        let msg = await message.channel.send(message.drakeWS("moderation/ban:CONFIRM", {
            emoji: "question",
            user: user.tag,
            reason: reason
        }));

        await msg.react('👍');
        await msg.react('👎');
        
        await msg.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] }).then(collected => {
            let reaction = collected.first();
            let reactionName = reaction.emoji.name;
            if(reactionName == '👍') { 
                client.functions.ban(user, message, message.author, data.guild, reason, memberData, client);
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