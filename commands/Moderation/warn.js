const Command = require("../../structure/Commands.js");

class Warn extends Command {

    constructor(client) {
        super(client, {
            name: "warn",
            aliases: [],
            dirname: __dirname,
            enabled: false,
            botPerms: [],
            userPerms: [ "MANAGE_MESSAGES"],
            cooldown: 3,
            restriction: []
        });
    };

    async run(message, args, data) {

        let client = this.client;

        const filter = (button) => button.clicker.user.id === message.author.id;

        if(!args[0] && !message.mentions.users.first()) return message.drake("errors:NOT_CORRECT", {
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

        let reason = args.slice(message.mentions.users.first() ? (args[0].includes(user.id) ? 1 : 0) : 1).join(" ").trim();
        if(!reason) reason = message.drakeWS("misc:NO_REASON");

        let msg = await message.channel.send(message.drakeWS("moderation/warn:CONFIRM", {
            emoji: "question",
            user: member.user.tag,
            reason: reason
        }));

        let yesButton = new MessageButton()
        .setStyle('green')
        .setLabel('Yes 👍')
        .setID(`${message.guild.id}${message.author.id}${Date.now()}YES-WARN`);

        let noButton = new MessageButton()
        .setStyle('red')
        .setLabel('No 👎')
        .setID(`${message.guild.id}${message.author.id}${Date.now()}NO-WARN`);

        let group1 = new MessageActionRow().addComponents([ yesButton, noButton ]);

        await msg.edit({
            components: [group1]
        }).catch(() => {});
        
        await msg.awaitButtons(filter, { max: 1, time: 60000, errors: ['time'] }).then(collected => {
            let button = collected.first();
            if(!button) {
                msg.delete().catch(() => {});
                return message.delete().catch(() => {});
            };
            if(button.id === yesButton.custom_id) { 
                client.functions.warn(member, message, message.author, data.guild, reason, memberData, client);
                client.functions.checkAutoSanctions(data.guild, member, memberData, message, client);
                message.delete().catch(() => {});
                return msg.delete().catch(() => {});
            } else {
                message.drake("common:CANCEL", { emoji: "succes"});
                msg.delete().catch(() => {});
                return message.delete().catch(() => {});
            }
        });
    };  
};

module.exports = Warn;