const Command = require("../../structure/Commands");
const { MessageEmbed } = require("discord.js");

class Userinfo extends Command {

    constructor(client) {
        super(client, {
            name: "userinfo",
            aliases: [ "ui", "whois", "user" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "EMBED_LINKS", "SEND_MESSAGES" ],
            userPerms: [],
            cooldown: 3,
            restriction: [],
        });
    };

    async run(message, args, data) {

        let client = this.client;

        const user = message.mentions.users.first() || client.users.cache.get(args[0]) || message.author;
        const member = await message.guild.members.fetch(user).catch(() => {});

        let badges = "";
        const animatedAvatar = user.avatarURL({ dynamic: true })

        const userData = await this.client.db.findOrCreateUser(user);
        
        // J'ai enlevé les descriptions     ça parce que useless
        let desc = userData.desc ? (userData.desc !== null ? userData.desc : message.drakeWS("general/userinfo:NO_DESC")) : message.drakeWS("general/userinfo:NO_DESC"); 
        if(user.id === message.author.id) desc = desc === message.drakeWS("general/userinfo:NO_DESC") ? message.drakeWS("general/userinfo:NO_DESC_AUTHOR", { prefix: data.guild.prefix }) : desc;

        if(!user.bot) for (const [badge, value] of Object.entries(user.flags.serialize())) {
            if(value && client.emotes.badges[badge]) badges += client.emotes.badges[badge] + " ";
        };

        if(animatedAvatar !== user.avatarURL()) badges += client.emotes.badges["NITRO"] + " ";

        const st = user.presence.status;

        const embed = new MessageEmbed()
        .setAuthor(user.username, user.displayAvatarURL({ dynamic: true }))
        .setFooter(this.client.cfg.footer)
        .setDescription(badges + (user.presence.activities.filter(act => act.name = "Custom Status" && act.type == "CUSTOM_STATUS") != "" ? "\n" + (user.presence.activities.filter(act => act.name = "Custom Status" && act.type == "CUSTOM_STATUS")[0].emoji !== null ? user.presence.activities.filter(act => act.name = "Custom Status" && act.type == "CUSTOM_STATUS")[0].emoji.name + " " : "") + user.presence.activities.filter(act => act.name = "Custom Status" && act.type == "CUSTOM_STATUS")[0].state : ""))
        .setColor("RANDOM")
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .addField(message.drakeWS("general/userinfo:NAME", {
            emoji: "label"
        }), user.username + " (#" + user.discriminator + ")", true)
        .addField(message.drakeWS("general/userinfo:ID", {
            emoji: "id"
        }), "||" + user.id + "||", true)
        .addField(message.drakeWS("general/userinfo:BOT", {
            emoji: "bot"
        }), user.bot ? message.drakeWS("common:YES") : message.drakeWS("common:NO"), true)
        .addField(message.drakeWS("general/userinfo:CREATE", {
            emoji: "calendar"
        }), this.client.functions.printDateFrom(user.createdAt), true)
        .addField(message.drakeWS("general/userinfo:NICKNAME", {
            emoji: "nickname"
        }), member.nickname ? member.nickname : message.drakeWS("common:NO"), true)
        .addField(message.drakeWS("general/userinfo:JOIN", {
            emoji: "calendar2"
        }), this.client.functions.printDateFrom(member.joinedAt), true)
        .addField(this.client.emotes.status[st] + message.drakeWS("general/userinfo:STATUT"), message.drakeWS("general/userinfo:STATUS_" + st.toUpperCase()), true)
        .addField(message.drakeWS("general/userinfo:GAME", {
            emoji: "play"
        }), (user.presence.activity ? user.presence.activity.name : message.drakeWS("general/userinfo:NO_GAME")), true)
        .addField(message.drakeWS("general/userinfo:HR", {
            emoji: "up"
        }), member.roles.highest, true)
        .addField(message.drakeWS("general/userinfo:ROLES", {
            emoji: "roleList",
            roleList: member.roles.cache.size
        }), (member.roles.size > 10 ? member.roles.cache.map((r) => r).slice(0, 9).join(", ")+" " + message.drakeWS("general/userinfo:MR") : member.roles.cache.map((r) => r).join(", ")), false)

        message.channel.send(embed);
    };
};

module.exports = Userinfo;