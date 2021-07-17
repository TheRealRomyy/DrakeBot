const Command = require("../../structure/Commands.js");
const { MessageEmbed } = require("discord.js");
const { MessageButton, MessageActionRow } = require("discord-buttons");

class ReactionRoles extends Command {

    constructor(client) {
        super(client, {
            name: "reaction-roles",
            aliases: ["react-roles", "reactions-roles", "rr", "reaction-role"],
            enabled: true,
            dirname: __dirname,
            botPerms: ["MANAGE_MESSAGES"],
            userPerms: ["MANAGE_GUILD"],
            restriction: []
        });
    };

    async run(message, args, data) {

        const client = this.client;
        const localButtonsID = {};

        let msg = null;
        let IDofReact = null;

        let ChannelR = null;
        let messageIDR = null;
        let reactionR = null;
        let roleR = null;


        let filter = (button) => button.clicker.user.id === message.author.id;
        const opt = { max: 1, time: 50000, errors: [ "time" ] };

        async function cancel() {
            msg.delete().catch(() => {});
            message.delete().catch(() => {});
        };

        async function waitForButton() {

            let button = null;

            await msg.awaitButtons(filter, { max: 1, time: 60000, errors: ['time'] })
            .then(collected => {
                button = collected.first();
                if(!button) return cancel();
                button.reply.defer();
            });

            await changeButtonStatus("non-dispo");

            if(button == null) return;
            return button;
        };

        async function displayMain(msg, returnEmbed) {

            const embed = new MessageEmbed()
            .setAuthor(message.author.username, message.author.displayAvatarURL({format: 'png', dynamic: true, size: 1024}))
            .setColor("BLUE")
            .setDescription(message.drakeWS("administration/reaction-roles:INSTRUCTIONS"))
            .setFooter(client.cfg.footer)

            if(returnEmbed) return embed;
            else return msg.edit({
                embed: embed
            });
        };

        async function addReactionRole() {

            filter = (m) => m.author.id === message.author.id;

            const embed = new MessageEmbed()
            .setTitle(message.drakeWS("administration/reaction-roles:ADD_REACTION", {
                step: "1"
            }))
            .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic:true }))
            .setFooter(client.cfg.footer)
            .setColor(client.cfg.color.blue)
            .setDescription(message.drakeWS("administration/reaction-roles:INSTRUCTIONS_ADD_1", {
                emoji: "channel"
            }));

            // Début Channel
            msg.edit({
                embed: embed
            });

            let collected = await message.channel.awaitMessages(filter, opt).catch(() => {});
            if(!collected || !collected.first()) return cancel();

            let confChannel = collected.first();

            let confMessage = collected.first().content;

            if(confMessage == "cancel") {
                await msg.reactions.removeAll()
                await collected.first().delete();
                return await start(false);
            };

            ChannelR = confChannel.mentions.channels.first() || message.guild.channels.cache.get(confChannel.content) || message.guild.channels.cache.find((ch) => ch.name === confChannel.content || `#${ch.name}` === confChannel.content);

            if(!ChannelR) {
                collected.first().delete({
                    timeout: 5000
                }).catch(() => {});

                message.channel.send(message.drakeWS("administration/reaction-roles:CHANNEL_NOT_FOUND", {
                    emoji: "error",
                    channel: confMessage
                })).then(m => m.delete({
                    timeout: 5000
                }).catch(() => {}));

                await msg.reactions.removeAll()
                return await start(false);
            };

            collected.first().delete().catch(() => {});
            // Fin channel



            // Début Message ID
            embed.setTitle(message.drakeWS("administration/reaction-roles:ADD_REACTION", {
                step: "2"
            }))
            .setDescription(message.drakeWS("administration/reaction-roles:INSTRUCTIONS_ADD_2", {
                emoji: "id",
            }));



            msg.edit({
                embed: embed
            });

            collected = await message.channel.awaitMessages(filter, opt).catch(() => {});

            if(!collected || !collected.first()) return cancel();
            
            confMessage = collected.first().content;

            if(confMessage == "cancel") {
                await msg.reactions.removeAll()
                await collected.first().delete();
                return await start(false);
            };

            if(isNaN(confMessage)) {

                collected.first().delete({
                    timeout: 5000
                }).catch(() => {});

                message.channel.send(message.drakeWS("administration/reaction-roles:MESSAGE_NOT_FOUND", {
                    emoji: "error",
                    message: confMessage
                })).then(m => m.delete({
                    timeout: 5000
                }).catch(() => {}));

                await msg.reactions.removeAll()
                return await start(false);
            };

            messageIDR = await client.channels.cache.get(ChannelR.id).messages.fetch(confMessage).catch(() => {});

            if(!messageIDR) {
                collected.first().delete({
                    timeout: 5000
                }).catch(() => {});

                message.channel.send(message.drakeWS("administration/reaction-roles:MESSAGE_NOT_FOUND", {
                    emoji: "error",
                    message: confMessage

                })).then(m => m.delete({
                    timeout: 5000
                }).catch(() => {}));

                await msg.reactions.removeAll()
                return await start(false);
            };

            collected.first().delete().catch(() => {});
            // Fin Message ID



            // Début Emoji
            embed.setTitle(message.drakeWS("administration/reaction-roles:ADD_REACTION", {
                step: "3"
            }))
            .setDescription(message.drakeWS("administration/reaction-roles:INSTRUCTIONS_ADD_3", {
                emoji: "smile",
            }));

            msg.edit({
                embed: embed
            });

            collected = await message.channel.awaitMessages(filter, opt).catch(() => {});
            if(!collected || !collected.first()) return cancel();

            confMessage = collected.first().content;

            if(confMessage == "cancel") {
                await msg.reactions.removeAll()
                await collected.first().delete();
                return await start(false);
            };

            await message.react(confMessage).catch(() => {
                collected.first().delete({
                    timeout: 5000
                }).catch(() => {});
                
                message.channel.send(message.drakeWS("administration/reaction-roles:EMOJI_NOT_FOUND", {
                    emoji: "error",
                    reaction: confMessage
                })).then(m => m.delete({
                    timeout: 5000
                }).catch(() => {}));

                return start(false);
            });

            message.reactions.removeAll();
            reactionR = confMessage;

            collected.first().delete().catch(() => {});
            // Fin Emoji



            // Début role
            embed.setTitle(message.drakeWS("administration/reaction-roles:ADD_REACTION", {
                step: "4"
            }))
            .setDescription(message.drakeWS("administration/reaction-roles:INSTRUCTIONS_ADD_4", {
                emoji: "roleList"
            }));

            msg.edit({
                embed: embed
            }).catch(() => {});

            collected = await message.channel.awaitMessages(filter, opt).catch(() => {});

            if(!collected || !collected.first()) return cancel();

            confMessage = collected.first().content;

            if(confMessage == "cancel") {
                await msg.reactions.removeAll()
                await collected.first().delete();
                return await start(false);
            };

            roleR = message.guild.roles.cache.get(confMessage) || collected.first().mentions.roles.first();

            if(!roleR) {
                collected.first().delete({
                    timeout: 5000
                }).catch(() => {});

                message.channel.send(message.drakeWS("administration/reaction-roles:ROLE_NOT_FOUND", {
                    emoji: "error",
                    role: confMessage
                })).then(m => m.delete({
                    timeout: 5000
                }).catch(() => {}));

                await msg.reactions.removeAll()
                return await start(false);
            };

            if(roleR.position >= message.guild.member(client.user).roles.highest.position) {
                collected.first().delete({
                    timeout: 5000
                }).catch(() => {});

                message.channel.send(message.drakeWS("administration/reaction-roles:ROLE_TO_HIGHT", {
                    emoji: "error",
                    role: roleR.name
                })).then(m => m.delete({
                    timeout: 5000
                }).catch(() => {}));

                await msg.reactions.removeAll()
                return await start(false);
            };



            collected.first().delete().catch(() => {});
            // Fin rôle

            // Début finit
            const newEmbed = new MessageEmbed()
            .setTitle(client.emotes["succes"])
            .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic:true }))
            .setFooter(client.cfg.footer)
            .setColor(client.cfg.color.blue)
            .setDescription(message.drakeWS("administration/reaction-roles:FINISH_ADD", {
                channel: ChannelR.id,
                messageID: messageIDR,
                reaction: reactionR,
                role: roleR.id,
            }));

            msg.edit({
                embed: newEmbed
            });

            // Fin finit
            messageIDR.react(reactionR);
            
            data.guild.reactioncount++;
            data.guild.reactionroles.push({
                channel: ChannelR.id,
                message: messageIDR.id,
                reaction: reactionR,
                role: roleR.id,
                count: data.guild.reactioncount
            });

            filter = (button) => button.clicker.user.id === message.author.id;

            await data.guild.save();
            await afterHelp(newEmbed);
        }

        async function listReactionRole() {

            const embed = new MessageEmbed()
            .setTitle(message.drakeWS("administration/reaction-roles:LIST_REACTION"))
            .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic:true }))
            .setFooter(client.cfg.footer)
            .setColor(client.cfg.color.orange)
            .setDescription((data.guild.reactionroles.length !== 0 ? 
                data.guild.reactionroles.map((rr) => "**ID:** " + rr.count + "\n[Message](https://discord.com/channels/"+message.guild+"/"+rr.channel+"/"+rr.message+") " + message.drakeWS("administration/reaction-roles:REACTION") +  ": ``" + rr.reaction + "`` **|** " + message.drakeWS("administration/reaction-roles:ROLE") + ": <@&" + rr.role + ">") : 
                    message.drakeWS("administration/reaction-roles:NO_REACTION_ROLES", {
                        prefix: data.guild.prefix
            })));

            await msg.edit({
                embed: embed
            });

            afterHelp(embed);
        };

        async function removeReactionRole() {

            filter = (m) => m.author.id === message.author.id;

            const embed = new MessageEmbed()
            .setTitle(message.drakeWS("administration/reaction-roles:REMOVE_REACTION"))
            .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic:true }))
            .setFooter(client.cfg.footer)
            .setColor(client.cfg.color.purple)
            .setDescription(message.drakeWS("administration/reaction-roles:INSTRUCTIONS_REMOVE", {
                emoji: "clear"
            }));

            // Début Suppression
            await msg.edit({
                embed: embed
            });

            let collected = await message.channel.awaitMessages(filter, opt).catch(() => {});
            if(!collected || !collected.first()) return cancel();
            
            let confMessage = collected.first().content;

            if(confMessage == "cancel") {
                await msg.reactions.removeAll()
                await collected.first().delete();
                return await start(false);
            };

            IDofReact = confMessage;

            if(!IDofReact || isNaN(IDofReact) || !data.guild.reactionroles.filter((rr) => rr.id === parseInt(IDofReact))) {

                collected.first().delete({
                    timeout: 5000
                }).catch(() => {});

                message.channel.send(message.drakeWS("administration/reaction-roles:ID_NOT_EXIST", {
                    emoji: "error",
                    id: confMessage
                })).then(m => m.delete({
                    timeout: 5000
                }).catch(() => {}));

                await msg.reactions.removeAll()
                return await start(false);
            };

            collected.first().delete();

            const newEmbed = new MessageEmbed()
            .setTitle(client.emotes["succes"])
            .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic:true }))
            .setFooter(client.cfg.footer)
            .setColor(client.cfg.color.purple)
            .setDescription(message.drakeWS("administration/reaction-roles:FINISH_REMOVE", {
                id: confMessage
            }));

            await msg.edit({
                embed: newEmbed
            });

            filter = (button) => button.clicker.user.id === message.author.id;

            data.guild.reactionroles = data.guild.reactionroles.filter((rr) => rr.count !== parseInt(IDofReact));

            await data.guild.save();
            afterHelp(newEmbed);	
        };

        async function wait(first) {

            const embed = new MessageEmbed()
            .setAuthor(message.author.username, message.author.displayAvatarURL({format: 'png', dynamic: true, size: 1024}))
            .setColor(client.cfg.color.blue)
            .setTitle(message.drakeWS("administration/reaction-roles:TITLE"))
            .setFooter(client.cfg.footer)
            .setDescription(message.drakeWS("misc:PLEASE_WAIT", {
                emoji: "waiting"
            }));

            if(first) return message.channel.send(embed);
            return msg.edit({
                embed: embed
            });
        };

        async function changeButtonStatus(status) {

            let makeButtonAvailable = Boolean(status === "dispo");

            let addButton = new MessageButton()
            .setStyle(makeButtonAvailable ? 'green' : 'gray')
            .setLabel('Add ➕')
            .setID(localButtonsID["addButton"]);

            let listButton = new MessageButton()
            .setStyle(makeButtonAvailable ? 'blurple' : 'gray')
            .setLabel('List 📜')
            .setID(localButtonsID["listButton"]);

            let removeButton = new MessageButton()
            .setStyle(makeButtonAvailable ? 'red' : 'gray')
            .setLabel('Remove ➖')
            .setID(localButtonsID["removeButton"]);

            let closeButton = new MessageButton()
            .setStyle(makeButtonAvailable ? 'red' : 'gray')
            .setLabel('Close ❌')
            .setID(localButtonsID["closeButton"]);

            if(!makeButtonAvailable) {
                addButton.setDisabled(true);
                listButton.setDisabled(true);
                removeButton.setDisabled(true);
                closeButton.setDisabled(true);
            };

            let group1 = new MessageActionRow().addComponents([ addButton, listButton, removeButton, closeButton ]);

            await msg.edit({
                components: [group1],
                embed: msg.embeds[0]
            }).catch(() => {});

        };

        async function start(first) {

            filter = (button) => button.clicker.user.id === message.author.id;

            msg = await wait(first);

            let addButton = new MessageButton()
            .setStyle('green')
            .setLabel('Add ➕')
            .setID(`${message.guild.id}${message.author.id}${Date.now()}ADD`);

            let listButton = new MessageButton()
            .setStyle('blurple')
            .setLabel('List 📜')
            .setID(`${message.guild.id}${message.author.id}${Date.now()}LIST`);

            let removeButton = new MessageButton()
            .setStyle('red')
            .setLabel('Remove ➖')
            .setID(`${message.guild.id}${message.author.id}${Date.now()}REMOVE`);

            let closeButton = new MessageButton()
            .setStyle('red')
            .setLabel('Close ❌')
            .setID(`${message.guild.id}${message.author.id}${Date.now()}CLOSE`);

            localButtonsID["addButton"] = addButton.custom_id;
            localButtonsID["listButton"] = listButton.custom_id;
            localButtonsID["removeButton"] = removeButton.custom_id;
            localButtonsID["closeButton"] = closeButton.custom_id;

            const embed = await displayMain(msg, true);

            let group1 = new MessageActionRow().addComponents([ addButton, listButton, removeButton, closeButton ]);

            await msg.edit({
                components: [group1],
                embed: embed
            }).catch(() => {});

            const ThingToDo = await waitForButton();
            if(first) return ThingToDo;
            await switchCTV(ThingToDo);
        };

        async function afterHelp(previousEmbed) {

            let returnButton = new MessageButton()
            .setStyle('blurple')
            .setLabel('Return ↩️')
            .setID(`${message.guild.id}${message.author.id}${Date.now()}RETURNHOME`);

            let group1 = new MessageActionRow().addComponents([ returnButton ]);

            msg = await msg.edit({
                components: [group1],
                embed: previousEmbed
            }).catch(() => {});

            const retunHome = await waitForButton();
            if(retunHome.id === returnButton.custom_id) {
                await start(false);
            };
        };

        async function switchCTV(ctv) {
            if(!ctv) return;
            switch(ctv.id) {

                case localButtonsID["addButton"]:
                    msg = await addReactionRole();
                    break;
                case localButtonsID["listButton"]:
                    msg = await listReactionRole();
                    break;
                case localButtonsID["removeButton"]:
                    msg = await removeReactionRole();
                    break;
                case localButtonsID["closeButton"]:
                    message.drake("common:CANCEL", {
                        emoji: "succes"
                    });
                    return cancel();
                default:
                    return;
            };
        };

        const ctv = await start(true);
        await switchCTV(ctv);
    };
};

module.exports = ReactionRoles;