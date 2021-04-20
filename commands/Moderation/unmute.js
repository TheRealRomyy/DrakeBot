const Command = require("../../structure/Commands.js");

class Unmute extends Command {

    constructor(client) {
        super(client, {
            name: "unmute",
            aliases: ["un-mute"],
            enabled: true,
            dirname: __dirname,
            botPerms: ["MANAGE_ROLES"],
            userPerms: ["MANAGE_MESSAGES"],
            restriction: []
        });
    };

    async run(message, args, data) {

        let member = message.mentions.members.first() || message.guild.member(args[0]);
        let reason = args[1] ? args.slice(1).join(" ") : message.drakeWS("misc:NO_REASON");

        if(!member) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "unmute <user> (reason)"
        });

        let memberData = await this.client.db.findOrCreateMember(member, message.guild);

        if(!memberData.mute.muted) return message.drake("moderation/unmute:NOT_MUTE", {
            user: "<@" + member.user.id + ">",
            emoji: "error"
        });

        let muteRole = member.guild.roles.cache.find(r => r.name === 'Drake - Mute');
        member.roles.remove(muteRole).catch(() => {});

        member.send(message.drakeWS("moderation/mute:UNMUTE_DM", {
            emoji: "unmute",
            username: member.user.username,
            server: message.guild.name,
            reason: reason,
        }));

        memberData.mute = {
            muted: false,
            endDate: null,
            case: null
        };

        this.client.functions.sendSanctionMessage(message, "unmute", member.user, reason)

        if(data.guild.plugins.logs.mod) {
            if(!this.client.channels.cache.get(data.guild.plugins.logs.mod)) {
                data.guild.plugins.logs.mod = false;
                await data.guild.save()
            };

            this.client.functions.sendModLog("unmute", member.user, this.client.channels.cache.get(data.guild.plugins.logs.mod), message.author, data.guild.cases, reason);
        };

        this.client.mutedUsers.delete(`${memberData.id}${memberData.guildid}`);
        await memberData.save();
    };
};

module.exports = Unmute;