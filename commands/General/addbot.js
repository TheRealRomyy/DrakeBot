const Command = require("../../structure/Commands");
const { MessageEmbed } = require("discord.js");

class Addbot extends Command {

    constructor(client) {
        super(client, {
            name: "addbot",
            aliases: [ "add", "invite", "support" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "EMBED_LINKS", "SEND_MESSAGES" ],
            userPerms: [],
            cooldown: 3,
            restriction: [],

            slashCommandOptions: {
                description: "Show some usefull link"
            }
        });
    };

    async run(message, args, data) {

        const embed = new MessageEmbed()
        .setTitle(message.drakeWS("general/addbot:TITLE", {
            name: this.client.user.username
        }))
        .setColor("RANDOM")
        .setDescription(`\n ❯ [Support](https://discord.gg/mYDdTbx) \n \n ❯ [Invite](${this.client.cfg.inviteLink})`)
        .setFooter(this.client.cfg.footer)
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))

        return message.channel.send({
            embeds: [embed]
        });
    };

    async runInteraction(interaction, data) {

        const embed = new MessageEmbed()
        .setTitle(interaction.drakeWS("general/addbot:TITLE", {
            name: this.client.user.username
        }))
        .setColor("RANDOM")
        .setDescription(`\n ❯ [Support](https://discord.gg/mYDdTbx) \n \n ❯ [Invite](${this.client.cfg.inviteLink})`)
        .setFooter(this.client.cfg.footer)
        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }))

        return interaction.reply({
            embeds: [embed]
        });
    };
};

module.exports = Addbot;