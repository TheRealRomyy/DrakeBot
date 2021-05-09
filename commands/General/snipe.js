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
            userPerms: [],
            restriction: []
        });
    };

    async run(message, args, data) {

        var sniped = null;

        if(this.client.snipe[message.channel.id] != "undefined") sniped = this.client.snipe[message.channel.id];
        
        const embed = new MessageEmbed()
        .setFooter(this.client.cfg.footer)
        .setColor("#2f3136");
        
        if(sniped == null || sniped == "undefined") {
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
        

        return message.channel.send(embed);
    };
};

module.exports = Snipe;