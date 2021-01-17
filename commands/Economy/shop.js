const Command = require("../../structure/Commands");
const { MessageEmbed } = require("discord.js");

class Shop extends Command {

    constructor(client) {
        super(client, {
            name: "shop",
            aliases: [ "store" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "SEND_MESSAGES", "EMBED_LINKS" ],
            userPerms: [],
            cooldown: 5,
            restriction: []
        });
    };

    async run(message, args, data) {

        let shop = "";
        let lang = this.client.cfg.lang.find((l) => l.name === data.guild.language);

        if(!data.member.inventory) data.member.inventory = [];

        shop += message.drakeWS("economy/shop:SWORDS") + "\n> " + this.client.shop.sword.map((item) =>  "#**" + item.id + "** " + (lang.moment === "fr" ? item.namefr : item.nameen) + " | **" + item.price + data.guild.symbol + "** " + ((data.member.inventory.map((i) => i.name)).includes(item.name) ? "✅" : "❌")).join("\n> ") + "\n \n";

        shop += message.drakeWS("economy/shop:ARMORS") + "\n> " + this.client.shop.armor.map((item) =>  "#**" + item.id + "** " + (lang.moment === "fr" ? item.namefr : item.nameen) + " | **" + item.price + data.guild.symbol + "** " + ((data.member.inventory.map((i) => i.name)).includes(item.name) ? "✅" : "❌")).join("\n> ") + "\n \n" + this.client.emotes.info + " " + message.drakeWS("common:TIPS") + " " + message.drakeWS("economy/shop:tips", {
            prefix: data.guild.prefix
        });

        const embed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic:true }))
        .setTitle(message.drakeWS("economy/shop:TITLE", {
            emoji: "shop"
        }))
        .setColor("RANDOM")
        .setDescription(shop)
        .setFooter(this.client.cfg.footer)

        return message.channel.send(embed);
    };
};

module.exports = Shop;