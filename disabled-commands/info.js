const Command = require("../../structure/Commands");
const { MessageEmbed } = require("discord.js");

class Info extends Command {

    constructor(client) {
        super(client, {
            name: "info",
            aliases: [ "" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "SEND_MESSAGES", "EMBED_LINKS" ],
            userPerms: [],
            cooldown: 5,
            restriction: []
        });
    };

    async run(message, args, data) {

        if(!args[0] || isNaN(args[0])) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "info <item_id>"
        });

        let itemId = args[0];
        let item = null;
        let type = null;

        if(itemId > 6) {
            type = "armor";
            item = this.client.shop.armor.find((ar) => ar.id === parseInt(itemId));
        } else {
            type = "sword";
            item = this.client.shop.sword.find((sw) => sw.id === parseInt(itemId));
        }

        let lang = this.client.cfg.lang.find((l) => l.name === data.guild.language);
        if(!data.member.inventory) data.member.inventory = [];

        const embed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic:true }))
        .setTitle(message.drakeWS("economy/info:TITLE", {
            emoji: "info",
            name: lang.moment === "fr" ? item.namefr : item.nameen
        }))
        .setColor("RANDOM")
        .setFooter(this.client.cfg.footer);

        if(type == "armor") {
            embed.addField(message.drakeWS("economy/info:RESISTANCE", {
                emoji: "shield"
            }), item.resistance, true)
        } else if(type == "sword") {
            embed.addField(message.drakeWS("economy/info:DAMAGE", {
                emoji: "boom"
            }), item.damage, true)
            .addField(message.drakeWS("economy/info:DEXTERITY", {
                emoji: "write"
            }), item.dexterite, true);
        };

        embed.addField(message.drakeWS("economy/info:PRICE", {
            emoji: "moneybag"
        }), item.price == 0 ? "**" + message.drakeWS("common:FREE") + "**" : item.price + data.guild.symbol, true)
        .addField(message.drakeWS("economy/info:OWN", {
            emoji: "owner"
        }), (data.member.inventory.find((i) => i.name === item.name) ? message.drakeWS("common:YES") : message.drakeWS("common:NO")), true)

        return message.channel.send(embed);
    };
};

module.exports = Info;