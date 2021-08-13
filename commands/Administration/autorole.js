const Command = require("../../structure/Commands.js");
const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
const ms = require("ms");

class Autorole extends Command {

    constructor(client) {
        super(client, {
            name: "autorole",
            aliases: [ "ar" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "ADMINISTRATOR" ],
            userPerms: [ "MANAGE_GUILD" ],
            cooldown: 5,
            restriction: [],

            slashCommandOptions: {
                description: "Manage autorole (role that member receive on join) on your server",
            }
        });
    };

    async run(message, args, data) {

        if(!data.guild.plugins.autorole || !Array.isArray(data.guild.plugins.autorole)) data.guild.plugins.autorole = [];
        if(!data.guild.autoroles) data.guild.autoroles = 0;
        
        const client = this.client;

        const embed = new MessageEmbed()
            .setAuthor(message.author.username, message.author.displayAvatarURL({format: 'png', dynamic: true, size: 1024}))
            .setColor("BLUE")
            .setDescription(message.drakeWS("administration/autorole:INSTRUCTIONS"))
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
                            .setTitle(message.drakeWS("administration/autorole:ADD_AUTOROLE", {
                                step: "1"
                            }))
                            .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic:true }))
                            .setFooter(client.cfg.footer)
                            .setColor(client.cfg.color.blue)
                            .setDescription(message.drakeWS("administration/autorole:INSTRUCTIONS_ADD", {
                                emoji: "channel"
                            }));
            
                        m.edit({
                            embeds: [embed1],
                            components: []
                        });
            
                        const collected = await message.channel.awaitMessages(opt);
                        if(!collected || !collected.first()) return badInput(null, message.drakeWS("administration/reaction-roles:NOT_VALID", { emoji: "error" }));
            
                        const confMessage = collected.first().content;
                        if(confMessage == "cancel") return badInput(collected.first(), message.drakeWS("administration/reaction-roles:NOT_VALID", { emoji: "error" }));
            
                        const roleR = message.guild.roles.cache.get(confMessage) || collected.first().mentions.roles.first();
            
                        if(!roleR) return badInput(collected.first(), message.drakeWS("administration/reaction-roles:ROLE_NOT_FOUND", { emoji: "error", role: confMessage }));
                        if(roleR.position >= message.guild.members.cache.get(client.user.id).roles.highest.position) return badInput(collected.first(), message.drakeWS("administration/reaction-roles:ROLE_TO_HIGHT", { emoji: "error", role: roleR}));

                        collected.first().delete().catch(() => {});
            
    
                        const newEmbed = new MessageEmbed()
                            .setTitle(client.emotes["succes"])
                            .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic:true }))
                            .setFooter(client.cfg.footer)
                            .setColor(client.cfg.color.blue)
                            .setDescription(message.drakeWS("administration/autorole:FINISH_ADD", {
                                role: roleR.id,
                            }));
                        
                        data.guild.autoroles++;
                        data.guild.plugins.autorole.push({
                            role: roleR.id,
                            count: data.guild.autoroles
                        });
            
                        await data.guild.save();
                        await afterHelp(m, newEmbed, [addButton, removeButton, listButton]);
                        break;
                    case listButton.customId:

                        const embed5 = new MessageEmbed()
                            .setTitle(message.drakeWS("administration/autorole:LIST_REACTION"))
                            .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic:true }))
                            .setFooter(client.cfg.footer)
                            .setColor(client.cfg.color.orange)
                            .setDescription(`${(data.guild.plugins.autorole.length !== 0 ? 
                                data.guild.plugins.autorole.map((rr) => "**ID:** " + rr.count + "\n" + message.drakeWS("administration/reaction-roles:ROLE") + ": <@&" + rr.role + ">").join("\n") : 
                                    message.drakeWS("administration/autorole:NO_AUTOROLES", {
                                        prefix: data.guild.prefix
                            }))}`);

                        await afterHelp(m, embed5, [addButton, removeButton, listButton]);
                        break;
                    case removeButton.customId:
                        const embed6 = new MessageEmbed()
                        .setTitle(message.drakeWS("administration/autorole:REMOVE_AUTOROLE"))
                        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic:true }))
                        .setFooter(client.cfg.footer)
                        .setColor(client.cfg.color.purple)
                        .setDescription(message.drakeWS("administration/autorole:INSTRUCTIONS_REMOVE", {
                            emoji: "clear"
                        }));
        
                        // Début Suppression
                        await m.edit({
                            embeds: [embed6]
                        });
            
                        const collected1 = await message.channel.awaitMessages(opt);
                        if(!collected1 || !collected1.first()) return badInput(null, message.drakeWS("administration/reaction-roles:NOT_VALID", { emoji: "error" }));
                        
                        const confMessage1 = collected1.first().content;
                        if(confMessage1 == "cancel") return badInput(collected1.first(), message.drakeWS("administration/reaction-roles:NOT_VALID", { emoji: "error" }));
            
                        const IDofReact = confMessage1;
            
                        if(!IDofReact || isNaN(IDofReact) || !data.guild.plugins.autorole.filter((rr) => rr.count === parseInt(IDofReact))) return badInput(collected1.first(), message.drakeWS("administration/autorole:ID_NOT_EXIST", { 
                            emoji: "error",
                            id: confMessage1
                        }));
            
                        collected1.first().delete().catch(() => {});
            
                        const newEmbed1 = new MessageEmbed()
                            .setTitle(client.emotes["succes"])
                            .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic:true }))
                            .setFooter(client.cfg.footer)
                            .setColor(client.cfg.color.purple)
                            .setDescription(message.drakeWS("administration/autorole:FINISH_REMOVE", {
                                id: confMessage1
                            }));
            
                        data.guild.plugins.autorole = data.guild.plugins.autorole.filter((rr) => rr.count !== parseInt(IDofReact));
            
                        await data.guild.save();
                        await afterHelp(m, newEmbed1, [addButton, removeButton, listButton]);
                        break;
                    default:
                        client.emit("error", "Default case in autorole.js");
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

            async function badInput(question, reason) {
                const errorEmbed = new MessageEmbed()
                    .setColor("#D54052")
                    .setDescription(`${reason}`);
    
                let errorMessage = await message.channel.send({
                    embeds: [errorEmbed]
                });
    
                setTimeout(() => {
                    errorMessage.delete().catch(() => {})
                    m.delete().catch(() => {});
                }, 5000);
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
                            .setDescription(message.drakeWS("administration/autorole:INSTRUCTIONS"))
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
        });
    };

    async runInteraction(interaction, data) {

        if(!data.guild.plugins.autorole || !Array.isArray(data.guild.plugins.autorole)) data.guild.plugins.autorole = [];
        if(!data.guild.autoroles) data.guild.autoroles = 0;
        
        const client = this.client;

        const embed = new MessageEmbed()
            .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({format: 'png', dynamic: true, size: 1024}))
            .setColor("BLUE")
            .setDescription(interaction.drakeWS("administration/autorole:INSTRUCTIONS"))
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
                            .setTitle(interaction.drakeWS("administration/autorole:ADD_AUTOROLE", {
                                step: "1"
                            }))
                            .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic:true }))
                            .setFooter(client.cfg.footer)
                            .setColor(client.cfg.color.blue)
                            .setDescription(interaction.drakeWS("administration/autorole:INSTRUCTIONS_ADD", {
                                emoji: "channel"
                            }));
            
                        interaction.editReply({
                            embeds: [embed1],
                            components: []
                        });
            
                        const collected = await interaction.channel.awaitMessages(opt);
                        if(!collected || !collected.first()) return badInput(null, interaction.drakeWS("administration/reaction-roles:NOT_VALID", { emoji: "error" }));
            
                        const confMessage = collected.first().content;
                        if(confMessage == "cancel") return badInput(collected.first(), interaction.drakeWS("administration/reaction-roles:NOT_VALID", { emoji: "error" }));
            
                        const roleR = interaction.guild.roles.cache.get(confMessage) || collected.first().mentions.roles.first();
            
                        if(!roleR) return badInput(collected.first(), interaction.drakeWS("administration/reaction-roles:ROLE_NOT_FOUND", { emoji: "error", role: confMessage }));
                        if(roleR.position >= interaction.guild.members.cache.get(client.user.id).roles.highest.position) return badInput(collected.first(), interaction.drakeWS("administration/reaction-roles:ROLE_TO_HIGHT", { emoji: "error", role: roleR}));

                        collected.first().delete().catch(() => {});
    
                        const newEmbed = new MessageEmbed()
                            .setTitle(client.emotes["succes"])
                            .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic:true }))
                            .setFooter(client.cfg.footer)
                            .setColor(client.cfg.color.blue)
                            .setDescription(interaction.drakeWS("administration/autorole:FINISH_ADD", {
                                role: roleR.id,
                            }));
                        
                        data.guild.autoroles++;
                        data.guild.plugins.autorole.push({
                            role: roleR.id,
                            count: data.guild.autoroles
                        });
            
                        await data.guild.save();
                        await afterHelp(m, newEmbed, [addButton, removeButton, listButton]);
                        break;
                    case listButton.customId:

                        const embed5 = new MessageEmbed()
                            .setTitle(interaction.drakeWS("administration/autorole:LIST_REACTION"))
                            .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic:true }))
                            .setFooter(client.cfg.footer)
                            .setColor(client.cfg.color.orange)
                            .setDescription(`${(data.guild.plugins.autorole.length !== 0 ? 
                                data.guild.plugins.autorole.map((rr) => "**ID:** " + rr.count + "\n" + interaction.drakeWS("administration/reaction-roles:ROLE") + ": <@&" + rr.role + ">").join("\n") : 
                                interaction.drakeWS("administration/autorole:NO_AUTOROLES", {
                                        prefix: data.guild.prefix
                            }))}`);

                        await afterHelp(m, embed5, [addButton, removeButton, listButton]);
                        break;
                    case removeButton.customId:
                        const embed6 = new MessageEmbed()
                        .setTitle(interaction.drakeWS("administration/autorole:REMOVE_AUTOROLE"))
                        .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic:true }))
                        .setFooter(client.cfg.footer)
                        .setColor(client.cfg.color.purple)
                        .setDescription(interaction.drakeWS("administration/autorole:INSTRUCTIONS_REMOVE", {
                            emoji: "clear"
                        }));
        
                        // Début Suppression
                        await interaction.editReply({
                            embeds: [embed6]
                        });
            
                        const collected1 = await interaction.channel.awaitMessages(opt);
                        if(!collected1 || !collected1.first()) return badInput(null, interaction.drakeWS("administration/reaction-roles:NOT_VALID", { emoji: "error" }));
                        
                        const confMessage1 = collected1.first().content;
                        if(confMessage1 == "cancel") return badInput(collected1.first(), interaction.drakeWS("administration/reaction-roles:NOT_VALID", { emoji: "error" }));
            
                        const IDofReact = confMessage1;
            
                        if(!IDofReact || isNaN(IDofReact) || !data.guild.plugins.autorole.filter((rr) => rr.count === parseInt(IDofReact))) return badInput(collected1.first(), message.drakeWS("administration/autorole:ID_NOT_EXIST", { 
                            emoji: "error",
                            id: confMessage1
                        }));
            
                        collected1.first().delete().catch(() => {});
            
                        const newEmbed1 = new MessageEmbed()
                            .setTitle(client.emotes["succes"])
                            .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic:true }))
                            .setFooter(client.cfg.footer)
                            .setColor(client.cfg.color.purple)
                            .setDescription(interaction.drakeWS("administration/autorole:FINISH_REMOVE", {
                                id: confMessage1
                            }));
            
                        data.guild.plugins.autorole = data.guild.plugins.autorole.filter((rr) => rr.count !== parseInt(IDofReact));
            
                        await data.guild.save();
                        await afterHelp(m, newEmbed1, [addButton, removeButton, listButton]);
                        break;
                    default:
                        client.emit("error", "Default case in autorole.js");
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

            async function badInput(question, reason) {
                const errorEmbed = new MessageEmbed()
                    .setColor("#D54052")
                    .setDescription(`${reason}`);
    
                let errorMessage = await interaction.channel.send({
                    embeds: [errorEmbed]
                });
    
                setTimeout(() => {
                    errorMessage.delete().catch(() => {})
                    interaction.deleteReply().catch(() => {});
                }, 5000);
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
                            .setDescription(interaction.drakeWS("administration/autorole:INSTRUCTIONS"))
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
        });
    };
};

module.exports = Autorole;