const Command = require("../../structure/Commands");
const { MessageEmbed } = require("discord.js");

class CustomCommands extends Command {

    constructor(client) {
        super(client, {
            name: "custom-commands",
            aliases: [ "cc", "custom-commands", "custom" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "SEND_MESSAGES", "EMBED_LINKS" ],
            userPerms: [ "MANAGE_GUILD" ],
            cooldown: 5,
            restriction: [],

            slashCommandOptions: {
                description: "Manage custom commands of this server"
            }
        });
    };

    async run(message, args, data) {

        if(!data.guild.customcommands) data.guild.customcommands = [];

        const opt = { 
            filter: (m) => m.author.id === message.author.id,
            max: 1, 
            time: 120000, 
            errors: [ "time" ] 
        };

        let cmdName = null;
        let cmdResponse = null;

        const msg = await message.channel.send({
            content: message.drakeWS("administration/custom-commands:MENU", {
                emoji: "write"
            })
        });

        let collected = await message.channel.awaitMessages(opt);

        if(!collected || !collected.first()) {
            msg.delete().catch(() => {});
            return message.delete().catch(() => {})
        };
	
		let confMessage = collected.first().content;
	
		if(confMessage === "cancel") {
            msg.delete().catch(() => {});
            return message.delete().catch(() => {})
        }
	
		collected.first().delete();
        msg.delete().catch(() => {});

        switch(confMessage) {
            case "list":
                const embed = new MessageEmbed()
                    .setTitle(message.drakeWS("administration/custom-commands:LIST_TITLE"))
                    .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic:true }))
                    .setFooter(this.client.cfg.footer)
                    .setColor(this.client.cfg.color.orange)
                    .setDescription(`${(data.guild.customcommands.length !== 0 ? 
                        data.guild.customcommands.map((c) => "`" + data.guild.prefix + c.name + "` => **" + c.response + "**").join("\n") : 
                        message.drakeWS("administration/custom-commands:NO_COMMANDS", { 
                                prefix: data.guild.prefix
                        }))}`);

                message.channel.send({
                    embeds: [embed]
                });
                break;
            case "create":

                // Name of the command
                const mess = await message.channel.send({
                    content: message.drakeWS("administration/custom-commands:MENU_CREATE", {
                        emoji: "write"
                    })
                });
        
                collected = await message.channel.awaitMessages(opt);
        
                if(!collected || !collected.first()) {
                    mess.delete().catch(() => {});
                    return message.delete().catch(() => {})
                };
            
                confMessage = collected.first().content;
            
                if(confMessage === "cancel") {
                    mess.delete().catch(() => {});
                    return message.delete().catch(() => {})
                } else {
                    cmdName = confMessage.toLowerCase();
                    if(this.client.cmds.get(cmdName) || data.guild.customcommands.find((c) => c.name === cmdName) || this.client.aliases.get(cmdName)) return message.drake("administration/custom-commands:ALREADY_EXIST", {
                        emoji: "error",
                        cmd: data.guild.prefix + cmdName
                    });
                };
            
                collected.first().delete();
                mess.delete().catch(() => {});

                // Responde of the command
                const mess2 = await message.channel.send({
                    content: message.drakeWS("administration/custom-commands:MENU_CREATE_2", {
                        emoji: "write"
                    })
                });
        
                collected = await message.channel.awaitMessages(opt);
        
                if(!collected || !collected.first()) {
                    mess2.delete().catch(() => {});
                    return message.delete().catch(() => {})
                };
            
                confMessage = collected.first().content;
            
                if(confMessage === "cancel") {
                    mess2.delete().catch(() => {});
                    return message.delete().catch(() => {})
                } else {
                    cmdResponse = confMessage;
                };
            
                collected.first().delete();
                mess2.delete().catch(() => {});

                const caseInfo = {
                    name: cmdName,
                    response: cmdResponse
                };

                data.guild.customcommands.push(caseInfo);
                await data.guild.save();

                message.drake("administration/custom-commands:SUCCES_CREATE", {
                    emoji: "succes",
                    cmd: data.guild.prefix + cmdName,
                    response: cmdResponse
                });
                break;
            case "remove":
                // Name of the command
                const msge = await message.channel.send({
                    content: message.drakeWS("administration/custom-commands:MENU_DELETE", {
                        emoji: "write"
                    })
                });
        
                collected = await message.channel.awaitMessages(opt);
        
                if(!collected || !collected.first()) {
                    msge.delete().catch(() => {});
                    return message.delete().catch(() => {})
                };
            
                confMessage = collected.first().content;
            
                if(confMessage === "cancel") {
                    msge.delete().catch(() => {});
                    return message.delete().catch(() => {})
                } else {
                    cmdName = confMessage.toLowerCase();
                    if(!data.guild.customcommands.find((c) => c.name === cmdName)) return message.drake("administration/custom-commands:UNKNOWN_COMMAND", {
                        emoji: "error",
                        cmd: cmdName
                    });
                };
            
                collected.first().delete();
                msge.delete().catch(() => {});

                data.guild.customcommands = data.guild.customcommands.filter((c) => c.name !== cmdName);
                await data.guild.save();
                message.drake("administration/custom-commands:SUCCES_DELETE", {
                    cmd: data.guild.prefix + cmdName,
                    emoji: "succes"
                });
                break;
            default:
                return message.drake("administration/custom-commands:SWITCH_DEFAULT", {
                    emoji: "error"
            });
        };
    };

    async runInteraction(interaction, data) {

        if(!data.guild.customcommands) data.guild.customcommands = [];

        const opt = { 
            filter: (m) => m.author.id === interaction.user.id,
            max: 1, 
            time: 120000, 
            errors: [ "time" ] 
        };

        let cmdName = null;
        let cmdResponse = null;

        await interaction.reply({
            content: interaction.drakeWS("administration/custom-commands:MENU", {
                emoji: "write"
            })
        });

        let collected = await interaction.channel.awaitMessages(opt);

        if(!collected || !collected.first()) return await interaction.deleteReply();
	
		let confMessage = collected.first().content;

        collected.first().delete();
	
		if(confMessage === "cancel") return await interaction.deleteReply();

        switch(confMessage) {
            case "list":
                const embed = new MessageEmbed()
                    .setTitle(interaction.drakeWS("administration/custom-commands:LIST_TITLE"))
                    .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic:true }))
                    .setFooter(this.client.cfg.footer)
                    .setColor(this.client.cfg.color.orange)
                    .setDescription(`${(data.guild.customcommands.length !== 0 ? 
                        data.guild.customcommands.map((c) => "`" + data.guild.prefix + c.name + "` => **" + c.response + "**").join("\n") : 
                        interaction.drakeWS("administration/custom-commands:NO_COMMANDS", { 
                                prefix: data.guild.prefix
                        }))}`);

                interaction.editReply({
                    embeds: [embed],
                    content: null
                });
                break;
            case "create":

                // Name of the command
                await interaction.editReply({
                    content: interaction.drakeWS("administration/custom-commands:MENU_CREATE", {
                        emoji: "write"
                    })
                });
        
                collected = await interaction.channel.awaitMessages(opt);
        
                if(!collected || !collected.first()) return await interaction.deleteReply();
            
                confMessage = collected.first().content;
            
                if(confMessage === "cancel") {
                    return await interaction.deleteReply();
                } else {
                    cmdName = confMessage.toLowerCase();
                    if(this.client.cmds.get(cmdName) || data.guild.customcommands.find((c) => c.name === cmdName) || this.client.aliases.get(cmdName)) return interaction.editReply({
                        content: interaction.drakeWS("administration/custom-commands:ALREADY_EXIST", {
                            emoji: "error",
                            cmd: data.guild.prefix + cmdName
                        }),
                        ephemeral: true
                    });
                };
            
                collected.first().delete();

                // Responde of the command
                await interaction.editReply({
                    content: interaction.drakeWS("administration/custom-commands:MENU_CREATE_2", {
                        emoji: "write"
                    })
                });
        
                collected = await interaction.channel.awaitMessages(opt);
        
                if(!collected || !collected.first()) return await interaction.deleteReply();
            
                confMessage = collected.first().content;
                collected.first().delete().catch(() => {});
            
                if(confMessage === "cancel") {
                    return await interaction.deleteReply();
                } else {
                    cmdResponse = confMessage;
                };

                const caseInfo = {
                    name: cmdName,
                    response: cmdResponse
                };

                data.guild.customcommands.push(caseInfo);
                await data.guild.save();

                interaction.editReply({
                    content: interaction.drakeWS("administration/custom-commands:SUCCES_CREATE", {
                        emoji: "succes",
                        cmd: data.guild.prefix + cmdName,
                        response: cmdResponse
                    })
                });
                break;
            case "remove":
                // Name of the command
                await interaction.editReply({
                    content: interaction.drakeWS("administration/custom-commands:MENU_DELETE", {
                        emoji: "write"
                    })
                });
        
                collected = await interaction.channel.awaitMessages(opt);
        
                if(!collected || !collected.first()) return await interaction.deleteReply();
            
                confMessage = collected.first().content;
                collected.first().delete().catch(() => {});
            
                if(confMessage === "cancel") {
                    return await interaction.deleteReply();
                } else {
                    cmdName = confMessage.toLowerCase();
                    if(!data.guild.customcommands.find((c) => c.name === cmdName)) return interaction.editReply({
                        content: interaction.drakeWS("administration/custom-commands:UNKNOWN_COMMAND", {
                            emoji: "error",
                            cmd: cmdName
                        }),
                        ephemeral: true
                    });
                };

                data.guild.customcommands = data.guild.customcommands.filter((c) => c.name !== cmdName);
                await data.guild.save();
                interaction.editReply({
                    content: interaction.drakeWS("administration/custom-commands:SUCCES_DELETE", {
                        cmd: data.guild.prefix + cmdName,
                        emoji: "succes"
                    })
                });
                break;
            default:
                interaction.editReply({
                    content: interaction.drakeWS("administration/custom-commands:SWITCH_DEFAULT", {
                        emoji: "error"
                    })
                });
                break;
        };
    };
};

module.exports = CustomCommands;