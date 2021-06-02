const Command = require("../../structure/Commands.js");
const { MessageEmbed } = require("discord.js");
const { MessageButton, MessageActionRow } = require("discord-buttons");

class BuildEmbed extends Command {

    constructor(client) {
        super(client, {
            name: "build-embed",
            aliases: ["be"],
            enabled: true,
            dirname: __dirname,
            botPerms: [ "MANAGE_CHANNELS", "MANAGE_MESSAGES" ],
            userPerms: [ "MANAGE_MESSAGES" ],
            restriction: []
        });
    };

    async run(message, args, data) {

        const client = this.client;
        const localButtonsID = {};

        let msg = null;

        let filter = (button) => button.clicker.user.id === message.author.id;
        const opt = { max: 1, time: 90000, errors: [ "time" ] };

        let demoEmbed = new MessageEmbed()
        .setDescription("** **");

        const demoEmbedSend = await message.channel.send(demoEmbed);

        async function cancel() {
            msg.delete().catch(() => {});
            message.delete().catch(() => {});
            demoEmbedSend.delete().catch(() => {});
        };

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

        async function displayMain(msg) {

            const embed = new MessageEmbed()
            .setAuthor(message.author.username, message.author.displayAvatarURL({format: 'png', dynamic: true, size: 1024}))
            .setColor("BLUE")
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setDescription(message.drakeWS("general/build-embed:MENU", {
                botName: client.user.username
            }))
            .setFooter(client.cfg.footer)

            return msg.edit(embed);
        };

        async function wait(first) {

            const embed = new MessageEmbed()
            .setAuthor(message.author.username, message.author.displayAvatarURL({format: 'png', dynamic: true, size: 1024}))
            .setColor(client.cfg.color.blue)
            .setTitle("Build Embed")
            .setFooter(client.cfg.footer)
            .setDescription(message.drakeWS("misc:PLEASE_WAIT", {
                emoji: "waiting"
            }));

            if(first) return message.channel.send(embed);
            return msg.edit(embed);
        };

        async function start(first) {

            filter = (button) => button.clicker.user.id === message.author.id;

            if(first) msg = await wait(true);
            if(first === false) msg = await wait(false);

            let button1 = new MessageButton()
            .setStyle('blurple')
            .setLabel('Image 🖼️')
            .setID(`${message.guild.id}${message.author.id}${Date.now()}1-BUILD_EMBED`);

            let button2 = new MessageButton()
            .setStyle('blurple')
            .setLabel('Title 📌')
            .setID(`${message.guild.id}${message.author.id}${Date.now()}2-BUILD_EMBED`);

            let button3 = new MessageButton()
            .setStyle('blurple')
            .setLabel('Description 📄')
            .setID(`${message.guild.id}${message.author.id}${Date.now()}3-BUILD_EMBED`);

            let button4 = new MessageButton()
            .setStyle('blurple')
            .setLabel('Link 🔗')
            .setID(`${message.guild.id}${message.author.id}${Date.now()}4-BUILD_EMBED`);

            let button5 = new MessageButton()
            .setStyle('blurple')
            .setLabel('Footer 📃')
            .setID(`${message.guild.id}${message.author.id}${Date.now()}5-BUILD_EMBED`);

            let button6 = new MessageButton()
            .setStyle('blurple')
            .setLabel('Thumbnail 🖌️')
            .setID(`${message.guild.id}${message.author.id}${Date.now()}6-BUILD_EMBED`);

            let button7 = new MessageButton()
            .setStyle('blurple')
            .setLabel('Color 🎨')
            .setID(`${message.guild.id}${message.author.id}${Date.now()}7-BUILD_EMBED`);

            let button8 = new MessageButton()
            .setStyle('blurple')
            .setLabel('Author 📝')
            .setID(`${message.guild.id}${message.author.id}${Date.now()}8-BUILD_EMBED`);

            let button9 = new MessageButton()
            .setStyle('blurple')
            .setLabel('Timestamp 🕐')
            .setID(`${message.guild.id}${message.author.id}${Date.now()}9-BUILD_EMBED`);

            let button10 = new MessageButton()
            .setStyle('red')
            .setLabel('Cancel ❌')
            .setID(`${message.guild.id}${message.author.id}${Date.now()}10-BUILD_EMBED`);

            let button11 = new MessageButton()
            .setStyle('green')
            .setLabel('Send ✅')
            .setID(`${message.guild.id}${message.author.id}${Date.now()}11-BUILD_EMBED`);

            localButtonsID["imageButton"] = button1.custom_id;
            localButtonsID["titleButton"] = button2.custom_id;
            localButtonsID["descriptionButton"] = button3.custom_id;
            localButtonsID["linkButton"] = button4.custom_id;
            localButtonsID["footerButton"] = button5.custom_id;
            localButtonsID["thumbnailButton"] = button6.custom_id;
            localButtonsID["colorButton"] = button7.custom_id;
            localButtonsID["authorButton"] = button8.custom_id;
            localButtonsID["timestampButton"] = button9.custom_id;
            localButtonsID["cancelButton"] = button10.custom_id;
            localButtonsID["sendButton"] = button11.custom_id;

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
            .setStyle(makeButtonAvailable ? 'blurple' : 'gray')
            .setLabel('Image 🖼️')
            .setID(localButtonsID["imageButton"]);

            let button2 = new MessageButton()
            .setStyle(makeButtonAvailable ? 'blurple' : 'gray')
            .setLabel('Title 📌')
            .setID(localButtonsID["titleButton"]);

            let button3 = new MessageButton()
            .setStyle(makeButtonAvailable ? 'blurple' : 'gray')
            .setLabel('Description 📄')
            .setID(localButtonsID["descriptionButton"]);

            let button4 = new MessageButton()
            .setStyle(makeButtonAvailable ? 'blurple' : 'gray')
            .setLabel('Link 🔗')
            .setID(localButtonsID["linkButton"]);

            let button5 = new MessageButton()
            .setStyle(makeButtonAvailable ? 'blurple' : 'gray')
            .setLabel('Footer 📃')
            .setID(localButtonsID["footerButton"]);

            let button6 = new MessageButton()
            .setStyle(makeButtonAvailable ? 'blurple' : 'gray')
            .setLabel('Thumbnail 🖌️')
            .setID(localButtonsID["thumbnailButton"]);

            let button7 = new MessageButton()
            .setStyle(makeButtonAvailable ? 'blurple' : 'gray')
            .setLabel('Color 🎨')
            .setID(localButtonsID["colorButton"]);

            let button8 = new MessageButton()
            .setStyle(makeButtonAvailable ? 'blurple' : 'gray')
            .setLabel('Author 📝')
            .setID(localButtonsID["authorButton"]);

            let button9 = new MessageButton()
            .setStyle(makeButtonAvailable ? 'blurple' : 'gray')
            .setLabel('Timestamp 🕐')
            .setID(localButtonsID["timestampButton"]);

            let button10 = new MessageButton()
            .setStyle(makeButtonAvailable ? 'red' : 'gray')
            .setLabel('Cancel ❌')
            .setID(localButtonsID["cancelButton"]);

            let button11 = new MessageButton()
            .setStyle(makeButtonAvailable ? 'green' : 'gray')
            .setLabel('Send ✅')
            .setID(localButtonsID["sendButton"]);

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
            filter = (button) => button.clicker.user.id === message.author.id;
            await changeButtonStatus("dispo");
            const r = await waitForButton();
            await switchCTV(r);
        };

        async function switchCTV(ctv) {
            if(!ctv) return;
            switch(ctv.id) {
                
                case localButtonsID["imageButton"]:
                    filter = (m) => m.author.id === message.author.id;
                    let msg1 = await message.channel.send(message.drakeWS("general/build-embed:WICH_IMAGE", {
                        emoji: "question"
                    }));
                    // Get the response
                    let collected = await message.channel.awaitMessages(filter, opt).catch(() => {});
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
                        message.channel.send(message.drakeWS("general/build-embed:INVALID_IMAGE", {
                            emoji: "error"
                        })).then(m => m.delete({
                            timeout: 3000
                        }));
                        await after()
                    };

                    if (confImage.content.size > 0) {
                        demoEmbed.setImage(confImage.content.url)
                        demoEmbedSend.edit(demoEmbed)
                    } else {
                        demoEmbed.setImage(confImage.content)
                        demoEmbedSend.edit(demoEmbed)
                    };

                    await after();
                    break;
                case localButtonsID["sendButton"]:
                    msg.delete().catch(() => {});
                    demoEmbedSend.delete().catch(() => {});
                    message.channel.send(demoEmbed);
                    return message.channel.send(message.drakeWS("general/build-embed:SENT", {
                        emoji: "succes",
                        channel: "<#" + message.channel.id + ">"
                    })).then(m => m.delete({
                        timeout: 3000
                    }));
                case localButtonsID["titleButton"]:
                    filter = (m) => m.author.id === message.author.id;
                    let msg2 = await message.channel.send(message.drakeWS("general/build-embed:WICH_TITLE", {
                        emoji: "question"
                    }));
                    // Get the response
                    let collected1 = await message.channel.awaitMessages(filter, opt).catch(() => {});
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
                        message.channel.send(message.drakeWS("general/build-embed:INVALID_TITLE", {
                            emoji: "error"
                        })).then(m => m.delete({
                            timeout: 3000
                        }));
                        await after()
                    };

                    demoEmbed.setTitle(confTitle);
                    demoEmbedSend.edit(demoEmbed)
                    await after();
                    break;
                case localButtonsID["descriptionButton"]:
                    filter = (m) => m.author.id === message.author.id;
                    let msg3 = await message.channel.send(message.drakeWS("general/build-embed:WICH_DESCRIPTION", {
                        emoji: "question"
                    }));
                    // Get the response
                    let collected2 = await message.channel.awaitMessages(filter, opt).catch(() => {});
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

                    demoEmbed.setDescription(confDescription);
                    demoEmbedSend.edit(demoEmbed)
                    await after();
                    break;
                case localButtonsID["footerButton"]:
                    filter = (m) => m.author.id === message.author.id;
                    let msg4 = await message.channel.send(message.drakeWS("general/build-embed:WICH_FOOTER", {
                        emoji: "question"
                    }));
                    // Get the response
                    let collected3 = await message.channel.awaitMessages(filter, opt).catch(() => {});
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

                    demoEmbed.setFooter(confFooter);
                    demoEmbedSend.edit(demoEmbed)
                    await after();
                    break;
                case localButtonsID["linkButton"]:
                    filter = (m) => m.author.id === message.author.id;
                    let msg5 = await message.channel.send(message.drakeWS("general/build-embed:WICH_LINK", {
                        emoji: "question"
                    }));
                    // Get the response
                    let collected4 = await message.channel.awaitMessages(filter, opt).catch(() => {});
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
                        message.channel.send(message.drakeWS("general/build-embed:INVALID_LINK", {
                            emoji: "error"
                        })).then(m => m.delete({
                            timeout: 3000
                        }));
                        await after()
                    };

