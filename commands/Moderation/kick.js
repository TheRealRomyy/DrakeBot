const Command = require("../../structure/Commands.js");
const { MessageButton, MessageActionRow } = require("discord-buttons");

class Kick extends Command {

    constructor(client) {
        super(client, {
            name: "kick",
            aliases: [],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "KICK_MEMBERS" ],
            userPerms: [ "KICK_MEMBERS"],
            cooldown: 3,
            restriction: []
        });
    };

    async run(message, args, data) {

        let client = this.client;

        const filter = (button) => button.clicker.user.id === message.author.id;

        if(!args[0]) return message.drake("errors:NOT_CORRECT", {
            usage: data.guild.prefix + "kick <user> (reason)",
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

        if(!member.kickable) return message.drake("moderation/kick:NOT_KICKABLE", {
            emoji: "error"
        });

        const memberData = await client.db.findOrCreateMember(member, message.guild);

        let reason = args.slice(1).join(" ");
        if(!reason) reason = message.drakeWS("misc:NO_REASON");

        let msg = await message.channel.send(message.drakeWS("moderation/kick:CONFIRM", {
            emoji: "question",
            user: member.user.tag,
            reason: reason
        }));

        let yesButton = new MessageButton()
        .setStyle('green')
        .setLabel('Yes 👍')
        .setID(`${message.guild.id}${message.author.id}${Date.now()}YES-KICK`);

        let noButton = new MessageButton()
        .setStyle('red')
        .setLabel('No 👎')
        .setID(`${message.guild.id}${message.author.id}${Date.now()}NO-KICK`);

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
                client.functions.kick(member, message, message.author, data.guild, reason, memberData, client);
                message.delete().catch(() => {});
                return msg.delete().catch(() => {});
            } else {
                message.drake("common:CANCEL", { emoji: "succes"});
                msg.delete().catch(() => {});
                return message.delete().catch(() => {});
            };
        });
    };  
};

module.exports = Kick;