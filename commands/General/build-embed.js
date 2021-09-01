const Command = require("../../structure/Commands.js");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

class BuildEmbed extends Command {

    constructor(client) {
        super(client, {
            name: "build-embed",
            aliases: ["be"],
            enabled: true,
            dirname: __dirname,
            botPerms: [ "MANAGE_CHANNELS", "MANAGE_MESSAGES" ],
            userPerms: [ "MANAGE_MESSAGES" ],
            restriction: [],

            slashCommandOptions: {
                description: "Create an embed on your server"
            }
        });
    };

    async run(message, args, data) {

        const client = this.client;
        const localButtonsID = {};

        let msg = null;

        const filter = (button) => button.user.id === message.author.id;
        const opt = { 
            filter: (m) => m.author.id === message.author.id,
            max: 1, 
            time: 90000 
        };

        let demoEmbed = new MessageEmbed()
        .setDescription("** **");

        const demoEmbedSend = await message.channel.send({
            embeds: [demoEmbed]
        });

        async function cancel() {
            msg.delete().catch(() => {});
            message.delete().catch(() => {});
            demoEmbedSend.delete().catch(() => {});
        };

        async function waitForButton() {

            let button = null;
    
            await msg.awaitMessageComponent({filter, max: 1, time: 60000 })
            .then(async collected => {
                button = collected;
                if(!button) return cancel();
                await button.deferUpdate();
            })
            .catch(() => {
                return;
            });

            await changeButtonStatus("non-dispo");
    
            if(button == null) return;
            return button;
        };

        async function displayMain(msg) {

            const embed = new MessageEmbed()
            .setAuthor(message.author.username, message.author.displayAvatarURL({format: 'png', dynamic: true, size: 1024}))
            .setColor("BLUE")
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setDescription(message.drakeWS("general/build-embed:MENU", {
                botName: client.user.username
            }))
            .setFooter(client.cfg.footer)

            if(!msg) return msg = await message.channel.send({
                embeds: [embed]
            });
            else return msg = await msg.edit({
                embeds: [embed]
            });
        };

        async function start(first) {

            let button1 = new MessageButton()
            .setStyle('PRIMARY')
            .setLabel('Image 🖼️')
            .setDisabled(false)
            .setCustomId(`${message.guild.id}${message.author.id}${Date.now()}1-BUILD_EMBED`);

            let button2 = new MessageButton()
            .setStyle('PRIMARY')
            .setLabel('Title 📌')
            .setDisabled(false)
            .setCustomId(`${message.guild.id}${message.author.id}${Date.now()}2-BUILD_EMBED`);

            let button3 = new MessageButton()
            .setStyle('PRIMARY')
            .setLabel('Description 📄')
            .setDisabled(false)
            .setCustomId(`${message.guild.id}${message.author.id}${Date.now()}3-BUILD_EMBED`);

            let button4 = new MessageButton()
            .setStyle('PRIMARY')
            .setLabel('Link 🔗')
            .setDisabled(false)
            .setCustomId(`${message.guild.id}${message.author.id}${Date.now()}4-BUILD_EMBED`);

            let button5 = new MessageButton()
            .setStyle('PRIMARY')
            .setLabel('Footer 📃')
            .setDisabled(false)
            .setCustomId(`${message.guild.id}${message.author.id}${Date.now()}5-BUILD_EMBED`);

            let button6 = new MessageButton()
            .setStyle('PRIMARY')
            .setLabel('Thumbnail 🖌️')
            .setDisabled(false)
            .setCustomId(`${message.guild.id}${message.author.id}${Date.now()}6-BUILD_EMBED`);

            let button7 = new MessageButton()
            .setStyle('PRIMARY')
            .setLabel('Color 🎨')
            .setDisabled(false)
            .setCustomId(`${message.guild.id}${message.author.id}${Date.now()}7-BUILD_EMBED`);

            let button8 = new MessageButton()
            .setStyle('PRIMARY')
            .setLabel('Author 📝')
            .setDisabled(false)
            .setCustomId(`${message.guild.id}${message.author.id}${Date.now()}8-BUILD_EMBED`);

            let button9 = new MessageButton()
            .setStyle('PRIMARY')
            .setLabel('Timestamp 🕐')
            .setDisabled(false)
            .setCustomId(`${message.guild.id}${message.author.id}${Date.now()}9-BUILD_EMBED`);

            let button10 = new MessageButton()
            .setStyle('DANGER')
            .setLabel('Cancel ❌')
            .setDisabled(false)
            .setCustomId(`${message.guild.id}${message.author.id}${Date.now()}10-BUILD_EMBED`);

            let button11 = new MessageButton()
            .setStyle('SUCCESS')
            .setLabel('Send ✅')
            .setDisabled(false)
            .setCustomId(`${message.guild.id}${message.author.id}${Date.now()}11-BUILD_EMBED`);

            localButtonsID["imageButton"] = button1.customId;
            localButtonsID["titleButton"] = button2.customId;
            localButtonsID["descriptionButton"] = button3.customId;
            localButtonsID["linkButton"] = button4.customId;
            localButtonsID["footerButton"] = button5.customId;
            localButtonsID["thumbnailButton"] = button6.customId;
            localButtonsID["colorButton"] = button7.customId;
            localButtonsID["authorButton"] = button8.customId;
            localButtonsID["timestampButton"] = button9.customId;
            localButtonsID["cancelButton"] = button10.customId;
            localButtonsID["sendButton"] = button11.customId;

            msg = await displayMain(msg);

            let group1 = new MessageActionRow().addComponents([ button1, button2, button3, button4, button5 ]);
            let group2 = new MessageActionRow().addComponents([ button6, button7, button8, button9 ]);
            let group3 = new MessageActionRow().addComponents([ button10, button11 ]);

            await msg.edit({
                components: [group1, group2, group3]
            }).catch(() => {});

            const ThingToDo = await waitForButton();
            if(first) return ThingToDo;
            await switchCTV(ThingToDo);
        };

        async function changeButtonStatus(status) {

            let makeButtonAvailable = Boolean(status === "dispo");

            let button1 = new MessageButton()
            .setStyle(makeButtonAvailable ? 'PRIMARY' : 'SECONDARY')
            .setLabel('Image 🖼️')
            .setDisabled(false)
            .setCustomId(localButtonsID["imageButton"]);

            let button2 = new MessageButton()
            .setStyle(makeButtonAvailable ? 'PRIMARY' : 'SECONDARY')
            .setLabel('Title 📌')
            .setDisabled(false)
            .setCustomId(localButtonsID["titleButton"]);

            let button3 = new MessageButton()
            .setStyle(makeButtonAvailable ? 'PRIMARY' : 'SECONDARY')
            .setLabel('Description 📄')
            .setDisabled(false)
            .setCustomId(localButtonsID["descriptionButton"]);

            let button4 = new MessageButton()
            .setStyle(makeButtonAvailable ? 'PRIMARY' : 'SECONDARY')
            .setLabel('Link 🔗')
            .setDisabled(false)
            .setCustomId(localButtonsID["linkButton"]);

            let button5 = new MessageButton()
            .setStyle(makeButtonAvailable ? 'PRIMARY' : 'SECONDARY')
            .setLabel('Footer 📃')
            .setDisabled(false)
            .setCustomId(localButtonsID["footerButton"]);

            let button6 = new MessageButton()
            .setStyle(makeButtonAvailable ? 'PRIMARY' : 'SECONDARY')
            .setLabel('Thumbnail 🖌️')
            .setDisabled(false)
            .setCustomId(localButtonsID["thumbnailButton"]);

            let button7 = new MessageButton()
            .setStyle(makeButtonAvailable ? 'PRIMARY' : 'SECONDARY')
            .setLabel('Color 🎨')
            .setDisabled(false)
            .setCustomId(localButtonsID["colorButton"]);

            let button8 = new MessageButton()
            .setStyle(makeButtonAvailable ? 'PRIMARY' : 'SECONDARY')
            .setLabel('Author 📝')
            .setDisabled(false)
            .setCustomId(localButtonsID["authorButton"]);

            let button9 = new MessageButton()
            .setStyle(makeButtonAvailable ? 'PRIMARY' : 'SECONDARY')
            .setLabel('Timestamp 🕐')
            .setDisabled(false)
            .setCustomId(localButtonsID["timestampButton"]);

            let button10 = new MessageButton()
            .setStyle(makeButtonAvailable ? 'DANGER' : 'SECONDARY')
            .setLabel('Cancel ❌')
            .setDisabled(false)
            .setCustomId(localButtonsID["cancelButton"]);

            let button11 = new MessageButton()
            .setStyle(makeButtonAvailable ? 'SUCCESS' : 'SECONDARY')
            .setLabel('Send ✅')
            .setDisabled(false)
            .setCustomId(localButtonsID["sendButton"]);

            if(!makeButtonAvailable) {
                button1.setDisabled(true);
                button2.setDisabled(true);
                button3.setDisabled(true);
                button4.setDisabled(true);
                button5.setDisabled(true);
                button6.setDisabled(true);
                button7.setDisabled(true);
                button8.setDisabled(true);
                button9.setDisabled(true);
                button10.setDisabled(true);
                button11.setDisabled(true);
            };

            let group1 = new MessageActionRow().addComponents([ button1, button2, button3, button4, button5 ]);
            let group2 = new MessageActionRow().addComponents([ button6, button7, button8, button9 ]);
            let group3 = new MessageActionRow().addComponents([ button10, button11 ]);

            await msg.edit({
                components: [group1, group2, group3]
            }).catch(() => {});
        };

        async function after() {
            await changeButtonStatus("dispo");
            const r = await waitForButton();
            await switchCTV(r);
        };

        async function switchCTV(ctv) {
            if(!ctv) return;
            switch(ctv.customId) {
                
                case localButtonsID["imageButton"]:
                    let msg1 = await message.channel.send({
                        content: message.drakeWS("general/build-embed:WICH_IMAGE", {
                            emoji: "question"
                        })
                    });
                    // Get the response
                    let collected = await message.channel.awaitMessages(opt);
                    if(!collected || !collected.first()) {
                        message.drake("common:CANCEL", {
                            emoji: "succes"
                        });
                        return await after();
                    };

                    const confImage = collected.first();
                    if(confImage.content === "cancel") {
                        message.drake("common:CANCEL", {
                            emoji: "succes"
                        });
                        return await after();
                    };

                    let urlRegex = new RegExp("https?:\/\/\S*", "g");

                    msg1.delete().catch(() => {});
                    collected.first().delete().catch(() => {});

                    if(!urlRegex.test(confImage.content)) {
                        const imageMessage = await message.channel.send({
                            content: message.drakeWS("general/build-embed:INVALID_IMAGE", {
                                emoji: "error"
                            })
                        });
                        
                        setTimeout(() => imageMessage.delete().catch(() => {}), 3000);
                        await after()
                    };

                    if (confImage.content.size > 0) {
                        demoEmbed.setImage(`${confImage.content.url}`)
                        demoEmbedSend.edit({
                            embeds: [demoEmbed]
                        })
                    } else {
                        demoEmbed.setImage(`${confImage.content}`)
                        demoEmbedSend.edit({
                            embeds: [demoEmbed]
                        })
                    };

                    await after();
                    break;
                case localButtonsID["sendButton"]:
                    msg.delete().catch(() => {});
                    demoEmbedSend.delete().catch(() => {});
                    message.channel.send({
                        embeds: [demoEmbed]
                    });

                    const sentMessage = await message.channel.send({
                        content: message.drakeWS("general/build-embed:SENT", {
                            emoji: "succes",
                            channel: "<#" + message.channel.id + ">"
                        })
                    });

                    setTimeout(() => sentMessage.delete().catch(() => {}), 3000);
                    break;
                case localButtonsID["titleButton"]:
                    let msg2 = await message.channel.send({
                        content: message.drakeWS("general/build-embed:WICH_TITLE", {
                            emoji: "question"
                        })
                    });
                    // Get the response
                    let collected1 = await message.channel.awaitMessages(opt);
                    if(!collected1 || !collected1.first()) {
                        message.drake("common:CANCEL", {
                            emoji: "succes"
                        });
                        return await after();
                    };

                    const confTitle = collected1.first();
                    if(confTitle.content === "cancel") {
                        message.drake("common:CANCEL", {
                            emoji: "succes"
                        });
                        return await after();
                    };

                    msg2.delete().catch(() => {});
                    collected1.first().delete().catch(() => {});

                    if(!confTitle.content) {
                        const invalidTitle = await message.channel.send({
                            content: message.drakeWS("general/build-embed:INVALID_TITLE", {
                                emoji: "error"
                            })
                        })

                        setTimeout(() => invalidTitle.delete().catch(() => {}), 3000);
                        await after()
                    };

                    demoEmbed.setTitle(confTitle.content);
                    demoEmbedSend.edit({
                        embeds: [demoEmbed]
                    })
                    await after();
                    break;
                case localButtonsID["descriptionButton"]:
                    let msg3 = await message.channel.send({
                        content: message.drakeWS("general/build-embed:WICH_DESCRIPTION", {
                            emoji: "question"
                        })
                    });
                    // Get the response
                    let collected2 = await message.channel.awaitMessages(opt);
                    if(!collected2 || !collected2.first() || !collected2.first().content) {
                        message.drake("common:CANCEL", {
                            emoji: "succes"
                        });
                        return await after();
                    };

                    const confDescription = collected2.first();
                    if(confDescription.content === "cancel") {
                        message.drake("common:CANCEL", {
                            emoji: "succes"
                        });
                        return await after();
                    };

                    msg3.delete().catch(() => {});
                    collected2.first().delete().catch(() => {});

                    demoEmbed.setDescription(`${confDescription.content}`);
                    demoEmbedSend.edit({
                        embeds: [demoEmbed]
                    })
                    await after();
                    break;
                case localButtonsID["footerButton"]:
                    let msg4 = await message.channel.send({
                        content: message.drakeWS("general/build-embed:WICH_FOOTER", {
                            emoji: "question"
                        })
                    });
                    // Get the response
                    let collected3 = await message.channel.awaitMessages(opt);
                    if(!collected3 || !collected3.first() || !collected3.first().content) {
                        message.drake("common:CANCEL", {
                            emoji: "succes"
                        });
                        return await after();
                    };

                    const confFooter = collected3.first();
                    if(confFooter.content === "cancel") {
                        message.drake("common:CANCEL", {
                            emoji: "succes"
                        });
                        return await after();
                    };

                    msg4.delete().catch(() => {});
                    collected3.first().delete().catch(() => {});

                    demoEmbed.setFooter(`${confFooter.content}`);
                    demoEmbedSend.edit({
                        embeds: [demoEmbed]
                    })
                    await after();
                    break;
                case localButtonsID["linkButton"]:
                    let msg5 = await message.channel.send({
                        content: message.drakeWS("general/build-embed:WICH_LINK", {
                            emoji: "question"
                        })
                    });
                    // Get the response
                    let collected4 = await message.channel.awaitMessages(opt);
                    if(!collected4 || !collected4.first()) {
                        message.drake("common:CANCEL", {
                            emoji: "succes"
                        });
                        return await after();
                    };

                    const confLink = collected4.first();
                    if(confLink.content === "cancel") {
                        message.drake("common:CANCEL", {
                            emoji: "succes"
                        });
                        return await after();
                    };

                    let urlRegex1 = new RegExp("https?:\/\/\S*", "g");

                    msg5.delete().catch(() => {});

                    if(!urlRegex1.test(confLink.content) && !confLink.content.url) {
                        const invalidLink = await message.channel.send({
                            content: message.drakeWS("general/build-embed:INVALID_LINK", {
                                emoji: "error"
                            })
                        });

                        setTimeout(() => invalidLink.delete().catch(() => {}), 3000);
                        await after()
                    };

                    demoEmbed.setURL(`${confLink.content}`);
                    demoEmbedSend.edit({
                        embeds: [demoEmbed]
                    });

                    collected4.first().delete().catch(() => {});
                    await after();
                    break;
                case localButtonsID["cancelButton"]:
                    message.drake("common:CANCEL", {
                        emoji: "succes"
                    });
                    return cancel();
                case localButtonsID["thumbnailButton"]:
                    let msg6 = await message.channel.send({
                        content: message.drakeWS("general/build-embed:WICH_THUMBNAIL", {
                            emoji: "question"
                        })
                    });
                    // Get the response
                    let collected5 = await message.channel.awaitMessages(opt);
                    if(!collected5 || !collected5.first()) {
                        message.drake("common:CANCEL", {
                            emoji: "succes"
                        });
                        return await after();
                    };

                    const confThumbnail = collected5.first();
                    if(confThumbnail.content === "cancel") {
                        message.drake("common:CANCEL", {
                            emoji: "succes"
                        });
                        return await after();
                    };

                    let urlRegex2 = new RegExp("https?:\/\/\S*", "g");

                    msg6.delete().catch(() => {});
                    collected5.first().delete().catch(() => {});

                    if(!urlRegex2.test(confThumbnail.content) && !confThumbnail.content.url) {
                        const invalidThumb = await message.channel.send({
                            content: message.drakeWS("general/build-embed:INVALID_THUMBNAIL", {
                                emoji: "error"
                            })
                        });

                        setTimeout(() => invalidThumb.delete().catch(() => {}), 3000);
                        await after()
                    };

                    if (confThumbnail.content.size > 0) {
                        demoEmbed.setThumbnail(`${confThumbnail.content.url}`)
                        demoEmbedSend.edit({
                            embeds: [demoEmbed]
                        })
                    } else {
                        demoEmbed.setThumbnail(`${confThumbnail.content}`)
                        demoEmbedSend.edit({
                            embeds: [demoEmbed]
                        })
                    };

                    await after();
                    break;
                case localButtonsID["timestampButton"]:
                    
                    if(demoEmbed.timestamp !== null) {
                        demoEmbed.setTimestamp(null)
                        demoEmbedSend.edit({
                            embeds: [demoEmbed]
                        })
                    } else {
                        demoEmbed.setTimestamp(message.createdTimestamp)
                        demoEmbedSend.edit({
                            embeds: [demoEmbed]
                        })
                    };

                    await after();
                    break;
                case localButtonsID["colorButton"]:
                    let msg7 = await message.channel.send({
                        content: message.drakeWS("general/build-embed:WICH_COLOR", {
                            emoji: "question"
                        })
                    });
                    // Get the response
                    let collected6 = await message.channel.awaitMessages(opt);
                    if(!collected6 || !collected6.first()) {
                        message.drake("common:CANCEL", {
                            emoji: "succes"
                        });
                        return await after();
                    };

                    const confColor = collected6.first();
                    if(confColor.content === "cancel") {
                        message.drake("common:CANCEL", {
                            emoji: "succes"
                        });
                        return await after();
                    };

                    msg7.delete().catch(() => {});
                    collected6.first().delete().catch(() => {});

                    const colorRegex = /^#?[0-9A-F]{6}$/i;

                    if(!confColor.content || !colorRegex.test(confColor)) {
                        const invalidColor = await message.channel.send({
                            content: message.drakeWS("general/build-embed:INVALID_COLOR", {
                                emoji: "error"
                            })
                        });

                        setTimeout(() => invalidColor.delete().catch(() => {}), 3000);
                        await after()
                    };

                    demoEmbed.setColor(`${confColor.content}`);
                    demoEmbedSend.edit({
                        embeds: [demoEmbed]
                    })
                    await after();
                    break;
                case localButtonsID["authorButton"]:
                    let msg8 = await message.channel.send({
                        content: message.drakeWS("general/build-embed:WICH_AUTHOR_NAME", {
                            emoji: "question"
                        })
                    });
                    // Get the response
                    let collected7 = await message.channel.awaitMessages(opt);
                    if(!collected7 || !collected7.first() || !collected7.first().content) {
                        message.drake("common:CANCEL", {
                            emoji: "succes"
                        });
                        return await after();
                    };

                    const confAuthor = collected7.first();
                    if(confAuthor.content === "cancel") {
                        message.drake("common:CANCEL", {
                            emoji: "succes"
                        });
                        return await after();
                    };

                    msg8.delete().catch(() => {});
                    collected7.first().delete().catch(() => {});

                    // SECOND COLLECTOR

                    let msg9 = await message.channel.send({
                        content: message.drakeWS("general/build-embed:WICH_AUTHOR_IMAGE", {
                            emoji: "question"
                        })
                    });
                    // Get the response
                    let collected8 = await message.channel.awaitMessages(opt);
                    if(!collected8 || !collected8.first()) {
                        message.drake("common:CANCEL", {
                            emoji: "succes"
                        });
                        return await after();
                    };

                    const confAuthor1 = collected8.first();
                    if(confAuthor1.content === "cancel") {
                        message.drake("common:CANCEL", {
                            emoji: "succes"
                        });
                        return await after();
                    };

                    msg9.delete().catch(() => {});
                    collected8.first().delete().catch(() => {});

                    let urlRegex3 = new RegExp("https?:\/\/\S*", "g");

                    if(!confAuthor1.content || (!urlRegex3.test(confAuthor1.content) && confAuthor1.content !== "no")) {
                        const invalidAuthorName = await message.channel.send({
                            content: message.drakeWS("general/build-embed:INVALID_AUTHOR_IMAGE", {
                                emoji: "error"
                            })
                        });

                        setTimeout(() => invalidAuthorName.delete().catch(() => {}), 3000);
                        await after()
                    };

                    demoEmbed.setAuthor(`${confAuthor.content}`, confAuthor1.content !== "no" ? confAuthor1.content : null);
                    demoEmbedSend.edit({
                        embeds: [demoEmbed]
                    });

                    await after();
                    break;
                default:
                    return;
            };
        };

        const ctv = await start(true);
        await switchCTV(ctv);
    };