                    demoEmbed.setURL(confLink.content);
                    demoEmbedSend.edit(demoEmbed);

                    collected4.first().delete().catch(() => {});
                    await after();
                    break;
                case localButtonsID["cancelButton"]:
                    message.drake("common:CANCEL", {
                        emoji: "succes"
                    });
                    return cancel();
                case localButtonsID["thumbnailButton"]:
                    filter = (m) => m.author.id === message.author.id;
                    let msg6 = await message.channel.send(message.drakeWS("general/build-embed:WICH_THUMBNAIL", {
                        emoji: "question"
                    }));
                    // Get the response
                    let collected5 = await message.channel.awaitMessages(filter, opt).catch(() => {});
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
                        message.channel.send(message.drakeWS("general/build-embed:INVALID_THUMBNAIL", {
                            emoji: "error"
                        })).then(m => m.delete({
                            timeout: 3000
                        }));
                        await after()
                    };

                    if (confThumbnail.content.size > 0) {
                        demoEmbed.setThumbnail(confThumbnail.content.url)
                        demoEmbedSend.edit(demoEmbed)
                    } else {
                        demoEmbed.setThumbnail(confThumbnail.content)
                        demoEmbedSend.edit(demoEmbed)
                    };

                    await after();
                    break;
                case localButtonsID["timestampButton"]:
                    
                    if(demoEmbed.timestamp !== null) {
                        demoEmbed.setTimestamp(null)
                        demoEmbedSend.edit(demoEmbed)
                    } else {
                        demoEmbed.setTimestamp(message.createdTimestamp)
                        demoEmbedSend.edit(demoEmbed)
                    };

                    await after();
                    break;
                case localButtonsID["colorButton"]:
                    filter = (m) => m.author.id === message.author.id;
                    let msg7 = await message.channel.send(message.drakeWS("general/build-embed:WICH_COLOR", {
                        emoji: "question"
                    }));
                    // Get the response
                    let collected6 = await message.channel.awaitMessages(filter, opt).catch(() => {});
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
                        message.channel.send(message.drakeWS("general/build-embed:INVALID_COLOR", {
                            emoji: "error"
                        })).then(m => m.delete({
                            timeout: 3000
                        }));
                        await after()
                    };

                    demoEmbed.setColor(confColor.content);
                    demoEmbedSend.edit(demoEmbed)
                    await after();
                    break;
                case localButtonsID["authorButton"]:
                    filter = (m) => m.author.id === message.author.id;
                    let msg8 = await message.channel.send(message.drakeWS("general/build-embed:WICH_AUTHOR_NAME", {
                        emoji: "question"
                    }));
                    // Get the response
                    let collected7 = await message.channel.awaitMessages(filter, opt).catch(() => {});
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

                    let msg9 = await message.channel.send(message.drakeWS("general/build-embed:WICH_AUTHOR_IMAGE", {
                        emoji: "question"
                    }));
                    // Get the response
                    let collected8 = await message.channel.awaitMessages(filter, opt).catch(() => {});
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
                        message.channel.send(message.drakeWS("general/build-embed:INVALID_AUTHOR_IMAGE", {
                            emoji: "error"
                        })).then(m => m.delete({
                            timeout: 3000
                        }));
                        await after()
                    };

                    demoEmbed.setAuthor(confAuthor.content, confAuthor1.content !== "no" ? confAuthor1.content : null);
                    demoEmbedSend.edit(demoEmbed)

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