const Command = require("../../structure/Commands.js");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const ms = require("ms");

class ReactionRoles extends Command {

    constructor(client) {
        super(client, {
            name: "reaction-roles",
            aliases: ["react-roles", "reactions-roles", "rr", "reaction-role"],
            enabled: true,
            dirname: __dirname,
            botPerms: ["MANAGE_MESSAGES"],
            userPerms: ["MANAGE_GUILD"],
            restriction: [],

            slashCommandOptions: {
                description: "Manage reaction roles on your server"
            }
        });
    };

    async run(message, args, data) {

        const client = this.client;

        const embed = new MessageEmbed()
            .setAuthor(message.author.username, message.author.displayAvatarURL({format: 'png', dynamic: true, size: 1024}))
            .setColor("BLUE")
            .setDescription(message.drakeWS("administration/reaction-roles:INSTRUCTIONS"))
            .setFooter(client.cfg.footer);

        let addButton = new MessageButton()
            .setStyle('SUCCESS')
            .setLabel('Add ➕')
            .setDisabled(false)
            .setCustomId(`${message.guild.id}${message.author.id}${Date.now()}ADD`);

        let listButton = new MessageButton()
            .setStyle('PRIMARY')
            .setLabel('List 📜')
            .setDisabled(false)
            .setCustomId(`${message.guild.id}${message.author.id}${Date.now()}LIST`);

        let removeButton = new MessageButton()
            .setStyle('DANGER')
            .setLabel('Remove ➖')
            .setDisabled(false)
            .setCustomId(`${message.guild.id}${message.author.id}${Date.now()}REMOVE`);

        const group = new MessageActionRow().addComponents([ addButton, listButton, removeButton ]);

        message.reply({
            embeds: [embed],
            components: [group]
        }).then(async m => {

            const filter = (button) => button.user.id === message.author.id == (
                button.customId === addButton.customId ||
                button.customId === listButton.customId ||
                button.customId === removeButton.customId
            );

            const opt = { 
                filter: (m) => m.author.id === message.author.id,
                max: 1, 
                time: 50000, 
                errors: [ "time" ] 
            };

            const collector = m.createMessageComponentCollector({
                filter,
                time: ms('10m')
            });

            collector.on("collect", async b => {

                await b.deferUpdate();

                switch(b.customId) {
                    case addButton.customId:
                        const embed1 = new MessageEmbed()
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
                        m.edit({
                            embeds: [embed1],
                            components: []
                        });
            
                        let collected = await message.channel.awaitMessages(opt);
                        if(!collected || !collected.first()) return badInput(null, message.drakeWS("administration/reaction-roles:NOT_VALID", { emoji: "error" }));
            
                        let confChannel = collected.first();
                        let confMessage = collected.first().content;
            
                        if(confMessage == "cancel") return badInput(confChannel, message.drakeWS("administration/reaction-roles:NOT_VALID", { emoji: "error", }));
            
                        const ChannelR = confChannel.mentions.channels.first() || message.guild.channels.cache.get(confChannel.content) || message.guild.channels.cache.find((ch) => ch.name === confChannel.content || `#${ch.name}` === confChannel.content);
                        if(!ChannelR) return badInput(confChannel, message.drakeWS("administration/reaction-roles:CHANNEL_NOT_FOUND", { emoji: "error", channel: confMessage }));
            
                        collected.first().delete().catch(() => {});
                        // Fin channel
            
            
            
                        // Début Message ID
                        embed.setTitle(message.drakeWS("administration/reaction-roles:ADD_REACTION", {
                            step: "2"
                        }))
                        .setDescription(message.drakeWS("administration/reaction-roles:INSTRUCTIONS_ADD_2", {
                            emoji: "id",
                        }));
            
                        m.edit({
                            embeds: [embed]
                        });
            
                        collected = await message.channel.awaitMessages(opt);
                        if(!collected || !collected.first()) return badInput(null, message.drakeWS("administration/reaction-roles:NOT_VALID", { emoji: "error" }));
                        
                        confMessage = collected.first().content;
                        if(confMessage == "cancel") return badInput(collected.first(), message.drakeWS("administration/reaction-roles:NOT_VALID", { emoji: "error" }));
            
                        if(isNaN(confMessage)) return badInput(collected.first(), message.drakeWS("administration/reaction-roles:MESSAGE_NOT_FOUND", { emoji: "error", message: confMessage }));
            
                        const messageIDR = await client.channels.cache.get(ChannelR.id).messages.fetch(confMessage);
                        if(!messageIDR) return badInput(collected.first(), message.drakeWS("administration/reaction-roles:MESSAGE_NOT_FOUND", { emoji: "error", message: confMessage }));
            
                        collected.first().delete().catch(() => {});
                        // Fin Message ID
            
            
            
                        // Début Emoji
                        embed.setTitle(message.drakeWS("administration/reaction-roles:ADD_REACTION", {
                            step: "3"
                        }))
                        .setDescription(message.drakeWS("administration/reaction-roles:INSTRUCTIONS_ADD_3", {
                            emoji: "smile",
                        }));
            
                        m.edit({
                            embeds: [embed]
                        });
            
                        collected = await message.channel.awaitMessages(opt);
                        if(!collected || !collected.first()) return badInput(null, message.drakeWS("administration/reaction-roles:NOT_VALID", { emoji: "error" }));
            
                        confMessage = collected.first().content;
                        if(confMessage == "cancel") return badInput(collected.first(), message.drakeWS("administration/reaction-roles:NOT_VALID", { emoji: "error" }));
                        
                        await message.react(confMessage).catch(() => {
                            collected.first().delete().catch(() => {});
                            return badInput(null, message.drakeWS("administration/reaction-roles:EMOJI_NOT_FOUND", { emoji: "error", emoji: confMessage}));
                        });
            
                        const reactionR = confMessage;
            
                        collected.first().delete().catch(() => {});
                        // Fin Emoji
            
            
            
                        // Début role
                        embed.setTitle(message.drakeWS("administration/reaction-roles:ADD_REACTION", {
                            step: "4"
                        }))
                        .setDescription(message.drakeWS("administration/reaction-roles:INSTRUCTIONS_ADD_4", {
                            emoji: "roleList"
                        }));
            
                        m.edit({
                            embeds: [embed]
                        }).catch(() => {});
            
                        collected = await message.channel.awaitMessages(opt);
                        if(!collected || !collected.first()) return badInput(null, message.drakeWS("administration/reaction-roles:NOT_VALID", { emoji: "error" }));
            
                        confMessage = collected.first().content;
                        if(confMessage == "cancel") return badInput(collected.first(), message.drakeWS("administration/reaction-roles:NOT_VALID", { emoji: "error" }));
            
                        const roleR = message.guild.roles.cache.get(confMessage) || collected.first().mentions.roles.first();
            
                        if(!roleR) return badInput(collected.first(), message.drakeWS("administration/reaction-roles:ROLE_NOT_FOUND", { emoji: "error", role: confMessage }));
                        if(roleR.position >= message.guild.members.cache.get(client.user.id).roles.highest.position) return badInput(collected.first(), message.drakeWS("administration/reaction-roles:ROLE_TO_HIGHT", { emoji: "error", role: roleR}));

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
            
                        await data.guild.save();
                        await afterHelp(m, newEmbed, [addButton, removeButton, listButton]);
                        break;
                    case listButton.customId:

                        const embed5 = new MessageEmbed()
                            .setTitle(message.drakeWS("administration/reaction-roles:LIST_REACTION"))
                            .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic:true }))
                            .setFooter(client.cfg.footer)
                            .setColor(client.cfg.color.orange)
                            .setDescription(`${(data.guild.reactionroles.length !== 0 ? 
                                data.guild.reactionroles.map((rr) => "**ID:** " + rr.count + "\n[Message](https://discord.com/channels/"+message.guild+"/"+rr.channel+"/"+rr.message+") " + message.drakeWS("administration/reaction-roles:REACTION") +  ": ``" + rr.reaction + "`` **|** " + message.drakeWS("administration/reaction-roles:ROLE") + ": <@&" + rr.role + ">") : 
                                    message.drakeWS("administration/reaction-roles:NO_REACTION_ROLES", {
                                        prefix: data.guild.prefix
                            }))}`);

                        await afterHelp(m, embed5, [addButton, removeButton, listButton]);
                        break;
                    case removeButton.customId:
                        const embed6 = new MessageEmbed()
                        .setTitle(message.drakeWS("administration/reaction-roles:REMOVE_REACTION"))
                        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic:true }))
                        .setFooter(client.cfg.footer)
                        .setColor(client.cfg.color.purple)
                        .setDescription(message.drakeWS("administration/reaction-roles:INSTRUCTIONS_REMOVE", {
                            emoji: "clear"
                        }));
        
