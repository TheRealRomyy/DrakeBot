const Command = require("../../structure/Commands.js");
const { MessageEmbed, Constants: { ApplicationCommandOptionTypes } } = require("discord.js");

class RoleInfo extends Command {

    constructor(client) {
        super(client, {
            name: "roleinfo",
            aliases: ["role-info", "role", "ri"],
            enabled: true,
            dirname: __dirname,
            botPerms: ["MANAGE_ROLES"],
            userPerms: [],
            restriction: [],

            slashCommandOptions: {
                description: "Get info about a role",
                options: [
                    {
                        name: "role",
                        type: ApplicationCommandOptionTypes.ROLE,
                        required: true,
                        description: "The channel from where you want information"
                    }
                ]
            }
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

        let membersInRole = role.members.size;
        let perms = []
        let everyonePerms = [];

        role.permissions.toArray().forEach(perm => {
            perms.push(message.drakeWS(`discord_errors:` + perm.toUpperCase()));
        });

        message.guild.roles.everyone.permissions.toArray().forEach(perm => {
            everyonePerms.push(message.drakeWS(`discord_errors:` + perm.toUpperCase()));
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
        .addField(this.client.emotes["man"] + " " + message.drakeWS("general/roleinfo:MEMBERS"), membersInRole + " " + message.drakeWS("general/roleinfo:MEMBER"), true)
        .addField(this.client.emotes["pushpin"] + " Permissions • (" + perms.filter(perm => !everyonePerms.includes(perm)).length + ")", perms.filter(perm => !everyonePerms.includes(perm)).length == 0 ? "`Any perms`" : ("`" + perms.filter(perm => !everyonePerms.includes(perm)).join("`, `") + "`"), false)

        return message.channel.send({
            embeds: [embed]
        });
    };

    async runInteraction(interaction, data) {

        const role = interaction.options.getRole("role");

        if(!role) return interaction.reply({
            content: interaction.drakeWS("general/roleinfo:NOT_FOUND", {
                emoji: "error"
            }),
            ephemeral: true
        });

        let membersInRole = role.members.size;
        let perms = []
        let everyonePerms = [];

        role.permissions.toArray().forEach(perm => {
            perms.push(interaction.drakeWS(`discord_errors:` + perm.toUpperCase()));
        });

        interaction.guild.roles.everyone.permissions.toArray().forEach(perm => {
            everyonePerms.push(interaction.drakeWS(`discord_errors:` + perm.toUpperCase()));
        });

        const embed = new MessageEmbed()
        .setTitle(interaction.drakeWS("general/roleinfo:TITLE", {
            role: role.name,
            emoji: "role"
        }))
        .setFooter(this.client.cfg.footer)
        .setColor(role.hexColor)
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .addField(this.client.emotes["color"] + " " + interaction.drakeWS("general/roleinfo:COLOR"), role.hexColor, true)
        .addField(this.client.emotes["id"] + " ID", role.id, true)
        .addField(this.client.emotes["medal"] + " Position", "#" + role.rawPosition, true)
        .addField(this.client.emotes["hoist"] + " " + interaction.drakeWS("general/roleinfo:HOIST"), role.hoist ? interaction.drakeWS("common:YES") : interaction.drakeWS("common:NO"), true)
        .addField(this.client.emotes["mentionnable"] + " " + interaction.drakeWS("general/roleinfo:MENTIONNABLE"), role.mentionnable ? interaction.drakeWS("common:YES") : interaction.drakeWS("common:NO"), true)
        .addField(this.client.emotes["man"] + " " + interaction.drakeWS("general/roleinfo:MEMBERS"), membersInRole + " " + interaction.drakeWS("general/roleinfo:MEMBER"), true)
        .addField(this.client.emotes["pushpin"] + " Permissions • (" + perms.filter(perm => !everyonePerms.includes(perm)).length + ")", perms.filter(perm => !everyonePerms.includes(perm)).length == 0 ? "`Any perms`" : ("`" + perms.filter(perm => !everyonePerms.includes(perm)).join("`, `") + "`"), false)
        

        return interaction.reply({
            embeds: [embed]
        });
    };
};

module.exports = RoleInfo;