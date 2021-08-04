const Command = require("../../structure/Commands.js");
const { MessageEmbed } = require("discord.js");

class RanksLevel extends Command {

    constructor(client) {
        super(client, {
            name: "ranks-level",
            aliases: ["rankslevel", "ranks-lvl", "roleRewards", "rank-rewards", "xp-reward"],
            dirname: __dirname,
            enabled: true,
            botPerms: ["EMBED_LINKS"],
            userPerms: [],
            cooldown: 3,
            restriction: [],

            slashCommandOptions: {
                description: "See the role rewards on this server"
            }
        });
    };

    async run(message, args, data) {
        const embed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
        .setFooter(this.client.cfg.footer)
        .setColor("RANDOM")
        .setDescription(`${(data.guild.plugins.levels.rankRewards.length !== 0 ? 
            data.guild.plugins.levels.rankRewards.map((r) => message.drakeWS("common:RANK") + ": <@&" + r.rank + "> | " + message.drakeWS("common:LEVEL") + ": **" + r.level + "**").join("\n")  : 
                message.drakeWS("level/ranks-level:NO_RANK", {
                    prefix: data.guild.prefix
        }))}`);
    
        return message.channel.send({
            embeds: [embed]
        });
    };

    async runInteraction(interaction, data) {
        const embed = new MessageEmbed()
        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }))
        .setFooter(this.client.cfg.footer)
        .setColor("RANDOM")
        .setDescription(`${(data.guild.plugins.levels.rankRewards.length !== 0 ? 
            data.guild.plugins.levels.rankRewards.map((r) => interaction.drakeWS("common:RANK") + ": <@&" + r.rank + "> | " + interaction.drakeWS("common:LEVEL") + ": **" + r.level + "**").join("\n")  : 
                interaction.drakeWS("level/ranks-level:NO_RANK", {
                    prefix: data.guild.prefix
        }))}`);
    
        return interaction.reply({
            embeds: [embed]
        });
    };
};

module.exports = RanksLevel;