const Command = require("../../structure/Commands");
const { MessageEmbed } = require("discord.js");

class Scan extends Command {

    constructor(client) {
        super(client, {
            name: "scan",
            aliases: [ "" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "EMBED_LINKS", "SEND_MESSAGES" ],
            userPerms: [],
            cooldown: 3,
            restriction: [],
        });
    };

    async run(message, args, data) {

        let role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
        
        if(role) {

            let membersInRole = role.members.size;
            let mapMembers = role.members.map(role => role).join('\n ❯');

            const embed = new MessageEmbed()
            .setTitle(message.drakeWS("general/scan:SCAN_OF", {
                guild: message.guild.name
            }))
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setDescription(message.drakeWS("general/scan:DESC_ROLE", {
                role: "<@&" + role.id + ">",
                membersInRole,
                mapMembers
            }))
            .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
            .setFooter(this.client.cfg.footer)
            .setColor(this.client.cfg.color.blue)

            if(embed.description.length > 2047) return message.drake("general/scan:TOO_CHARS", {
                emoji: "error",
                size: membersInRole
            });

            return message.channel.send(embed);

        } else {
            const embed = new MessageEmbed()
            .setTitle(message.drakeWS("general/scan:SCAN_OF", {
                guild: message.guild.name
            }))
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setDescription(`\n \n ${this.client.emotes.status["online"]} **${(message.guild.members.cache.filter(member => member.presence.status === "online").size) -1} ${message.drakeWS("general/scan:ONLINE")} 
\n${this.client.emotes.status["offline"]} **${message.guild.members.cache.filter(member => member.presence.status === "offline").size} ${message.drakeWS("general/scan:OFFLINE")}
\n${this.client.emotes.status["dnd"]} **${message.guild.members.cache.filter(member => member.presence.status === "dnd").size} ${message.drakeWS("general/scan:DND")}
\n${this.client.emotes.status["idle"]} **${message.guild.members.cache.filter(member => member.presence.status === "idle").size} ${message.drakeWS("general/scan:IDLE")}`)
            .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
            .setFooter(this.client.cfg.footer)
            .setColor(this.client.cfg.color.blue)

            return message.channel.send(embed);    
        };
    };
};

module.exports = Scan;