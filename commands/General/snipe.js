const Command = require("../../structure/Commands.js");
const { MessageEmbed } = require("discord.js");

class Snipe extends Command {

    constructor(client) {
        super(client, {
            name: "snipe",
            aliases: ["snipe-delete"],
            enabled: true,
            dirname: __dirname,
            botPerms: [],
            userPerms: [ "MANAGE_MESSAGES" ],
            restriction: [],

            slashCommandOptions: {
                description: "See the last message deleted from the channel"
            }
        });
    };

    async run(message, args, data) {

        var sniped = null;

        if(this.client.snipe[message.channel.id] != "undefined") sniped = this.client.snipe[message.channel.id];
        
        const embed = new MessageEmbed()
        .setFooter(this.client.cfg.footer)
        .setColor("#2f3136");
        
        if(sniped == null || sniped == "undefined"|| !this.client.users.cache.get(sniped.author)) {
            return message.drake("general/snipe:NO_TEXT", { 
                emoji: "error"
            });
        } else {
            let author = this.client.users.cache.get(sniped.author);
            embed.setAuthor(author.tag, author.displayAvatarURL({ dynamic:true }))
            .setDescription(sniped.text.length > 0 ? sniped.text : message.drakeWS("general/snipe:MESSAGE_BUT_NO_TEXT", {
                emoji: "error"
            }))
            .setTimestamp(sniped.date);
        };
        

        return message.channel.send({
            embeds: [embed]
        });
    };

    async runInteraction(interaction, data) {

        var sniped = null;

        if(this.client.snipe[interaction.channel.id] != "undefined") sniped = this.client.snipe[interaction.channel.id];
        
        const embed = new MessageEmbed()
        .setFooter(this.client.cfg.footer)
        .setColor("#2f3136");
        
        if(sniped == null || sniped == "undefined" || !this.client.users.cache.get(sniped.author)) {
            return interaction.reply({
                content: interaction.drakeWS("general/snipe:NO_TEXT", { 
                    emoji: "error"
                }),
                ephemeral: true
            });
        } else {
            let author = this.client.users.cache.get(sniped.author);
            embed.setAuthor(author.tag, author.displayAvatarURL({ dynamic:true }))
            .setDescription(sniped.text.length > 0 ? sniped.text : interaction.drakeWS("general/snipe:MESSAGE_BUT_NO_TEXT", {
                emoji: "error"
            }))
            .setTimestamp(sniped.date);
        };
        

        return interaction.reply({
            embeds: [embed]
        });
    };
};

module.exports = Snipe;