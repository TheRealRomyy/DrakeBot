const Command = require("../../structure/Commands");
const { MessageEmbed } = require("discord.js");

class Servernames extends Command {

    constructor(client) {
        super(client, {
            name: "server-names",
            aliases: [ "servernames", "sn", "guild-names", "gn", "guildnames" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "EMBED_LINKS", "SEND_MESSAGES" ],
            userPerms: [],
            cooldown: 5,
            restriction: [],

            slashCommandOptions: {
                description: "Get all old server's names"
            }
        });
    };

    async run(message, args, data) {

        let guildData = data.guild;

        if(!guildData.names) guildData.names = [];
        let guildnames = guildData.names;
        let count = 0;

        if(guildnames.length === 0) return message.drake("general/server-names:NO_NAMES", {
            emoji: "error",
            name: message.guild.name
        });

        function cop() {
            count++;
            return count.toString();
        };

        let map = guildnames.map((name) =>"**" + cop() + ")** " + name.name + " **>** " + this.client.functions.printDate(name.date)).join("\n ");

        const embed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
        .setTitle(message.drakeWS("general/server-names:TITLE", {
            emoji: "label",
            name: message.guild.name
        }))
        .setColor(this.client.cfg.color.purple)
        .setDescription(message.drakeWS("general/server-names:TOTAL_NAMES", { count }) + " \n \n" + map);
	
        return message.channel.send({
            embeds: [embed]
        });
    };

    async runInteraction(interaction, data) {

        let guildData = data.guild;

        if(!guildData.names) guildData.names = [];
        let guildnames = guildData.names;
        let count = 0;

        if(guildnames.length === 0) return interaction.reply({
            content: interaction.drakeWS("general/server-names:NO_NAMES", {
                emoji: "error",
                name: interaction.guild.name
            }),
            ephemeral: true
        });

        function cop() {
            count++;
            return count.toString();
        };

        let map = guildnames.map((name) =>"**" + cop() + ")** " + name.name + " **>** " + this.client.functions.printDate(name.date)).join("\n ");

        const embed = new MessageEmbed()
        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }))
        .setTitle(interaction.drakeWS("general/server-names:TITLE", {
            emoji: "label",
            name: interaction.guild.name
        }))
        .setColor(this.client.cfg.color.purple)
        .setDescription(interaction.drakeWS("general/server-names:TOTAL_NAMES", { count }) + " \n \n" + map);
	
        return interaction.reply({
            embeds: [embed]
        });
    };
}; 

module.exports = Servernames;