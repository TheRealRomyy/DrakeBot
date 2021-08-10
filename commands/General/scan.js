const Command = require("../../structure/Commands");
const { MessageEmbed, Constants: { ApplicationCommandOptionTypes } } = require("discord.js");

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

            slashCommandOptions: {
                description: "See all members of a role",
                options: [
                    {
                        name: "role",
                        type: ApplicationCommandOptionTypes.ROLE,
                        required: true,
                        description: "Wich role ?"
                    }
                ]
            }
        });
    };

    async run(message, args, data) {

        if(!args[0]) return message.drake("errors:NOT_CORRECT",{
            emoji: "error",
            usage: data.guild.prefix + "scan <role>"
        });

        let role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
        if(!role) return message.drake("general/scan:ROLE_NOT_FOUND", {
            emoji: "error",
            role: args[0]
        });

        let membersInRole = role.members.size;
        let mapMembers = role.members.map(member => `<@!${member.id}> (\`${member.user.tag}\`)`).join('\n ❯ ');

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

        return message.channel.send({
            embeds: [embed]
        });
    };

    async runInteraction(interaction, data) {

        let role = interaction.options.getRole("role");
        if(!role) return interaction.reply({
            content: interaction.drakeWS("general/scan:ROLE_NOT_FOUND", {
                emoji: "error",
                role: args[0]
            }),
            ephemeral: true
        });

        let membersInRole = role.members.size;
        let mapMembers = role.members.map(member => `<@!${member.id}> (\`${member.user.tag}\`)`).join('\n ❯ ');

        const embed = new MessageEmbed()
        .setTitle(interaction.drakeWS("general/scan:SCAN_OF", {
            guild: interaction.guild.name
        }))
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setDescription(interaction.drakeWS("general/scan:DESC_ROLE", {
            role: "<@&" + role.id + ">",
            membersInRole,
            mapMembers
        }))
        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }))
        .setFooter(this.client.cfg.footer)
        .setColor(this.client.cfg.color.blue)

        if(embed.description.length > 2047) return interaction.reply({
            content: interaction.drakeWS("general/scan:TOO_CHARS", {
                emoji: "error",
                size: membersInRole
            }),
            ephemeral: true
        });

        return interaction.reply({
            embeds: [embed]
        });
    };
};

module.exports = Scan;