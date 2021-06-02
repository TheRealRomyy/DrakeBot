const Command = require("../../structure/Commands");
const { MessageEmbed } = require("discord.js");
const { MessageButton, MessageActionRow } = require("discord-buttons");

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

        const client = this.client;
        const localButtonsID = {};

        let msg = null;
        let shop = "";
        let lang = this.client.cfg.lang.find((l) => l.name === data.guild.language);

        if(!data.member.inventory) data.member.inventory = [];

        const opt = { max: 1, time: 50000, errors: [ "time" ] };
        let filter = (button) => button.clicker.user.id === message.author.id;

        async function waitForButton() {

            let button = null;
    
            await msg.awaitButtons(filter, { max: 1, time: 60000, errors: ['time'] })
            .then(collected => {
                button = collected.first();
                if(!button) return cancel();
                button.defer();
            });

            await changeButtonStatus("non-dispo");
    
            if(button == null) return;
            return button;
        };

        async function wait(first) {

            let embed = new MessageEmbed()
            .setTitle(message.drakeWS("economy/shop:TITLE", {
                emoji: "shop"
            }))
            .setAuthor(message.author.username, message.author.displayAvatarURL({dynamic:true}))
            .setFooter(client.cfg.footer)
            .setColor("BLUE")
            .setDescription(message.drakeWS("misc:PLEASE_WAIT", {
                emoji: "waiting"
            }));
    
            if(first) return message.channel.send(embed);
            else return msg.edit(embed);
        };

        async function after(type) {
            filter = (button) => button.clicker.user.id === message.author.id;

            await start(false, type);
            await changeButtonStatus("dispo");
            const r = await waitForButton();
            await switchCTV(r);
        };

        async function displayMain() {

            shop = "";

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
            .setFooter(client.cfg.footer)
    
            return msg.edit(embed);
        };

        async function buy() {

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
    
            let lang = client.cfg.lang.find((l) => l.name === data.guild.language);
    
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
    
            return message.channel.send(message.drakeWS("economy/buy:SUCCES", {
                emoji: "succes",
                item: lang.moment === "fr" ? item.namefr : item.nameen,
                price: item.price,
                symbol: data.guild.symbol
            })).then(m => m.delete({
                timeout: 5000
            }).catch(() => {}));
        };

        async function info() {

            filter = (m) => m.author.id === message.author.id;

            let question = await message.channel.send(message.drakeWS("economy/shop:QUESTION_INFO", {
                emoji: "info"
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
            let type = null;
    
            if(itemId > 6) {
                type = "armor";
                item = client.shop.armor.find((ar) => ar.id === parseInt(itemId));
            } else {
                type = "sword";
                item = client.shop.sword.find((sw) => sw.id === parseInt(itemId));
            }
    
            let lang = client.cfg.lang.find((l) => l.name === data.guild.language);
            if(!data.member.inventory) data.member.inventory = [];
    
            const embed = new MessageEmbed()
            .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic:true }))
            .setTitle(message.drakeWS("economy/info:TITLE", {
                emoji: "info",
                name: lang.moment === "fr" ? item.namefr : item.nameen
            }))
            .setColor("RANDOM")
            .setFooter(client.cfg.footer);
    
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
    
            return message.channel.send(embed).then(m => m.delete({
                timeout: 5000
            }).catch(() => {}));
        };

        async function changeButtonStatus(status) {

            let makeButtonAvailable = Boolean(status === "dispo");

            let buyButton = new MessageButton()
            .setStyle(makeButtonAvailable ? 'green' : 'gray')
            .setLabel('Buy 💵')
            .setID(localButtonsID["buyButton"]);

            let infoButton = new MessageButton()
            .setStyle(makeButtonAvailable ? 'blurple' : 'gray')
            .setLabel('Info ℹ️')
            .setID(localButtonsID["infoButton"]);

            if(!makeButtonAvailable) {
                buyButton.setDisabled(true);
                infoButton.setDisabled(true);
            };

            let group1 = new MessageActionRow().addComponents([ buyButton, infoButton ]);

            await msg.edit({
                components: [group1]
            }).catch(() => {});
        };

        async function start(first, type) {

            let r = true;
    
            if(type !== "info") msg = await wait(first);

            let buyButton = new MessageButton()
            .setStyle('green')
            .setLabel('Buy 💵')
            .setID(`${message.guild.id}${message.author.id}${Date.now()}BUY`);

            let infoButton = new MessageButton()
            .setStyle('blurple')
            .setLabel('Info ℹ️')
            .setID(`${message.guild.id}${message.author.id}${Date.now()}INFO`);

            localButtonsID["infoButton"] = infoButton.custom_id;
            localButtonsID["buyButton"] = buyButton.custom_id;
    
            if(type !== "info") msg = await displayMain();

            let group1 = new MessageActionRow().addComponents([ buyButton, infoButton ]);

            await msg.edit({
                components: [group1]
            }).catch(() => {});
    
            if(first) r = await waitForButton();
            return r;
        };

        async function switchCTV(ctv) {
            if(!ctv) return;
            switch(ctv.id) {
                
                case localButtonsID["buyButton"]:
                    await buy();
                    await after("buy");
                    break;
                case localButtonsID["infoButton"]:
                    await info();
                    await after("info");
                    break;
                default:
                    return;
            };
        };
    
        async function cancel() {
            msg.delete().catch(() => {});
            message.delete().catch(() => {});
            return;
        };
    
        const ctv = await start(true);
        await switchCTV(ctv);
    };
};

module.exports = Shop;