    async runInteraction(interaction, data) {

        const client = this.client;
        const localButtonsID = {};

        let msg = null;

        let filter = (button) => button.user.id === interaction.user.id;
        const opt = { 
            filter: (m) => m.author.id === interaction.user.id,
            max: 1, 
            time: 90000 
        };

        let demoEmbed = new MessageEmbed()
        .setDescription("** **");

        const demoEmbedSend = await interaction.channel.send({
            embeds: [demoEmbed]
        });

        async function cancel() {
            msg.delete().catch(() => {});
            demoEmbedSend.delete().catch(() => {});
        };

        async function waitForButton() {

            let button = null;

            filter = (button) => button.user.id === interaction.user.id && (
                button.customId === localButtonsID["imageButton"] ||
                button.customId === localButtonsID["titleButton"] ||
                button.customId === localButtonsID["descriptionButton"] ||
                button.customId === localButtonsID["linkButton"] ||
                button.customId === localButtonsID["footerButton"] ||
                button.customId === localButtonsID["thumbnailButton"] ||
                button.customId === localButtonsID["colorButton"] ||
                button.customId === localButtonsID["authorButton"] ||
                button.customId === localButtonsID["timestampButton"] ||
                button.customId === localButtonsID["cancelButton"] ||
                button.customId === localButtonsID["sendButton"]
            );
    
            await interaction.channel.awaitMessageComponent({filter, max: 1, time: 60000 })
            .then(async collected => {
                button = collected;
                if(!button) return cancel();
                await button.deferUpdate();
            })
            .catch(() => {
                return;
            });

            await changeButtonStatus("non-dispo");
    
            if(button == null) return;
            return button;
        };

        async function displayMain() {

            const embed = new MessageEmbed()
            .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({format: 'png', dynamic: true, size: 1024}))
            .setColor("BLUE")
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setDescription(interaction.drakeWS("general/build-embed:MENU", {
                botName: client.user.username
            }))
            .setFooter(client.cfg.footer)

            return interaction.reply({
                embeds: [embed]
            });
        };

