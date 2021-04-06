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
        
        const member = message.mentions.members.first() || message.guild.member(args[0]);

        if(!member) return message.drake("errors:NOT_CORRECT", {
            usage: data.guild.prefix + "warn <user> (reason)",
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

        async function warn() {
            await member.send(message.drakeWS("moderation/warn:WARN_DM", {
                emoji: "warn",
                username: member.user.username,
                server: message.guild.name,
                moderator: message.author.tag,
                reason
            })).catch(() => {});

            data.guild.cases++;
            data.guild.save();

            const caseInfo = {
                moderator: message.author.id,
                date: Date.now(),
                type: "warn",
                case: data.guild.cases,
                reason: reason,
            };
            
            memberData.sanctions.push(caseInfo);
            memberData.save();
    
            return this.client.functions.sendSanctionMessage(message, "warn", member.user, reason)
        };

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
                warn();
                message.delete().catch(() => {});
                return msg.delete().catch(() => {});
            } else {
                message.drake("common:CANCEL", { emoji: "succes "});
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