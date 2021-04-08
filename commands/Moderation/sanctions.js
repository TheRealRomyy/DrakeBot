const Command = require("../../structure/Commands.js");
const { MessageEmbed } = require("discord.js");

class Sanctions extends Command {

    constructor(client) {
        super(client, {
            name: "sanctions",
            aliases: [ "modlogs" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [],
            userPerms: [ "MANAGE_MESSAGES" ],
            cooldown: 3,
            restriction: []
        });
    };

    async run(message, args, data) {

        const user = message.mentions.users.first() || this.client.users.cache.get(args[0]) || this.client.users.cache.find(u => u.username === args[0]);

        if(!user) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "sanctions <user>"
        });

        const memberData = await this.client.db.findOrCreateMember(user, message.guild);
        
        const embed = new MessageEmbed()
        .setTitle(message.drakeWS("moderation/sanctions:TITLE", {
            username: user.tag
        }))
        .setAuthor(message.author.username, message.author.displayAvatarURL({dyanmic:true}))
        .setColor(this.client.cfg.color.orange)
        .setFooter(this.client.cfg.footer);

        if(memberData.sanctions.length < 1) return message.drake("moderation/sanctions:NO_SANCTIONS", {
            username: "`" + user.username + "`",
            emoji: "error"
        });
        else memberData.sanctions.forEach((s) => {
            embed.addField(s.type+" | #"+s.case, `${message.drakeWS("common:MODERATOR")}: <@${s.moderator}>\n${message.drakeWS("common:REASON")}: ${s.reason}`, true);
        });
        
        return message.channel.send(embed);
    };
};

module.exports = Sanctions;