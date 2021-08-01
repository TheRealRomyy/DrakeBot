const Command = require("../../structure/Commands");
const { MessageEmbed } = require("discord.js");
const ms = require("ms");

class Shop extends Command {

    constructor(client) {
        super(client, {
            name: "shop",
            aliases: [ "store" ],
            dirname: __dirname,
            enabled: false,
            botPerms: [ "SEND_MESSAGES", "EMBED_LINKS" ],
            userPerms: [],
            cooldown: 5,
            restriction: []
        });
    };

    async run(message, args, data) {

        const client = this.client;
        let lang = client.cfg.lang.find((l) => l.name === data.guild.language);
        const localID = {};

        if(!data.member.inventory) data.member.inventory = [];

        let shop = "";
        shop += message.drakeWS("economy/shop:DESC") + "\n \n";
        shop += message.drakeWS("economy/shop:SWORDS") + "\n> " + client.shop.sword.map((item) =>  "#**" + item.id + "** " + (lang.moment === "fr" ? item.namefr : item.nameen) + " | **" + item.price + data.guild.symbol + "** " + ((data.member.inventory.map((i) => i.name)).includes(item.name) ? "✅" : "❌")).join("\n> ") + "\n \n";
        shop += message.drakeWS("economy/shop:ARMORS") + "\n> " + client.shop.armor.map((item) =>  "#**" + item.id + "** " + (lang.moment === "fr" ? item.namefr : item.nameen) + " | **" + item.price + data.guild.symbol + "** " + ((data.member.inventory.map((i) => i.name)).includes(item.name) ? "✅" : "❌")).join("\n> ") + "\n \n";

        let embed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic:true }))
        .setTitle(message.drakeWS("economy/shop:TITLE", {
            emoji: "shop"
        }))
        .setThumbnail(message.guild.iconURL({ dynamic:true }))
        .setColor("BLUE")
        .setDescription(shop)
        .setFooter(client.cfg.footer);

        message.lineReplyNoMention({
            embed: embed
        }).then(async m => {

            const buyButton = new MessageButton()
            .setStyle('green')
            .setLabel('Buy 💵')
            .setID(`${message.guild.id}${message.author.id}${Date.now()}BUY`);

            const infoButton = new MessageButton()
            .setStyle('blurple')
            .setLabel('Info ℹ️')
            .setID(`${message.guild.id}${message.author.id}${Date.now()}INFO`);

            localID.info = infoButton.custom_id;
            localID.buy = buyButton.custom_id;

            let group1 = new MessageActionRow().addComponents([ buyButton, infoButton ]);

            await m.edit({
                components: [group1],
                embed: embed
            });

            let filter = (button) => button.clicker.user.id === message.author.id;
            const opt = { max: 1, time: 50000, errors: [ "time" ] };
            const collector = m.createButtonCollector(filter, {
                time: ms('10m')
            });

            collector.on("collect", async b => {
                if (b.deffered) return;
                await b.reply.defer();

                switch(b.id) {
                    case localID.buy:
                        toggleButton(m, "disabled");
                        filter = (m) => m.author.id === message.author.id;

                        let question = await message.channel.send(message.drakeWS("economy/shop:QUESTION_BUY", {
                            emoji: "dollar"
                        }));

                        let collected = await message.channel.awaitMessages(filter, opt).catch(() => {});
                        if(!collected || !collected.first()) return cancel();
                        
                        let confMessage = collected.first().content;

                        if(confMessage === "cancel") {
                            question.delete().catch(() => {});
                            return await start(false);
                        };

                        collected.first().delete().catch(() => {});
                        question.delete().catch(() => {});

                        if(isNaN(parseInt(confMessage))) {
                            message.channel.send(message.drakeWS("economy/shop:INVALID_ID", {
                                emoji: "error",
                                minID: 1,
                                maxID: client.shop.armor.length + client.shop.sword.length
                            })).then(m => m.delete({
                                timeout: 5000
                            }).catch(() => {}));
                            return await start(false);
                        };

                        const itemId = parseInt(confMessage);

                        if(itemId < 1 || itemId > client.shop.armor.length + client.shop.sword.length) return message.channel.send(message.drakeWS("economy/buy:NOT_EXIST", {
                            emoji: "error"
                        })).then(m => m.delete({
                            timeout: 3000
                        }).catch(() => {}));

                        let item = null;
                
                        if(itemId > 6) {
                            item = client.shop.armor.find((ar) => ar.id === parseInt(itemId));
                        } else {
                            item = client.shop.sword.find((sw) => sw.id === parseInt(itemId));
                        }
                
                        let lang1 = client.cfg.lang.find((l) => l.name === data.guild.language);
                
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
                
                        message.channel.send(message.drakeWS("economy/buy:SUCCES", {
                            emoji: "succes",
                            item: lang1.moment === "fr" ? item.namefr : item.nameen,
                            price: item.price,
                            symbol: data.guild.symbol
                        })).then(m => m.delete({
                            timeout: 5000
                        }).catch(() => {}));

                        filter = (button) => button.clicker.user.id === message.author.id;

                        toggleButton(m, "enabled");
                        await updateEmbed(m, embed);
                        break;
                    case localID.info:
                        toggleButton(m, "disabled");
                        filter = (m) => m.author.id === message.author.id;

                        let question1 = await message.channel.send(message.drakeWS("economy/shop:QUESTION_INFO", {
                            emoji: "info"
                        }));

                        let collected1 = await message.channel.awaitMessages(filter, opt).catch(() => {});
                        if(!collected1 || !collected1.first()) return cancel();
                        
                        let confMessage1 = collected1.first().content;

                        if(confMessage1 === "cancel") {
                            question1.delete().catch(() => {});
                            return await start(false);
                        };

                        collected1.first().delete().catch(() => {});
                        question1.delete().catch(() => {});

                        if(isNaN(parseInt(confMessage1))) {
                            message.channel.send(message.drakeWS("economy/shop:INVALID_ID", {
                                emoji: "error",
                                minID: 1,
                                maxID: client.shop.armor.length + client.shop.sword.length
                            })).then(m => m.delete({
                                timeout: 5000
                            }).catch(() => {}));
                            return await start(false);
                        };

                        const itemId1 = parseInt(confMessage1);

                        if(itemId1 < 1 || itemId1 > client.shop.armor.length + client.shop.sword.length) return message.channel.send(message.drakeWS("economy/buy:NOT_EXIST", {
                            emoji: "error"
                        })).then(m => m.delete({
                            timeout: 3000
                        }).catch(() => {}));

                        let item1 = null;
                        let type = null;

                        if(itemId1 > 6) {
                            type = "armor";
                            item1 = client.shop.armor.find((ar) => ar.id === parseInt(itemId1));
                        } else {
                            type = "sword";
                            item1 = client.shop.sword.find((sw) => sw.id === parseInt(itemId1));
                        }

                        let lang2 = client.cfg.lang.find((l) => l.name === data.guild.language);
                        if(!data.member.inventory) data.member.inventory = [];

                        const embed1 = new MessageEmbed()
                        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic:true }))
                        .setTitle(message.drakeWS("economy/info:TITLE", {
                            emoji: "info",
                            name: lang2.moment === "fr" ? item1.namefr : item1.nameen
                        }))
                        .setColor("RANDOM")
                        .setFooter(client.cfg.footer);

                        if(type == "armor") {
                            embed1.addField(message.drakeWS("economy/info:RESISTANCE", {
                                emoji: "shield"
                            }), item1.resistance, true)
                        } else if(type == "sword") {
                            embed1.addField(message.drakeWS("economy/info:DAMAGE", {
                                emoji: "boom"
                            }), item1.damage, true)
                            .addField(message.drakeWS("economy/info:DEXTERITY", {
                                emoji: "write"
                            }), item1.dexterite, true);
                        };

                        embed1.addField(message.drakeWS("economy/info:PRICE", {
                            emoji: "moneybag"
                        }), item1.price == 0 ? "**" + message.drakeWS("common:FREE") + "**" : item1.price + data.guild.symbol, true)
                        .addField(message.drakeWS("economy/info:OWN", {
                            emoji: "owner"
                        }), (data.member.inventory.find((i) => i.name === item1.name) ? message.drakeWS("common:YES") : message.drakeWS("common:NO")), true)

                        message.channel.send(embed1).then(m => m.delete({
                            timeout: 4000
                        }).catch(() => {}));

                        toggleButton(m, "enabled");
                        break;
                    default:
                        console.error("Default case in shop.js (243)");
                        break;
                };
            });

            collector.on("end", async () => {
                toggleButton(m, "disabled");
            });
        });

        async function updateEmbed(m, embed) {

            let shop1 = "";

            shop1 += message.drakeWS("economy/shop:DESC") + "\n \n";
            shop1 += message.drakeWS("economy/shop:SWORDS") + "\n> " + client.shop.sword.map((item) =>  "#**" + item.id + "** " + (lang.moment === "fr" ? item.namefr : item.nameen) + " | **" + item.price + data.guild.symbol + "** " + ((data.member.inventory.map((i) => i.name)).includes(item.name) ? "✅" : "❌")).join("\n> ") + "\n \n";
            shop1 += message.drakeWS("economy/shop:ARMORS") + "\n> " + client.shop.armor.map((item) =>  "#**" + item.id + "** " + (lang.moment === "fr" ? item.namefr : item.nameen) + " | **" + item.price + data.guild.symbol + "** " + ((data.member.inventory.map((i) => i.name)).includes(item.name) ? "✅" : "❌")).join("\n> ") + "\n \n";

            embed.setDescription(shop1);
            
            await m.edit({
                components: m.components,
                embed: embed
            });
        };

        async function toggleButton(m, mode) {
            const buyButton1 = new MessageButton()
            .setStyle('green')
            .setLabel('Buy 💵')
            .setDisabled(mode === "disabled" ? true : false)
            .setID(`${message.guild.id}${message.author.id}${Date.now()}BUY`);

            const infoButton1 = new MessageButton()
            .setStyle('blurple')
            .setLabel('Info ℹ️')
            .setDisabled(mode === "disabled" ? true : false)
            .setID(`${message.guild.id}${message.author.id}${Date.now()}INFO`);

            localID.info = infoButton1.custom_id;
            localID.buy = buyButton1.custom_id;

            let group2 = new MessageActionRow().addComponents([ buyButton1, infoButton1 ]);

            m.edit(" ", {
                components: [group2],
                embed: embed
            });
        };
    };
};

module.exports = Shop;