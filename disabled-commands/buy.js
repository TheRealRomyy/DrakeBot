const Command = require("../../structure/Commands");
const { MessageEmbed } = require("discord.js");

class Buy extends Command {

    constructor(client) {
        super(client, {
            name: "buy",
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
            usage: data.guild.prefix + "buy <item_id>"
        });

        let itemId = args[0];
        let item = null;

        if(itemId < 1 || itemId > this.client.shop.armor.length + this.client.shop.sword.length) return message.drake("economy/buy:NOT_EXIST", {
            emoji: "error"
        });

        if(itemId > 6) {
            item = this.client.shop.armor.find((ar) => ar.id === parseInt(itemId));
        } else {
            item = this.client.shop.sword.find((sw) => sw.id === parseInt(itemId));
        }

        let lang = this.client.cfg.lang.find((l) => l.name === data.guild.language);

        if(!data.member.inventory) data.member.inventory = [];

        if(data.member.inventory.find((it) => it.id === item.id)) return message.drake("economy/buy:ALREADY_BUY", {
            emoji: "error"
        });
 
        if(item.price > data.member.money) return message.drake("economy/buy:NOT_ENOUGHT", {
            emoji: "error"
        });

        data.member.money -= item.price;
        data.member.inventory.push(item);
        await data.member.save(data.member);

        return message.drake("economy/buy:SUCCES", {
            emoji: "succes",
            item: lang.moment === "fr" ? item.namefr : item.nameen,
            price: item.price,
            symbol: data.guild.symbol
        });
    };
};

module.exports = Buy;