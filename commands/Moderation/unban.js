const Command = require("../../structure/Commands.js");
const { MessageEmbed } = require("discord.js");

class Unban extends Command {

    constructor(client) {
        super(client, {
            name: "unban",
            aliases: ["pardon"],
            enabled: true,
            dirname: __dirname,
            botPerms: ["BAN_MEMBERS"],
            userPerms: ["BAN_MEMBERS"],
            restriction: []
        });
    };

    async run(message, args, data) {

        if(!args[0]) return message.drake("errors:NOT_CORRECT", {
            usage: data.guild.prefix + "unban <user> (reason) (--message)",
            emoji: "error"
        });

        let user = message.mentions.users.first() || this.client.users.cache.get(args[0]);
        if(!user) return message.drake("moderation/unban:NOT_BAN", {
            user: user.username,
            emoji: "error"
        });

        let reason = args.slice(1).join(" ").replace("--message", "");
        if(!reason || reason.trim() == "--message") reason = message.drakeWS("misc:NO_REASON");

        let sendMessage = message.content.includes("--message");
        let logReason = `${message.author.username} | ${reason}`;

        message.guild.fetchBans()
        .then(bans=> {
            if(bans.size == 0) return message.drake("moderation/unban:NOT_BAN", {
                user: user.username,
                emoji: "error"
            });
            let banUser = bans.find(b => b.user.id == user.id);
            if(!banUser) return message.drake("moderation/unban:NOT_BAN", {
                user: user.username,
                emoji: "error"
            });
            message.guild.members.unban(banUser.user, logReason);
        });

        if(sendMessage) user.send(message.drakeWS("moderation/unban:UNBAN_DM", {
                reason, 
                moderator: message.author.username,
                user: user.username,
                server: message.guild.name,
                emoji: "unban"
            })).catch(() => message.drake("moderation/unban:CANT_DM", {
                emoji: "error",
                user: user.username
        }));

        const embed = new MessageEmbed()
        .setTitle(message.drakeWS("moderation/unban:UNBAN", {
            username: user.tag,
            emoji: "succes"
        }))
        .setColor(this.client.cfg.color.green);
        
        return message.channel.send(embed);
    };
};

module.exports = Unban;