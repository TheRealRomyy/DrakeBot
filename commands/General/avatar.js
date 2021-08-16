const Command = require("../../structure/Commands");
const { Constants: { ApplicationCommandOptionTypes }, MessageEmbed } = require("discord.js");

class Avatar extends Command {

    constructor(client) {
        super(client, {
            name: "avatar",
            aliases: [ "pp" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "SEND_MESSAGES", "EMBED_LINKS" ],
            userPerms: [],
            cooldown: 3,
            restriction: [],

            slashCommandOptions: {
                description: "Display the avatar of a member",
                options: [
                {
                    type: ApplicationCommandOptionTypes.USER,
                    name: "user",
                    description: "User to get avatar (default is you)",
                    required: false,
                }
                ]
            }
        });
    };

    async run(message, args, data) {

        const client = this.client;

        const user = message.mentions.users.first() || (client.users.cache.get(args[0]) ? client.users.cache.get(args[0]) : await client.users.fetch(args[0])) || message.author;

        const embed = new MessageEmbed()
        .setTitle(message.drakeWS("general/avatar:TITLE", {
            user: user.tag
        }))
        .setFooter(client.cfg.footer)
        .setColor(client.cfg.color.purple)
        .setDescription("[" + message.drakeWS("general/avatar:HERE") + "](" + user.avatarURL({ dynamic: true }) + ")")
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
        .setImage(user.displayAvatarURL({ format: 'png', size: 1024, dynamic: true }))

        message.reply({
            embeds: [embed]
        });
    };

    async runInteraction(interaction, data) {

        const client = this.client;

        const user = interaction.options.getUser("user") || interaction.user;

        const embed = new MessageEmbed()
        .setTitle(interaction.drakeWS("general/avatar:TITLE", {
            user: user.tag
        }))
        .setFooter(client.cfg.footer)
        .setColor(client.cfg.color.purple)
        .setDescription("[" + interaction.drakeWS("general/avatar:HERE") + "](" + user.avatarURL({ dynamic: true }) + ")")
        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }))
        .setImage(user.displayAvatarURL({ format: 'png', size: 1024, dynamic: true }))

        interaction.reply({ embeds: [embed] });
    };
};

module.exports = Avatar;