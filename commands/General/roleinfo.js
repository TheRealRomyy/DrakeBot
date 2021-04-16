const Command = require("../../structure/Commands.js");
const { MessageEmbed } = require("discord.js");

class RoleInfo extends Command {

    constructor(client) {
        super(client, {
            name: "roleinfo",
            aliases: ["role-info", "role", "ri"],
            enabled: true,
            dirname: __dirname,
            botPerms: ["MANAGE_ROLES"],
            userPerms: [],
            restriction: []
        });
    };

    async run(message, args, data) {

        if(!args[0]) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "roleinfo <role>"
        });

        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);

        if(!role) return message.drake("general/roleinfo:NOT_FOUND", {
            emoji: "error"
        });

        const embed = new MessageEmbed()
        .setTitle(message.drakeWS("general/roleinfo:TITLE", {
            role: role.name,
            emoji: "role"
        }))
        .setFooter(this.client.cfg.footer)
        .setColor(role.hexColor)
        .setThumbnail(message.guild.iconURL({ dynamic: true }))
        .addField(this.client.emotes["color"] + " " + message.drakeWS("general/roleinfo:COLOR"), role.hexColor, true)
        .addField(this.client.emotes["id"] + " ID", role.id, true)
        .addField(this.client.emotes["medal"] + " Position", "#" + role.rawPosition, true)
        .addField(this.client.emotes["hoist"] + " " + message.drakeWS("general/roleinfo:HOIST"), role.hoist ? message.drakeWS("common:YES") : message.drakeWS("common:NO"), true)
        .addField(this.client.emotes["mentionnable"] + " " + message.drakeWS("general/roleinfo:MENTIONNABLE"), role.mentionnable ? message.drakeWS("common:YES") : message.drakeWS("common:NO"), true)
        .addField(this.client.emotes["pushpin"] + " Permissions", "`" + role.permissions.toArray().join("`, `") + "`", false)
        

        return message.channel.send(embed);
    };
};

module.exports = RoleInfo;