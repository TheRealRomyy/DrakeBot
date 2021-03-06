const Command = require("../../structure/Commands");

const Discord = require("discord.js");
const permissions = Object.keys(Discord.Permissions.FLAGS);

class Permissions extends Command {

    constructor(client) {
        super(client, {
            name: "permissions",
            aliases: [ "perms", "perm", "permission" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "EMBED_LINKS", "SEND_MESSAGES" ],
            userPerms: [],
            cooldown: 3,
            restriction: [],
        });
    };

    async run(message, args, data) {

        const memberOrRole = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.mentions.roles.first() || message.guild.roles.cache.get(args[0]) || message.member;
        const mPermissions = message.channel.permissionsFor(memberOrRole);
        const total = {
            denied: 0,
            allowed: 0
        };

        let text = "\n\n";
        
        permissions.forEach((perm) => {
            if(!mPermissions.has(perm)){
                text += `${perm} ❌\n`;
                total.denied++;
            } else {
                text += `${perm} ✅\n`;
                total.allowed++;
            }
        });
        text += `\n${total.allowed} ✅ | ${total.denied} ❌`;

        const embed = new Discord.MessageEmbed()
        .setTitle(message.drakeWS("general/permissions:TITLE", {
            username: (memberOrRole.user ? memberOrRole.user.username : memberOrRole.name),
            channel: message.channel.name,
            emoji: "pushpin"
        }))
        .setDescription(text)
        .setColor("RANDOM")
        .setAuthor(message.author.username, message.author.displayAvatarURL( { dynamic: true }))
        .setFooter(this.client.cfg.footer)

        message.channel.send(embed);
    };
};

module.exports = Permissions;