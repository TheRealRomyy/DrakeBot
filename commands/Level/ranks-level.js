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
            restriction: []
        });
    };

    async run(message, args, data) {
        const embed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
        .setFooter(this.client.cfg.footer)
        .setColor("RANDOM")
        .setDescription((data.guild.plugins.levels.rankRewards.length !== 0 ? 
            data.guild.plugins.levels.rankRewards.map((r) => message.drakeWS("common:RANK") + ": <@&" + r.rank + "> | " + message.drakeWS("common:LEVEL") + ": **" + r.level + "**")  : 
                message.drakeWS("level/ranks-level:NO_RANK", {
                    prefix: data.guild.prefix
        })));
    
        return message.channel.send(embed);
    };
};

module.exports = RanksLevel;