        async function start(first) {

            let button1 = new MessageButton()
            .setStyle('PRIMARY')
            .setLabel('Image 🖼️')
            .setDisabled(false)
            .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}1-BUILD_EMBED`);

            let button2 = new MessageButton()
            .setStyle('PRIMARY')
            .setLabel('Title 📌')
            .setDisabled(false)
            .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}2-BUILD_EMBED`);

            let button3 = new MessageButton()
            .setStyle('PRIMARY')
            .setLabel('Description 📄')
            .setDisabled(false)
            .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}3-BUILD_EMBED`);

            let button4 = new MessageButton()
            .setStyle('PRIMARY')
            .setLabel('Link 🔗')
            .setDisabled(false)
            .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}4-BUILD_EMBED`);

            let button5 = new MessageButton()
            .setStyle('PRIMARY')
            .setLabel('Footer 📃')
            .setDisabled(false)
            .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}5-BUILD_EMBED`);

            let button6 = new MessageButton()
            .setStyle('PRIMARY')
            .setLabel('Thumbnail 🖌️')
            .setDisabled(false)
            .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}6-BUILD_EMBED`);

            let button7 = new MessageButton()
            .setStyle('PRIMARY')
            .setLabel('Color 🎨')
            .setDisabled(false)
            .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}7-BUILD_EMBED`);

            let button8 = new MessageButton()
            .setStyle('PRIMARY')
            .setLabel('Author 📝')
            .setDisabled(false)
            .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}8-BUILD_EMBED`);

            let button9 = new MessageButton()
            .setStyle('PRIMARY')
            .setLabel('Timestamp 🕐')
            .setDisabled(false)
            .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}9-BUILD_EMBED`);

            let button10 = new MessageButton()
            .setStyle('DANGER')
            .setLabel('Cancel ❌')
            .setDisabled(false)
            .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}10-BUILD_EMBED`);

            let button11 = new MessageButton()
            .setStyle('SUCCESS')
            .setLabel('Send ✅')
            .setDisabled(false)
            .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}11-BUILD_EMBED`);

            localButtonsID["imageButton"] = button1.customId;
            localButtonsID["titleButton"] = button2.customId;
            localButtonsID["descriptionButton"] = button3.customId;
            localButtonsID["linkButton"] = button4.customId;
            localButtonsID["footerButton"] = button5.customId;
            localButtonsID["thumbnailButton"] = button6.customId;
            localButtonsID["colorButton"] = button7.customId;
            localButtonsID["authorButton"] = button8.customId;
            localButtonsID["timestampButton"] = button9.customId;
            localButtonsID["cancelButton"] = button10.customId;
            localButtonsID["sendButton"] = button11.customId;

            msg = await displayMain(msg);

            let group1 = new MessageActionRow().addComponents([ button1, button2, button3, button4, button5 ]);
            let group2 = new MessageActionRow().addComponents([ button6, button7, button8, button9 ]);
            let group3 = new MessageActionRow().addComponents([ button10, button11 ]);

            await interaction.editReply({
                components: [group1, group2, group3]
            }).catch(() => {});

            const ThingToDo = await waitForButton();
            if(first) return ThingToDo;
            await switchCTV(ThingToDo);
        };

        async function changeButtonStatus(status) {

            let makeButtonAvailable = Boolean(status === "dispo");

            let button1 = new MessageButton()
            .setStyle(makeButtonAvailable ? 'PRIMARY' : 'SECONDARY')
            .setLabel('Image 🖼️')
            .setDisabled(false)
            .setCustomId(localButtonsID["imageButton"]);

            let button2 = new MessageButton()
            .setStyle(makeButtonAvailable ? 'PRIMARY' : 'SECONDARY')
            .setLabel('Title 📌')
            .setDisabled(false)
            .setCustomId(localButtonsID["titleButton"]);

            let button3 = new MessageButton()
            .setStyle(makeButtonAvailable ? 'PRIMARY' : 'SECONDARY')
            .setLabel('Description 📄')
            .setDisabled(false)
            .setCustomId(localButtonsID["descriptionButton"]);

            let button4 = new MessageButton()
            .setStyle(makeButtonAvailable ? 'PRIMARY' : 'SECONDARY')
            .setLabel('Link 🔗')
            .setDisabled(false)
            .setCustomId(localButtonsID["linkButton"]);

            let button5 = new MessageButton()
            .setStyle(makeButtonAvailable ? 'PRIMARY' : 'SECONDARY')
            .setLabel('Footer 📃')
            .setDisabled(false)
            .setCustomId(localButtonsID["footerButton"]);

            let button6 = new MessageButton()
            .setStyle(makeButtonAvailable ? 'PRIMARY' : 'SECONDARY')
            .setLabel('Thumbnail 🖌️')
            .setDisabled(false)
            .setCustomId(localButtonsID["thumbnailButton"]);

            let button7 = new MessageButton()
            .setStyle(makeButtonAvailable ? 'PRIMARY' : 'SECONDARY')
            .setLabel('Color 🎨')
            .setDisabled(false)
            .setCustomId(localButtonsID["colorButton"]);

            let button8 = new MessageButton()
            .setStyle(makeButtonAvailable ? 'PRIMARY' : 'SECONDARY')
            .setLabel('Author 📝')
            .setDisabled(false)
            .setCustomId(localButtonsID["authorButton"]);

            let button9 = new MessageButton()
            .setStyle(makeButtonAvailable ? 'PRIMARY' : 'SECONDARY')
            .setLabel('Timestamp 🕐')
            .setDisabled(false)
            .setCustomId(localButtonsID["timestampButton"]);

            let button10 = new MessageButton()
            .setStyle(makeButtonAvailable ? 'DANGER' : 'SECONDARY')
            .setLabel('Cancel ❌')
            .setDisabled(false)
            .setCustomId(localButtonsID["cancelButton"]);

            let button11 = new MessageButton()
            .setStyle(makeButtonAvailable ? 'SUCCESS' : 'SECONDARY')
            .setLabel('Send ✅')
            .setDisabled(false)
            .setCustomId(localButtonsID["sendButton"]);

            if(!makeButtonAvailable) {
                button1.setDisabled(true);
                button2.setDisabled(true);
                button3.setDisabled(true);
                button4.setDisabled(true);
                button5.setDisabled(true);
                button6.setDisabled(true);
                button7.setDisabled(true);
                button8.setDisabled(true);
                button9.setDisabled(true);
                button10.setDisabled(true);
                button11.setDisabled(true);
            };

            let group1 = new MessageActionRow().addComponents([ button1, button2, button3, button4, button5 ]);
            let group2 = new MessageActionRow().addComponents([ button6, button7, button8, button9 ]);
            let group3 = new MessageActionRow().addComponents([ button10, button11 ]);

            await interaction.editReply({
                components: [group1, group2, group3]
            }).catch(() => {});
        };

        async function after() {
            await changeButtonStatus("dispo");
            const r = await waitForButton();
            await switchCTV(r);
        };

        async function switchCTV(ctv) {
            if(!ctv) return;
            switch(ctv.customId) {
                
                case localButtonsID["imageButton"]:
                    let msg1 = await interaction.channel.send({
                        content: interaction.drakeWS("general/build-embed:WICH_IMAGE", {
                            emoji: "question"
                        })
                    });
                    // Get the response
                    let collected = await interaction.channel.awaitMessages(opt);
                    if(!collected || !collected.first()) {
                        interaction.drake("common:CANCEL", {
                            emoji: "succes"
                        });
                        return await after();
                    };

                    const confImage = collected.first();
                    if(confImage.content === "cancel") {
                        interaction.drake("common:CANCEL", {
                            emoji: "succes"
                        });
                        return await after();
                    };

                    let urlRegex = new RegExp("https?:\/\/\S*", "g");

                    msg1.delete().catch(() => {});
                    collected.first().delete().catch(() => {});

                    if(!urlRegex.test(confImage.content)) {
                        const imageMessage = await interaction.channel.send({
                            content: interaction.drakeWS("general/build-embed:INVALID_IMAGE", {
                                emoji: "error"
                            })
                        });
                        
                        setTimeout(() => imageMessage.delete().catch(() => {}), 3000);
                        await after()
                    };

                    if (confImage.content.size > 0) {
                        demoEmbed.setImage(`${confImage.content.url}`)
                        demoEmbedSend.edit({
                            embeds: [demoEmbed]
                        })
                    } else {
                        demoEmbed.setImage(`${confImage.content}`)
                        demoEmbedSend.edit({
                            embeds: [demoEmbed]
                        })
                    };

                    await after();
                    break;
                case localButtonsID["sendButton"]:
                    demoEmbedSend.delete().catch(() => {});
                    interaction.editReply({
                        embeds: [demoEmbed],
                        components: [],
                        content: null
                    });

                    const sentMessage = await interaction.channel.send({
                        content: interaction.drakeWS("general/build-embed:SENT", {
                            emoji: "succes",
                            channel: "<#" + interaction.channel.id + ">"
                        })
                    });

                    setTimeout(() => sentMessage.delete().catch(() => {}), 3000);
                    break;
                case localButtonsID["titleButton"]:
                    let msg2 = await interaction.channel.send({
                        content: interaction.drakeWS("general/build-embed:WICH_TITLE", {
                            emoji: "question"
                        })
                    });
                    // Get the response
                    let collected1 = await interaction.channel.awaitMessages(opt);
                    if(!collected1 || !collected1.first()) {
                        interaction.drake("common:CANCEL", {
                            emoji: "succes"
                        });
                        return await after();
                    };

                    const confTitle = collected1.first();
                    if(confTitle.content === "cancel") {
                        interaction.drake("common:CANCEL", {
                            emoji: "succes"
                        });
                        return await after();
                    };

                    msg2.delete().catch(() => {});
                    collected1.first().delete().catch(() => {});

                    if(!confTitle.content) {
                        const invalidTitle = await interaction.channel.send({
                            content: interaction.drakeWS("general/build-embed:INVALID_TITLE", {
                                emoji: "error"
                            })
                        })

                        setTimeout(() => invalidTitle.delete().catch(() => {}), 3000);
                        await after()
                    };

                    demoEmbed.setTitle(confTitle.content);
                    demoEmbedSend.edit({
                        embeds: [demoEmbed]
                    })
                    await after();
                    break;
                case localButtonsID["descriptionButton"]:
                    let msg3 = await interaction.channel.send({
                        content: interaction.drakeWS("general/build-embed:WICH_DESCRIPTION", {
                            emoji: "question"
                        })
                    });
                    // Get the response
                    let collected2 = await interaction.channel.awaitMessages(opt);
                    if(!collected2 || !collected2.first() || !collected2.first().content) {
                        interaction.drake("common:CANCEL", {
                            emoji: "succes"
                        });
                        return await after();
                    };

                    const confDescription = collected2.first();
                    if(confDescription.content === "cancel") {
                        interaction.drake("common:CANCEL", {
                            emoji: "succes"
                        });
                        return await after();
                    };

                    msg3.delete().catch(() => {});
                    collected2.first().delete().catch(() => {});

                    demoEmbed.setDescription(`${confDescription.content}`);
                    demoEmbedSend.edit({
                        embeds: [demoEmbed]
                    })
                    await after();
                    break;
                case localButtonsID["footerButton"]:
                    let msg4 = await interaction.channel.send({
                        content: interaction.drakeWS("general/build-embed:WICH_FOOTER", {
                            emoji: "question"
                        })
                    });
                    // Get the response
                    let collected3 = await interaction.channel.awaitMessages(opt);
                    if(!collected3 || !collected3.first() || !collected3.first().content) {
                        interaction.drake("common:CANCEL", {
                            emoji: "succes"
                        });
                        return await after();
                    };

                    const confFooter = collected3.first();
                    if(confFooter.content === "cancel") {
                        interaction.drake("common:CANCEL", {
                            emoji: "succes"
                        });
                        return await after();
                    };

                    msg4.delete().catch(() => {});
                    collected3.first().delete().catch(() => {});

                    demoEmbed.setFooter(`${confFooter.content}`);
                    demoEmbedSend.edit({
                        embeds: [demoEmbed]
                    })
                    await after();
                    break;
                case localButtonsID["linkButton"]:
                    let msg5 = await interaction.channel.send({
                        content: interaction.drakeWS("general/build-embed:WICH_LINK", {
                            emoji: "question"
                        })
                    });
                    // Get the response
                    let collected4 = await interaction.channel.awaitMessages(opt);
                    if(!collected4 || !collected4.first()) {
                        interaction.drake("common:CANCEL", {
                            emoji: "succes"
                        });
                        return await after();
                    };

                    const confLink = collected4.first();
                    if(confLink.content === "cancel") {
                        interaction.drake("common:CANCEL", {
                            emoji: "succes"
                        });
                        return await after();
                    };

                    let urlRegex1 = new RegExp("https?:\/\/\S*", "g");

                    msg5.delete().catch(() => {});

                    if(!urlRegex1.test(confLink.content) && !confLink.content.url) {
                        const invalidLink = await interaction.channel.send({
                            content: interaction.drakeWS("general/build-embed:INVALID_LINK", {
                                emoji: "error"
                            })
                        });

                        setTimeout(() => invalidLink.delete().catch(() => {}), 3000);
                        await after()
                    };

                    demoEmbed.setURL(`${confLink.content}`);
                    demoEmbedSend.edit({
                        embeds: [demoEmbed]
                    });

                    collected4.first().delete().catch(() => {});
                    await after();
                    break;
                case localButtonsID["cancelButton"]:
                    interaction.editReply({
                        content: interaction.drakeWS("common:CANCEL", {
                            emoji: "succes"
                        }),
                        embeds: [],
                        content: null
                    });
                    return cancel();
                case localButtonsID["thumbnailButton"]:
                    let msg6 = await interaction.channel.send({
                        content: interaction.drakeWS("general/build-embed:WICH_THUMBNAIL", {
                            emoji: "question"
                        })
                    });
                    // Get the response
                    let collected5 = await interaction.channel.awaitMessages(opt);
                    if(!collected5 || !collected5.first()) {
                        interaction.drake("common:CANCEL", {
                            emoji: "succes"
                        });
                        return await after();
                    };

                    const confThumbnail = collected5.first();
                    if(confThumbnail.content === "cancel") {
                        interaction.drake("common:CANCEL", {
                            emoji: "succes"
                        });
                        return await after();
                    };

                    let urlRegex2 = new RegExp("https?:\/\/\S*", "g");

                    msg6.delete().catch(() => {});
                    collected5.first().delete().catch(() => {});

                    if(!urlRegex2.test(confThumbnail.content) && !confThumbnail.content.url) {
                        const invalidThumb = await interaction.channel.send({
                            content: interaction.drakeWS("general/build-embed:INVALID_THUMBNAIL", {
                                emoji: "error"
                            })
                        });

                        setTimeout(() => invalidThumb.delete().catch(() => {}), 3000);
                        await after()
                    };

                    if (confThumbnail.content.size > 0) {
                        demoEmbed.setThumbnail(`${confThumbnail.content.url}`)
                        demoEmbedSend.edit({
                            embeds: [demoEmbed]
                        })
                    } else {
                        demoEmbed.setThumbnail(`${confThumbnail.content}`)
                        demoEmbedSend.edit({
                            embeds: [demoEmbed]
                        })
                    };

                    await after();
                    break;
                case localButtonsID["timestampButton"]:
                    
                    if(demoEmbed.timestamp !== null) {
                        demoEmbed.setTimestamp(null)
                        demoEmbedSend.edit({
                            embeds: [demoEmbed]
                        })
                    } else {
                        demoEmbed.setTimestamp(interaction.createdTimestamp)
                        demoEmbedSend.edit({
                            embeds: [demoEmbed]
                        })
                    };

                    await after();
                    break;
                case localButtonsID["colorButton"]:
                    let msg7 = await interaction.channel.send({
                        content: interaction.drakeWS("general/build-embed:WICH_COLOR", {
                            emoji: "question"
                        })
                    });
                    // Get the response
                    let collected6 = await interaction.channel.awaitMessages(opt);
                    if(!collected6 || !collected6.first()) {
                        interaction.drake("common:CANCEL", {
                            emoji: "succes"
                        });
                        return await after();
                    };

                    const confColor = collected6.first();
                    if(confColor.content === "cancel") {
                        interaction.drake("common:CANCEL", {
                            emoji: "succes"
                        });
                        return await after();
                    };

                    msg7.delete().catch(() => {});
                    collected6.first().delete().catch(() => {});

                    const colorRegex = /^#?[0-9A-F]{6}$/i;

                    if(!confColor.content || !colorRegex.test(confColor)) {
                        const invalidColor = await interaction.channel.send({
                            content: interaction.drakeWS("general/build-embed:INVALID_COLOR", {
                                emoji: "error"
                            })
                        });

                        setTimeout(() => invalidColor.delete().catch(() => {}), 3000);
                        await after()
                    };

                    demoEmbed.setColor(`${confColor.content}`);
                    demoEmbedSend.edit({
                        embeds: [demoEmbed]
                    })
                    await after();
                    break;
                case localButtonsID["authorButton"]:
                    let msg8 = await interaction.channel.send({
                        content: interaction.drakeWS("general/build-embed:WICH_AUTHOR_NAME", {
                            emoji: "question"
                        })
                    });
                    // Get the response
                    let collected7 = await interaction.channel.awaitMessages(opt);
                    if(!collected7 || !collected7.first() || !collected7.first().content) {
                        interaction.drake("common:CANCEL", {
                            emoji: "succes"
                        });
                        return await after();
                    };

                    const confAuthor = collected7.first();
                    if(confAuthor.content === "cancel") {
                        interaction.drake("common:CANCEL", {
                            emoji: "succes"
                        });
                        return await after();
                    };

                    msg8.delete().catch(() => {});
                    collected7.first().delete().catch(() => {});

                    // SECOND COLLECTOR

                    let msg9 = await interaction.channel.send({
                        content: interaction.drakeWS("general/build-embed:WICH_AUTHOR_IMAGE", {
                            emoji: "question"
                        })
                    });
                    // Get the response
                    let collected8 = await interaction.channel.awaitMessages(opt);
                    if(!collected8 || !collected8.first()) {
                        interaction.drake("common:CANCEL", {
                            emoji: "succes"
                        });
                        return await after();
                    };

                    const confAuthor1 = collected8.first();
                    if(confAuthor1.content === "cancel") {
                        interaction.drake("common:CANCEL", {
                            emoji: "succes"
                        });
                        return await after();
                    };

                    msg9.delete().catch(() => {});
                    collected8.first().delete().catch(() => {});

                    let urlRegex3 = new RegExp("https?:\/\/\S*", "g");

                    if(!confAuthor1.content || (!urlRegex3.test(confAuthor1.content) && confAuthor1.content !== "no")) {
                        const invalidAuthorName = await interaction.channel.send({
                            content: interaction.drakeWS("general/build-embed:INVALID_AUTHOR_IMAGE", {
                                emoji: "error"
                            })
                        });

                        setTimeout(() => invalidAuthorName.delete().catch(() => {}), 3000);
                        await after()
                    };

                    demoEmbed.setAuthor(`${confAuthor.content}`, confAuthor1.content !== "no" ? confAuthor1.content : null);
                    demoEmbedSend.edit({
                        embeds: [demoEmbed]
                    });

                    await after();
                    break;
                default:
                    return;
            };
        };

        const ctv = await start(true);
        await switchCTV(ctv);
    };
};

module.exports = BuildEmbed;