                        // Début Suppression
                        await m.edit({
                            embeds: [embed6]
                        });
            
                        let collected1 = await message.channel.awaitMessages(opt);
                        if(!collected1 || !collected1.first()) return badInput(null, message.drakeWS("administration/reaction-roles:NOT_VALID", { emoji: "error" }));
                        
                        let confMessage1 = collected1.first().content;
                        if(confMessage1 == "cancel") return badInput(collected1.first(), message.drakeWS("administration/reaction-roles:NOT_VALID", { emoji: "error" }));
            
                        const IDofReact = confMessage1;
            
                        if(!IDofReact || isNaN(IDofReact) || !data.guild.reactionroles.filter((rr) => rr.id === parseInt(IDofReact))) return badInput(collected1.first(), message.drakeWS("administration/reaction-roles:ID_NOT_EXIST", { 
                            emoji: "error",
                            id: confMessage1
                        }));
            
                        collected1.first().delete().catch(() => {});
            
                        const newEmbed1 = new MessageEmbed()
                            .setTitle(client.emotes["succes"])
                            .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic:true }))
                            .setFooter(client.cfg.footer)
                            .setColor(client.cfg.color.purple)
                            .setDescription(message.drakeWS("administration/reaction-roles:FINISH_REMOVE", {
                                id: confMessage1
                            }));
            
                        data.guild.reactionroles = data.guild.reactionroles.filter((rr) => rr.count !== parseInt(IDofReact));
            
                        await data.guild.save();
                        await afterHelp(m, newEmbed1, [addButton, removeButton, listButton]);
                        break;
                    default:
                        client.emit("error", "Default case in reaction-roles.js");
                        break;
                };
            });

            collector.on("end", async () => {
                const addButton1 = new MessageButton()
                    .setStyle('SUCCESS')
                    .setLabel('Add ➕')
                    .setDisabled(true)
                    .setCustomId(`${message.guild.id}${message.author.id}${Date.now()}ADD`);

                const listButton1 = new MessageButton()
                    .setStyle('PRIMARY')
                    .setLabel('List 📜')
                    .setDisabled(true)
                    .setCustomId(`${message.guild.id}${message.author.id}${Date.now()}LIST`);

                const removeButton1 = new MessageButton()
                    .setStyle('DANGER')
                    .setLabel('Remove ➖')
                    .setDisabled(true)
                    .setCustomId(`${message.guild.id}${message.author.id}${Date.now()}REMOVE`);

                const group1 = new MessageActionRow().addComponents([ addButton1, listButton1, removeButton1 ]);

                await m.edit({
                    components: [group1],
                    embeds: [embed],
                    content: null
                });
            });

        });

        async function badInput(question, reason) {
            const errorEmbed = new MessageEmbed()
                .setColor("#D54052")
                .setDescription(`${reason}`);

            let errorMessage = await message.channel.send({
                embeds: [errorEmbed]
            });

            setTimeout(() => errorMessage.delete().catch(() => {}), 5000);
            if(question) question.delete().catch(() => {});
        };

        async function afterHelp(m, embed, buttons) {

            let returnButton = new MessageButton()
            .setStyle('PRIMARY')
            .setLabel('Return ↩️')
            .setDisabled(false)
            .setCustomId(`${message.guild.id}${message.author.id}${Date.now()}RETURNHOME`);

            let group1 = new MessageActionRow().addComponents([ returnButton ]);

            await m.edit({
                components: [group1],
                embeds: [embed]
            });

            const filter = (button) => button.user.id === message.author.id;

            const collector = m.createMessageComponentCollector({
                filter,
                time: ms('10m'),
                max: 1
            });

            collector.on("collect", async b => {
                await b.deferUpdate();

                if(b.customId === returnButton.customId) {
                    const embed1 = new MessageEmbed()
                        .setAuthor(message.author.username, message.author.displayAvatarURL({format: 'png', dynamic: true, size: 1024}))
                        .setColor("BLUE")
                        .setDescription(message.drakeWS("administration/reaction-roles:INSTRUCTIONS"))
                        .setFooter(client.cfg.footer);
        
                    let addButton2 = new MessageButton()
                        .setStyle('SUCCESS')
                        .setLabel('Add ➕')
                        .setDisabled(false)
                        .setCustomId(buttons[0].customId);
            
                    let listButton2 = new MessageButton()
                        .setStyle('PRIMARY')
                        .setLabel('List 📜')
                        .setDisabled(false)
                        .setCustomId(buttons[2].customId);
            
                    let removeButton2 = new MessageButton()
                        .setStyle('DANGER')
                        .setLabel('Remove ➖')
                        .setDisabled(false)
                        .setCustomId(buttons[1].customId);
            
                    group1 = new MessageActionRow().addComponents([ addButton2, listButton2, removeButton2 ]);

                    await m.edit({
                        components: [group1],
                        embeds: [embed1]
                    });
                } else return;
            });

            collector.on("end", () => {
                return;
            });
        };
    };

    async runInteraction(interaction, data) {

        const client = this.client;

        const embed = new MessageEmbed()
            .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({format: 'png', dynamic: true, size: 1024}))
            .setColor("BLUE")
            .setDescription(interaction.drakeWS("administration/reaction-roles:INSTRUCTIONS"))
            .setFooter(client.cfg.footer);

        let addButton = new MessageButton()
            .setStyle('SUCCESS')
            .setLabel('Add ➕')
            .setDisabled(false)
            .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}ADD`);

        let listButton = new MessageButton()
            .setStyle('PRIMARY')
            .setLabel('List 📜')
            .setDisabled(false)
            .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}LIST`);

        let removeButton = new MessageButton()
            .setStyle('DANGER')
            .setLabel('Remove ➖')
            .setDisabled(false)
            .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}REMOVE`);

        const group = new MessageActionRow().addComponents([ addButton, listButton, removeButton ]);

        interaction.reply({
            embeds: [embed],
            components: [group]
        }).then(async m => {

            const filter = (button) => button.user.id === interaction.user.id == (
                button.customId === addButton.customId ||
                button.customId === listButton.customId ||
                button.customId === removeButton.customId
            );

            const opt = { 
                filter: (m) => m.author.id === interaction.user.id,
                max: 1, 
                time: 50000, 
                errors: [ "time" ] 
            };

            const collector = interaction.channel.createMessageComponentCollector({
                filter,
                time: ms('10m')
            });

            collector.on("collect", async b => {

                await b.deferUpdate();

                switch(b.customId) {
                    case addButton.customId:
                        const embed1 = new MessageEmbed()
                            .setTitle(interaction.drakeWS("administration/reaction-roles:ADD_REACTION", {
                                step: "1"
                            }))
                            .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic:true }))
                            .setFooter(client.cfg.footer)
                            .setColor(client.cfg.color.blue)
                            .setDescription(interaction.drakeWS("administration/reaction-roles:INSTRUCTIONS_ADD_1", {
                                emoji: "channel"
                            }));
            
                        // Début Channel
                        interaction.editReply({
                            embeds: [embed1],
                            components: []
                        });
            
                        let collected = await interaction.channel.awaitMessages(opt);
                        if(!collected || !collected.first()) return badInput(null, interaction.drakeWS("administration/reaction-roles:NOT_VALID", { emoji: "error" }));
            
                        let confChannel = collected.first();
                        let confMessage = collected.first().content;
            
                        if(confMessage == "cancel") return badInput(confChannel, interaction.drakeWS("administration/reaction-roles:NOT_VALID", { emoji: "error", }));
            
                        const ChannelR = confChannel.mentions.channels.first() || interaction.guild.channels.cache.get(confChannel.content) || interaction.guild.channels.cache.find((ch) => ch.name === confChannel.content || `#${ch.name}` === confChannel.content);
                        if(!ChannelR) return badInput(confChannel, interaction.drakeWS("administration/reaction-roles:CHANNEL_NOT_FOUND", { emoji: "error", channel: confMessage }));
            
                        collected.first().delete().catch(() => {});
                        // Fin channel
            
            
            
                        // Début Message ID
                        embed.setTitle(interaction.drakeWS("administration/reaction-roles:ADD_REACTION", {
                            step: "2"
                        }))
                        .setDescription(interaction.drakeWS("administration/reaction-roles:INSTRUCTIONS_ADD_2", {
                            emoji: "id",
                        }));
            
                        interaction.editReply({
                            embeds: [embed],
                            components: []
                        });
            
                        collected = await interaction.channel.awaitMessages(opt);
                        if(!collected || !collected.first()) return badInput(null, interaction.drakeWS("administration/reaction-roles:NOT_VALID", { emoji: "error" }));
                        
                        confMessage = collected.first().content;
                        if(confMessage == "cancel") return badInput(collected.first(), interaction.drakeWS("administration/reaction-roles:NOT_VALID", { emoji: "error" }));
            
                        if(isNaN(confMessage)) return badInput(collected.first(), interaction.drakeWS("administration/reaction-roles:MESSAGE_NOT_FOUND", { emoji: "error", message: confMessage }));
            
                        const messageIDR = await client.channels.cache.get(ChannelR.id).messages.fetch(confMessage);
                        if(!messageIDR) return badInput(collected.first(), interaction.drakeWS("administration/reaction-roles:MESSAGE_NOT_FOUND", { emoji: "error", message: confMessage }));
            
                        collected.first().delete().catch(() => {});
                        // Fin Message ID
            
            
            
                        // Début Emoji
                        embed.setTitle(interaction.drakeWS("administration/reaction-roles:ADD_REACTION", {
                            step: "3"
                        }))
                        .setDescription(interaction.drakeWS("administration/reaction-roles:INSTRUCTIONS_ADD_3", {
                            emoji: "smile",
                        }));
            
                        interaction.editReply({
                            embeds: [embed],
                            components: []
                        });
            
                        collected = await interaction.channel.awaitMessages(opt);
                        if(!collected || !collected.first()) return badInput(null, interaction.drakeWS("administration/reaction-roles:NOT_VALID", { emoji: "error" }));
            
                        confMessage = collected.first().content;
                        if(confMessage == "cancel") return badInput(collected.first(), interaction.drakeWS("administration/reaction-roles:NOT_VALID", { emoji: "error" }));

                        const testMessage = await interaction.channel.send({
                            content: "Test !"
                        });
                        
                        await testMessage.react(confMessage).catch(() => {
                            testMessage.delete().catch(() => {});
                            collected.first().delete().catch(() => {});
                            return badInput(null, interaction.drakeWS("administration/reaction-roles:EMOJI_NOT_FOUND", { emoji: "error", emoji: confMessage}));
                        });
            
                        const reactionR = confMessage;
            
                        testMessage.delete().catch(() => {});
                        collected.first().delete().catch(() => {});
                        // Fin Emoji
            
            
            
                        // Début role
                        embed.setTitle(interaction.drakeWS("administration/reaction-roles:ADD_REACTION", {
                            step: "4"
                        }))
                        .setDescription(interaction.drakeWS("administration/reaction-roles:INSTRUCTIONS_ADD_4", {
                            emoji: "roleList"
                        }));
            
                        interaction.editReply({
                            embeds: [embed],
                            components: []
                        }).catch(() => {});
            
                        collected = await interaction.channel.awaitMessages(opt);
                        if(!collected || !collected.first()) return badInput(null, interaction.drakeWS("administration/reaction-roles:NOT_VALID", { emoji: "error" }));
            
                        confMessage = collected.first().content;
                        if(confMessage == "cancel") return badInput(collected.first(), interaction.drakeWS("administration/reaction-roles:NOT_VALID", { emoji: "error" }));
            
                        const roleR = interaction.guild.roles.cache.get(confMessage) || collected.first().mentions.roles.first();
            
                        if(!roleR) return badInput(collected.first(), interaction.drakeWS("administration/reaction-roles:ROLE_NOT_FOUND", { emoji: "error", role: confMessage }));
                        if(roleR.position >= interaction.guild.members.cache.get(client.user.id).roles.highest.position) return badInput(collected.first(), interaction.drakeWS("administration/reaction-roles:ROLE_TO_HIGHT", { emoji: "error", role: roleR}));

                        collected.first().delete().catch(() => {});
            
                        // Fin rôle
            
                        // Début finit
                        const newEmbed = new MessageEmbed()
                            .setTitle(client.emotes["succes"])
                            .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic:true }))
                            .setFooter(client.cfg.footer)
                            .setColor(client.cfg.color.blue)
                            .setDescription(interaction.drakeWS("administration/reaction-roles:FINISH_ADD", {
                                channel: ChannelR.id,
                                messageID: messageIDR,
                                reaction: reactionR,
                                role: roleR.id,
                            }));
            
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
            
                        await data.guild.save();
                        await afterHelp(m, newEmbed, [addButton, removeButton, listButton]);
                        break;
                    case listButton.customId:

                        const embed5 = new MessageEmbed()
                            .setTitle(interaction.drakeWS("administration/reaction-roles:LIST_REACTION"))
                            .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic:true }))
                            .setFooter(client.cfg.footer)
                            .setColor(client.cfg.color.orange)
                            .setDescription(`${(data.guild.reactionroles.length !== 0 ? 
                                data.guild.reactionroles.map((rr) => "**ID:** " + rr.count + "\n[Message](https://discord.com/channels/"+interaction.guild+"/"+rr.channel+"/"+rr.interaction+") " + interaction.drakeWS("administration/reaction-roles:REACTION") +  ": `" + rr.reaction + "` **|** " + interaction.drakeWS("administration/reaction-roles:ROLE") + ": <@&" + rr.role + ">") : 
                                    interaction.drakeWS("administration/reaction-roles:NO_REACTION_ROLES", {
                                        prefix: data.guild.prefix
                            }))}`);

                        await afterHelp(m, embed5, [addButton, removeButton, listButton]);
                        break;
                    case removeButton.customId:
                        const embed6 = new MessageEmbed()
                        .setTitle(interaction.drakeWS("administration/reaction-roles:REMOVE_REACTION"))
                        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic:true }))
                        .setFooter(client.cfg.footer)
                        .setColor(client.cfg.color.purple)
                        .setDescription(interaction.drakeWS("administration/reaction-roles:INSTRUCTIONS_REMOVE", {
                            emoji: "clear"
                        }));
        
                        // Début Suppression
                        await interaction.editReply({
                            embeds: [embed6]
                        });
            
                        let collected1 = await interaction.channel.awaitMessages(opt);
                        if(!collected1 || !collected1.first()) return badInput(null, interaction.drakeWS("administration/reaction-roles:NOT_VALID", { emoji: "error" }));
                        
                        let confMessage1 = collected1.first().content;
                        if(confMessage1 == "cancel") return badInput(collected1.first(), interaction.drakeWS("administration/reaction-roles:NOT_VALID", { emoji: "error" }));
            
                        const IDofReact = confMessage1;
            
                        if(!IDofReact || isNaN(IDofReact) || !data.guild.reactionroles.filter((rr) => rr.id === parseInt(IDofReact))) return badInput(collected1.first(), interaction.drakeWS("administration/reaction-roles:ID_NOT_EXIST", { 
                            emoji: "error",
                            id: confMessage1
                        }));
            
                        collected1.first().delete().catch(() => {});
            
                        const newEmbed1 = new MessageEmbed()
                            .setTitle(client.emotes["succes"])
                            .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic:true }))
                            .setFooter(client.cfg.footer)
                            .setColor(client.cfg.color.purple)
                            .setDescription(interaction.drakeWS("administration/reaction-roles:FINISH_REMOVE", {
                                id: confMessage1
                            }));
            
                        data.guild.reactionroles = data.guild.reactionroles.filter((rr) => rr.count !== parseInt(IDofReact));
            
                        await data.guild.save();
                        await afterHelp(m, newEmbed1, [addButton, removeButton, listButton]);
                        break;
                    default:
                        client.emit("error", "Default case in reaction-roles.js");
                        break;
                };
            });

            collector.on("end", async () => {
                const addButton1 = new MessageButton()
                    .setStyle('SUCCESS')
                    .setLabel('Add ➕')
                    .setDisabled(true)
                    .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}ADD`);

                const listButton1 = new MessageButton()
                    .setStyle('PRIMARY')
                    .setLabel('List 📜')
                    .setDisabled(true)
                    .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}LIST`);

                const removeButton1 = new MessageButton()
                    .setStyle('DANGER')
                    .setLabel('Remove ➖')
                    .setDisabled(true)
                    .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}REMOVE`);

                const group1 = new MessageActionRow().addComponents([ addButton1, listButton1, removeButton1 ]);

                await interaction.editReply({
                    components: [group1],
                    embeds: [embed],
                    content: null
                });
            });

        });

        async function badInput(question, reason) {
            const errorEmbed = new MessageEmbed()
                .setColor("#D54052")
                .setDescription(`${reason}`);

            let errorMessage = await interaction.channel.send({
                embeds: [errorEmbed]
            });

            setTimeout(() => errorMessage.delete().catch(() => {}), 5000);
            if(question) question.delete().catch(() => {});
        };

        async function afterHelp(m, embed, buttons) {

            let returnButton = new MessageButton()
            .setStyle('PRIMARY')
            .setLabel('Return ↩️')
            .setDisabled(false)
            .setCustomId(`${interaction.guild.id}${interaction.user.id}${Date.now()}RETURNHOME`);

            let group1 = new MessageActionRow().addComponents([ returnButton ]);

            await interaction.editReply({
                components: [group1],
                embeds: [embed]
            });

            const filter = (button) => button.user.id === interaction.user.id;

            const collector = interaction.channel.createMessageComponentCollector({
                filter,
                time: ms('10m'),
                max: 1
            });

            collector.on("collect", async b => {
                await b.deferUpdate();

                if(b.customId === returnButton.customId) {
                    const embed1 = new MessageEmbed()
                        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({format: 'png', dynamic: true, size: 1024}))
                        .setColor("BLUE")
                        .setDescription(interaction.drakeWS("administration/reaction-roles:INSTRUCTIONS"))
                        .setFooter(client.cfg.footer);
        
                    let addButton2 = new MessageButton()
                        .setStyle('SUCCESS')
                        .setLabel('Add ➕')
                        .setDisabled(false)
                        .setCustomId(buttons[0].customId);
            
                    let listButton2 = new MessageButton()
                        .setStyle('PRIMARY')
                        .setLabel('List 📜')
                        .setDisabled(false)
                        .setCustomId(buttons[2].customId);
            
                    let removeButton2 = new MessageButton()
                        .setStyle('DANGER')
                        .setLabel('Remove ➖')
                        .setDisabled(false)
                        .setCustomId(buttons[1].customId);
            
                    group1 = new MessageActionRow().addComponents([ addButton2, listButton2, removeButton2 ]);

                    await interaction.editReply({
                        components: [group1],
                        embeds: [embed1]
                    });
                } else return;
            });

            collector.on("end", () => {
                return;
            });
        };
    };
};

module.exports = ReactionRoles;