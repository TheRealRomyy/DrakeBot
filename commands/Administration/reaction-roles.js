const Command = require("../../structure/Commands.js");
const { MessageEmbed } = require("discord.js");

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

        let msg = null;
        let retunHome = null;
        let IDofReact = null;

        let ChannelR = null;
        let messageIDR = null;
        let reactionR = null;
        let roleR = null;

        let filter = (reaction, user) => {
            return ['➕', '📜', '➖', '❌', '↩️'].includes(reaction.emoji.name) && user.id === message.author.id;
        };
        const opt = { max: 1, time: 50000, errors: [ "time" ] };
        
        async function cancel() {
            msg.delete().catch(() => {});
            message.delete().catch(() => {});
        };

        async function WaitForReaction(msg) {

            let reaction = null;

            await msg.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] }).then(collected => {
                reaction = collected.first();
            }).catch(collected => {
                return cancel();
            });

            if(reaction == null) return;
            return reaction.emoji.name;
        };

        async function displayMain(msg) {

            const embed = new MessageEmbed()
            .setAuthor(message.author.username, message.author.displayAvatarURL({format: 'png', dynamic: true, size: 1024}))
            .setColor("RANDOM")
            .setDescription(message.drakeWS("administration/reaction-roles:INSTRUCTIONS"))
            .setFooter(client.cfg.footer)

            return msg.edit(embed);
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
            msg.edit(embed);

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

            msg.edit(embed);

            collected = await message.channel.awaitMessages(filter, opt).catch(() => {});

            if(!collected || !collected.first()) return cancel();
            
            confMessage = collected.first().content;

            if(confMessage == "cancel") {
                await msg.reactions.removeAll()
                await collected.first().delete();
                return await start(false);
            }

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
            }

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
            }

            collected.first().delete().catch(() => {});
            // Fin Message ID

            // Début Emoji

            embed.setTitle(message.drakeWS("administration/reaction-roles:ADD_REACTION", {
                step: "3"
            }))
            .setDescription(message.drakeWS("administration/reaction-roles:INSTRUCTIONS_ADD_3", {
                emoji: "smile",
            }));

            msg.edit(embed);

            collected = await message.channel.awaitMessages(filter, opt).catch(() => {});

            if(!collected || !collected.first()) return cancel();

            confMessage = collected.first().content;

            if(confMessage == "cancel") {
                await msg.reactions.removeAll()
                await collected.first().delete();
                return await start(false);
            }

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

            msg.edit(embed).catch(() => {});

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
            embed.setTitle(client.emotes["succes"])
            embed.setDescription(message.drakeWS("administration/reaction-roles:FINISH_ADD", {
                channel: ChannelR.id,
                messageID: messageIDR,
                reaction: reactionR,
                role: roleR.id,
            }));

            msg.edit(embed);
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

            filter = (reaction, user) => {
                return ['➕', '📜', '➖', '❌', '↩️'].includes(reaction.emoji.name) && user.id === message.author.id;
            };

            await data.guild.save();
            await afterHelp();
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

            
            return msg.edit(embed);
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
            msg.edit(embed);

            let collected = await message.channel.awaitMessages(filter, opt).catch(() => {});

            if(!collected || !collected.first()) return cancel();
            
            let confMessage = collected.first().content;

            if(confMessage == "cancel") {
                await msg.reactions.removeAll()
                await collected.first().delete();
                return await start(false);
            }

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

            embed.setDescription(message.drakeWS("administration/reaction-roles:FINISH_REMOVE", {
                id: confMessage
            }));
            embed.setTitle(client.emotes["succes"]);

            msg.edit(embed);

            filter = (reaction, user) => {
                return ['➕', '📜', '➖', '❌', '↩️'].includes(reaction.emoji.name) && user.id === message.author.id;
            };

            data.guild.reactionroles = data.guild.reactionroles.filter((rr) => rr.count !== parseInt(IDofReact));

            await data.guild.save();
            await afterHelp();	
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
            return msg.edit(embed);
        };

        async function start(first) {

            filter = (reaction, user) => {
                return ['➕', '📜', '➖', '❌', '↩️'].includes(reaction.emoji.name) && user.id === message.author.id;
            };

            if(first) msg = await wait(true);
            if(first == false) msg = await wait(false);

            await msg.react('➕');
            await msg.react('📜');
            await msg.react('➖');
            await msg.react('❌');

            msg = await displayMain(msg);

            const ThingToDo = await WaitForReaction(msg);
            if(first) return ThingToDo;
            await switchCTV(ThingToDo);
        };

        async function afterHelp() {
            await msg.reactions.removeAll()
            await msg.react('↩️')
            retunHome = await WaitForReaction(msg);
            if(retunHome == '↩️') {
                await msg.reactions.removeAll()
                await start(false);
            };
        };

        async function switchCTV(ctv) {

            switch(ctv) {
                
                case '➕':
                    await msg.reactions.removeAll()
                    msg = await addReactionRole();
                    break;
                case '📜':
                    msg = await listReactionRole();
                    await afterHelp();
                    break;
                case '➖':
                    await msg.reactions.removeAll()
                    msg = await removeReactionRole();
                    break;
                case '❌':
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