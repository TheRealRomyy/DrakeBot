const Command = require("../../structure/Commands");
const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
const ms = require("ms");

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
            restriction: [],

            slashCommandOptions: {
                description: "🛒 Open the shop menu"
            }
        });
    };

    async run(message, args, data) {

        const client = this.client;
        let lang = client.cfg.lang.find((l) => l.name === data.guild.language);

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

        const buyButton = new MessageButton()
            .setStyle('SUCCESS')
            .setLabel('Buy 💵')
            .setDisabled(false)
            .setCustomId(`${message.guild.id}${message.author.id}${Date.now()}BUY`);

        const infoButton = new MessageButton()
            .setStyle('PRIMARY')
            .setLabel('Info ❓')
            .setDisabled(false)
            .setCustomId(`${message.guild.id}${message.author.id}${Date.now()}INFO`);

        let group1 = new MessageActionRow().addComponents([ buyButton, infoButton ]);

        message.reply({
            embeds: [embed],
            components: [group1],
        }).then(async m => {

            let filter = (button) => button.user.id === message.author.id && (
                button.customId === infoButton.customId ||
                button.customId === buyButton.customId
            );

            const collector = m.channel.createMessageComponentCollector({
                filter,
                time: ms("10m")
            });

            collector.on("collect", async b => {
               
                await b.deferUpdate();

                switch(b.customId) {
                    case buyButton.customId:
                        toggleButton(m, "disabled");
                        filter = (m) => m.author.id === message.author.id;

                        let question = await message.channel.send({
                            content: message.drakeWS("economy/shop:QUESTION_BUY", {
                                emoji: "dollar"
                            })
                        });

                        const collectorBuy = message.channel.createMessageCollector({
                            filter,
                            time: ms("1m"),
                            max: 1
                        });

                        collectorBuy.on("collect", async messageCollected => {
                            let confMessage = messageCollected.content;

                            if(confMessage === "cancel") {
                                question.delete().catch(() => {});
                                return;
                            };

                            messageCollected.delete().catch(() => {});
                            question.delete().catch(() => {});

                            if(isNaN(parseInt(confMessage))) {
                                const invalidId = await message.channel.send({
                                    content: message.drakeWS("economy/shop:INVALID_ID", {
                                        emoji: "error",
                                        minID: 1,
                                        maxID: client.shop.armor.length + client.shop.sword.length
                                    })
                                });
                                
                                setTimeout(() => invalidId.delete().catch(() => {}), 3000);
                                return;
                            };

                            const itemId = parseInt(confMessage);

                            if(itemId < 1 || itemId > client.shop.armor.length + client.shop.sword.length) {
                                const notExist = await message.channel.send({
                                    content: message.drakeWS("economy/buy:NOT_EXIST", {
                                        emoji: "error"
                                    })
                                });  
                                setTimeout(() => notExist.delete().catch(() => {}), 3000);
                                return;
                            };

                            let item = null;
                    
                            if(itemId > 6) item = client.shop.armor.find((ar) => ar.id === parseInt(itemId));
                            else item = client.shop.sword.find((sw) => sw.id === parseInt(itemId));
                            
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
                    
                            const successBuy = await message.channel.send({
                                content: message.drakeWS("economy/buy:SUCCES", {
                                    emoji: "succes",
                                    item: lang1.moment === "fr" ? item.namefr : item.nameen,
                                    price: item.price,
                                    symbol: data.guild.symbol
                                })
                            });

                            setTimeout(() => successBuy.delete().catch(() => {}), 3000);

                            toggleButton(m, "enabled");
                            await updateEmbed(m, embed);
                        });

                        collectorBuy.on("end", async (collected, reason) => {
                            if(reason === "time") question.delete().catch(() => {});
                            filter = (button) => button.user.id === message.author.id;
                        });
                        break;
                    case infoButton.customId:
                        toggleButton(m, "disabled");
                        filter = (m) => m.author.id === message.author.id;

                        let question1 = await message.channel.send({
                            content: message.drakeWS("economy/shop:QUESTION_INFO", {
                                emoji: "info"
                            })
                        });

                        const collectorInfo = message.channel.createMessageCollector({
                            filter,
                            time: ms("1m"),
                            max: 1
                        });

                        collectorInfo.on("collect", async messageCollected => {
                            let confMessage1 = messageCollected.content;

                            if(confMessage1 === "cancel") {
                                question1.delete().catch(() => {});
                                return;
                            };
    
                            messageCollected.delete().catch(() => {});
                            question1.delete().catch(() => {});
    
                            if(isNaN(parseInt(confMessage1))) {
                                const invalidIdInfo = await message.channel.send({
                                    content: message.drakeWS("economy/shop:INVALID_ID", {
                                        emoji: "error",
                                        minID: 1,
                                        maxID: client.shop.armor.length + client.shop.sword.length
                                    })
                                });
    
                                setTimeout(() => invalidIdInfo.delete().catch(() => {}), 3000);
                                return;
                            };

                            const itemId1 = parseInt(confMessage1);

                            if(itemId1 < 1 || itemId1 > client.shop.armor.length + client.shop.sword.length) {
                                const notExistInfo = await message.channel.send({
                                    content: message.drakeWS("economy/buy:NOT_EXIST", {
                                        emoji: "error"
                                })});
    
                                setTimeout(() => notExistInfo.delete().catch(() => {}), 3000);
                                return;
                            };
    
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
                                }), `${item1.resistance}`, true)
                            } else if(type == "sword") {
                                embed1.addField(message.drakeWS("economy/info:DAMAGE", {
                                    emoji: "boom"
                                }), `${item1.damage}`, true)
                                .addField(message.drakeWS("economy/info:DEXTERITY", {
                                    emoji: "write"
                                }), `${item1.dexterite}`, true);
                            };
    
                            embed1.addField(message.drakeWS("economy/info:PRICE", {
                                emoji: "moneybag"
                            }), `${item1.price == 0 ? "**" + message.drakeWS("common:FREE") + "**" : item1.price + data.guild.symbol}`, true)
                            .addField(message.drakeWS("economy/info:OWN", {
                                emoji: "owner"
                            }), `${(data.member.inventory.find((i) => i.name === item1.name) ? message.drakeWS("common:YES") : message.drakeWS("common:NO"))}`, true)
    
                            const embed1Message = await message.channel.send({
                                embeds: [embed1]
                            });
    
                            setTimeout(() => embed1Message.delete().catch(() => {}), 4000);
                            toggleButton(m, "enabled");
                        });

                        collectorInfo.on("end", async (collected, reason) => {
                            if(reason === "time") question1.delete().catch(() => {});
                            filter = (button) => button.user.id === message.author.id;
                        });
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

        async function updateEmbed(msg, embed) {

            let shop1 = "";

            shop1 += message.drakeWS("economy/shop:DESC") + "\n \n";
            shop1 += message.drakeWS("economy/shop:SWORDS") + "\n> " + client.shop.sword.map((item) =>  "#**" + item.id + "** " + (lang.moment === "fr" ? item.namefr : item.nameen) + " | **" + item.price + data.guild.symbol + "** " + ((data.member.inventory.map((i) => i.name)).includes(item.name) ? "✅" : "❌")).join("\n> ") + "\n \n";
            shop1 += message.drakeWS("economy/shop:ARMORS") + "\n> " + client.shop.armor.map((item) =>  "#**" + item.id + "** " + (lang.moment === "fr" ? item.namefr : item.nameen) + " | **" + item.price + data.guild.symbol + "** " + ((data.member.inventory.map((i) => i.name)).includes(item.name) ? "✅" : "❌")).join("\n> ") + "\n \n";

            embed.setDescription(`${shop1}`);
            
            await msg.edit({
                components: msg.components,
                embeds: [embed]
            });
        };

        async function toggleButton(msg, mode) {

            if(!msg) return;

            buyButton.setDisabled(mode === "disabled" ? true : false)
            infoButton.setDisabled(mode === "disabled" ? true : false)

            let group2 = new MessageActionRow().addComponents([ buyButton, infoButton ]);

            msg.edit({
                components: [group2],
                embeds: [embed]
            });
        };
    };

    async runInteraction(interaction, data) {

        const client = this.client;
        let lang = client.cfg.lang.find((l) => l.name === data.guild.language);

        if(!data.member.inventory) data.member.inventory = [];

        let shop = "";
        shop += interaction.drakeWS("economy/shop:DESC") + "\n \n";
        shop += interaction.drakeWS("economy/shop:SWORDS") + "\n> " + client.shop.sword.map((item) =>  "#**" + item.id + "** " + (lang.moment === "fr" ? item.namefr : item.nameen) + " | **" + item.price + data.guild.symbol + "** " + ((data.member.inventory.map((i) => i.name)).includes(item.name) ? "✅" : "❌")).join("\n> ") + "\n \n";
        shop += interaction.drakeWS("economy/shop:ARMORS") + "\n> " + client.shop.armor.map((item) =>  "#**" + item.id + "** " + (lang.moment === "fr" ? item.namefr : item.nameen) + " | **" + item.price + data.guild.symbol + "** " + ((data.member.inventory.map((i) => i.name)).includes(item.name) ? "✅" : "❌")).join("\n> ") + "\n \n";

        let embed = new MessageEmbed()
            .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic:true }))
            .setTitle(interaction.drakeWS("economy/shop:TITLE", {
                emoji: "shop"
            }))
            .setThumbnail(interaction.guild.iconURL({ dynamic:true }))
            .setColor("BLUE")
            .setDescription(shop)
            .setFooter(client.cfg.footer);

        const buyButton = new MessageButton()
            .setStyle('SUCCESS')
            .setLabel('Buy 💵')
            .setDisabled(false)
            .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}BUY`);

        const infoButton = new MessageButton()
            .setStyle('PRIMARY')
            .setLabel('Info ❓')
            .setDisabled(false)
            .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}INFO`);

        let group1 = new MessageActionRow().addComponents([ buyButton, infoButton ]);

        interaction.reply({
            embeds: [embed],
            components: [group1],
        }).then(async m => {

            let filter = (button) => button.user.id === interaction.user.id && (
                button.customId === infoButton.customId ||
                button.customId === buyButton.customId
            );

            const collector = interaction.channel.createMessageComponentCollector({
                filter,
                time: ms("10m")
            });

            collector.on("collect", async b => {
               
                await b.deferUpdate();

                switch(b.customId) {
                    case buyButton.customId:
                        toggleButton(m, "disabled");
                        filter = (m ) => m.author.id === interaction.user.id;

                        const question = await interaction.channel.send({
                            content: interaction.drakeWS("economy/shop:QUESTION_BUY", {
                                emoji: "dollar"
                            })
                        });

                        const collectorBuy = interaction.channel.createMessageCollector({
                            filter,
                            time: ms("1m"),
                            max: 1
                        });

                        collectorBuy.on("collect", async messageCollected => {
                            let confMessage = messageCollected.content;

                            if(confMessage === "cancel") {
                                await question.delete().catch(() => {});
                                return;
                            };

                            messageCollected.delete().catch(() => {});
                            await question.delete().catch(() => {});

                            if(isNaN(parseInt(confMessage))) {
                                const invalidID2 = await interaction.channel.send({
                                    content: interaction.drakeWS("economy/shop:INVALID_ID", {
                                        emoji: "error",
                                        minID: 1,
                                        maxID: client.shop.armor.length + client.shop.sword.length
                                    })
                                });

                                setTimeout(() => invalidID2.delete().catch(() => {}), 3000);
                                return;
                            };

                            const itemId = parseInt(confMessage);

                            if(itemId < 1 || itemId > client.shop.armor.length + client.shop.sword.length) {
                                const notExist2 = await interaction.channel.send({
                                    content: interaction.drakeWS("economy/buy:NOT_EXIST", {
                                        emoji: "error"
                                    })
                                });  

                                setTimeout(() => notExist2.delete().catch(() => {}), 3000);
                                return;
                            };

                            let item = null;
                    
                            if(itemId > 6) item = client.shop.armor.find((ar) => ar.id === parseInt(itemId));
                            else item = client.shop.sword.find((sw) => sw.id === parseInt(itemId));
                            
                            let lang1 = client.cfg.lang.find((l) => l.name === data.guild.language);
                    
                            if(!data.member.inventory) data.member.inventory = [];
                    
                            if(data.member.inventory.find((it) => it.id === item.id)) {
                                const alreadyBuy = await interaction.channel.send({
                                    content: interaction.drakeWS("economy/buy:ALREADY_BUY", {
                                        emoji: "error"
                                    })
                                });

                                setTimeout(() => alreadyBuy.delete().catch(() => {}), 3000);
                                return;
                            };
                    
                            if(item.price > data.member.money) {
                                const notEnought = await interaction.channel.send({
                                    content: interaction.drakeWS("economy/buy:NOT_ENOUGHT", {
                                        emoji: "error"
                                    })
                                });
                                
                                setTimeout(() => notEnought.delete().catch(() => {}), 3000);
                                return;
                            };
                            
                    
                            data.member.money -= item.price;
                            data.member.inventory.push(item);
                            await data.member.save(data.member);
                    
                            const successBuy = await interaction.channel.send({
                                content: interaction.drakeWS("economy/buy:SUCCES", {
                                    emoji: "succes",
                                    item: lang1.moment === "fr" ? item.namefr : item.nameen,
                                    price: item.price,
                                    symbol: data.guild.symbol
                                })
                            });

                            setTimeout(() => successBuy.delete().catch(() => {}), 3000);

                            toggleButton(m, "enabled");
                            await updateEmbed(m, embed);
                        });

                        collectorBuy.on("end", async (collected, reason) => {
                            if(reason === "time") {
                                await question.delete().catch(() => {});
                                return;
                            };
                            filter = (button) => button.user.id === interaction.user.id;
                        });
                        break;
                    case infoButton.customId:
                        toggleButton(m, "disabled");
                        filter = (m) => m.author.id === interaction.user.id;

                        const question1 = await interaction.channel.send({
                            content: interaction.drakeWS("economy/shop:QUESTION_INFO", {
                                emoji: "info"
                            })
                        });

                        const collectorInfo = interaction.channel.createMessageCollector({
                            filter,
                            time: ms("1m"),
                            max: 1
                        });

                        collectorInfo.on("collect", async messageCollected => {
                            let confMessage1 = messageCollected.content;

                            if(confMessage1 === "cancel") {
                                await question1.delete().catch(() => {});
                                return;
                            };
    
                            messageCollected.delete().catch(() => {});
                            await question1.delete().catch(() => {});
    
                            if(isNaN(parseInt(confMessage1))) {
                                const invalidID1 = await interaction.channel.send({
                                    content: interaction.drakeWS("economy/shop:INVALID_ID", {
                                        emoji: "error",
                                        minID: 1,
                                        maxID: client.shop.armor.length + client.shop.sword.length
                                    })
                                });

                                setTimeout(() => invalidID1.delete().catch(() => {}), 3000);
                                return;
                            };

                            const itemId1 = parseInt(confMessage1);

                            if(itemId1 < 1 || itemId1 > client.shop.armor.length + client.shop.sword.length) {
                                const notExist1 = await interaction.channel.send({
                                    content: interaction.drakeWS("economy/buy:NOT_EXIST", {
                                        emoji: "error"
                                    })
                                });
    
                                setTimeout(() => notExist1.delete().catch(() => {}), 3000);
                                return;
                            };
    
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
                            .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic:true }))
                            .setTitle(interaction.drakeWS("economy/info:TITLE", {
                                emoji: "info",
                                name: lang2.moment === "fr" ? item1.namefr : item1.nameen
                            }))
                            .setColor("RANDOM")
                            .setFooter(client.cfg.footer);
    
                            if(type == "armor") {
                                embed1.addField(interaction.drakeWS("economy/info:RESISTANCE", {
                                    emoji: "shield"
                                }), `${item1.resistance}`, true)
                            } else if(type == "sword") {
                                embed1.addField(interaction.drakeWS("economy/info:DAMAGE", {
                                    emoji: "boom"
                                }), `${item1.damage}`, true)
                                .addField(interaction.drakeWS("economy/info:DEXTERITY", {
                                    emoji: "write"
                                }), `${item1.dexterite}`, true);
                            };
    
                            embed1.addField(interaction.drakeWS("economy/info:PRICE", {
                                emoji: "moneybag"
                            }), `${item1.price == 0 ? "**" + interaction.drakeWS("common:FREE") + "**" : item1.price + data.guild.symbol}`, true)
                            .addField(interaction.drakeWS("economy/info:OWN", {
                                emoji: "owner"
                            }), `${(data.member.inventory.find((i) => i.name === item1.name) ? interaction.drakeWS("common:YES") : interaction.drakeWS("common:NO"))}`, true)
    
                            const succesInfo = await interaction.channel.send({
                                embeds: [embed1]
                            });

                            setTimeout(() => succesInfo.delete().catch(() => {}), 3000);
                            toggleButton(m, "enabled");
                        });

                        collectorInfo.on("end", async (collected, reason) => {
                            if(reason === "time") {
                                await question1.delete().catch(() => {});
                                return;
                            };
                            filter = (button) => button.user.id === interaction.user.id;
                        });
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

        async function updateEmbed(msg, embed) {

            let shop1 = "";

            shop1 += interaction.drakeWS("economy/shop:DESC") + "\n \n";
            shop1 += interaction.drakeWS("economy/shop:SWORDS") + "\n> " + client.shop.sword.map((item) =>  "#**" + item.id + "** " + (lang.moment === "fr" ? item.namefr : item.nameen) + " | **" + item.price + data.guild.symbol + "** " + ((data.member.inventory.map((i) => i.name)).includes(item.name) ? "✅" : "❌")).join("\n> ") + "\n \n";
            shop1 += interaction.drakeWS("economy/shop:ARMORS") + "\n> " + client.shop.armor.map((item) =>  "#**" + item.id + "** " + (lang.moment === "fr" ? item.namefr : item.nameen) + " | **" + item.price + data.guild.symbol + "** " + ((data.member.inventory.map((i) => i.name)).includes(item.name) ? "✅" : "❌")).join("\n> ") + "\n \n";

            embed.setDescription(`${shop1}`);
            
            await interaction.editReply({
                components: interaction.components,
                embeds: [embed]
            });
        };

        async function toggleButton(m, mode) {
            buyButton.setDisabled(mode === "disabled" ? true : false)
            infoButton.setDisabled(mode === "disabled" ? true : false)

            let group2 = new MessageActionRow().addComponents([ buyButton, infoButton ]);

            interaction.editReply({
                components: [group2],
                embeds: [embed]
            });
        };
    };
};

module.exports = Shop;