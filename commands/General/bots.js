const Command = require("../../structure/Commands.js");
const { MessageEmbed } = require("discord.js");

class Bots extends Command {

    constructor(client) {
        super(client, {
            name: "bots",
            aliases: [],
            enabled: true,
            dirname: __dirname,
            botPerms: [],
            userPerms: [],
            cooldown: 5,
            restriction: [],

            slashCommandOptions: {
                description: "Show wich bot are in your server"
            }
        });
    };

    async run(message, args, data) {

        let bots = message.guild.members.cache.filter(member => member.user.bot).map(bot => bot.user.username + (bot.user.flags !== null ? (bot.user.flags.has("VERIFIED_BOT") ? " <:verified:816600288744046593>" : "") : "") + " (" + (this.client.cfg.bots[bot.user.id] ? this.client.cfg.bots[bot.user.id] : ":man_shrugging:") + ")").join("\n");

        const embed = new MessageEmbed()
        .setTitle(message.drakeWS("general/bots:TITLE", {
            server: message.guild.name
        }))
        .setFooter(this.client.cfg.footer)
        .setColor(this.client.cfg.color.blue)
        .setDescription(bots + "\n\n" + message.drakeWS("general/bots:LEGENDE"))

        message.channel.send({
            embeds: [embed]
        });
    };

    async runInteraction(interaction, data) {

        let bots = interaction.guild.members.cache.filter(member => member.user.bot).map(bot => bot.user.username + (bot.user.flags !== null ? (bot.user.flags.has("VERIFIED_BOT") ? " <:verified:816600288744046593>" : "") : "") + " (" + (this.client.cfg.bots[bot.user.id] ? this.client.cfg.bots[bot.user.id] : ":man_shrugging:") + ")").join("\n");

        const embed = new MessageEmbed()
        .setTitle(interaction.drakeWS("general/bots:TITLE", {
            server: interaction.guild.name
        }))
        .setFooter(this.client.cfg.footer)
        .setColor(this.client.cfg.color.blue)
        .setDescription(bots + "\n\n" + interaction.drakeWS("general/bots:LEGENDE"))

        interaction.reply({
            embeds: [embed]
        })
    };
};

module.exports = Bots;