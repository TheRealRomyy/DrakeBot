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
            restriction: []
        });
    };

    async run(message, args, data) {

        const opt = { max: 1, time: 120000, errors: [ "time" ] };
        const filter = (m) => m.author.id === message.author.id;

        let cmdName = null;
        let cmdResponse = null;

        const msg = await message.channel.send(message.drakeWS("administration/custom-commands:MENU", {
            emoji: "write"
        }));

        let collected = await message.channel.awaitMessages(filter, opt).catch(() => {});

        if(!collected || !collected.first()) {
            msg.delete();
            return message.delete().catch(() => {})
        }
	
		let confMessage = collected.first().content;
	
		if(confMessage === "cancel") {
            msg.delete();
            return message.delete().catch(() => {})
        }
	
		collected.first().delete();
        msg.delete();

        if(!data.guild.customCommands) {
            data.guild.customCommands = [];
            await data.guild.save();
        }
        
        switch(confMessage) {
            case "list":
                const embed = new MessageEmbed()
                .setTitle(message.drakeWS("administration/custom-commands:LIST_TITLE"))
                .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic:true }))
                .setFooter(this.client.cfg.footer)
                .setColor(this.client.cfg.color.orange)
                .setDescription((data.guild.customcommands.length !== 0 ? 
                    data.guild.customcommands.map((c) => "``" + data.guild.prefix + c.name + "``: **" + c.response + "**") : 
                    message.drakeWS("administration/custom-commands:NO_COMMANDS", { 
                            prefix: data.guild.prefix
                    })));
                return message.channel.send(embed);
            case "create":

                // Name of the command
                const mess = await message.channel.send(message.drakeWS("administration/custom-commands:MENU_CREATE", {
                    emoji: "write"
                }));
        
                collected = await message.channel.awaitMessages(filter, opt).catch(() => {});
        
                if(!collected || !collected.first()) {
                    mess.delete();
                    return message.delete().catch(() => {})
                }
            
                confMessage = collected.first().content;
            
                if(confMessage === "cancel") {
                    mess.delete();
                    return message.delete().catch(() => {})
                } else {
                    cmdName = confMessage.toLowerCase();
                    if(this.client.cmds.get(cmdName) || data.guild.customCommands.find((c) => c.name === cmdName) || this.client.aliases.get(cmdName)) return message.drake("administration/custom-commands:ALREADY_EXIST", {
                        emoji: "error",
                        cmd: data.guild.prefix + cmdName
                    });
                };
            
                collected.first().delete();
                mess.delete();

                // Responde of the command
                const mess2 = await message.channel.send(message.drakeWS("administration/custom-commands:MENU_CREATE_2", {
                    emoji: "write"
                }));
        
                collected = await message.channel.awaitMessages(filter, opt).catch(() => {});
        
                if(!collected || !collected.first()) {
                    mess2.delete();
                    return message.delete().catch(() => {})
                }
            
                confMessage = collected.first().content;
            
                if(confMessage === "cancel") {
                    mess2.delete();
                    return message.delete().catch(() => {})
                } else {
                    cmdResponse = confMessage;
                };
            
                collected.first().delete();
                mess2.delete();

                const caseInfo = {
                    name: cmdName,
                    response: cmdResponse
                };

                data.guild.customcommands.push(caseInfo);
                await data.guild.save();

                return message.drake("administration/custom-commands:SUCCES_CREATE", {
                    emoji: "succes",
                    cmd: data.guild.prefix + cmdName,
                    response: cmdResponse
                });
            case "remove":
                // Name of the command
                const msage = await message.channel.send(message.drakeWS("administration/custom-commands:MENU_DELETE", {
                    emoji: "write"
                }));
        
                collected = await message.channel.awaitMessages(filter, opt).catch(() => {});
        
                if(!collected || !collected.first()) {
                    msge.delete();
                    return message.delete().catch(() => {})
                }
            
                confMessage = collected.first().content;
            
                if(confMessage === "cancel") {
                    msage.delete();
                    return message.delete().catch(() => {})
                } else {
                    cmdName = confMessage.toLowerCase();
                    if(!data.guild.customCommands.find((c) => c.name === cmdName)) return message.drake("administration/custom-commands:UNKNOWN_COMMAND", {
                        emoji: "error",
                        cmd: cmdName
                    });
                };
            
                collected.first().delete();
                msage.delete();

                data.guild.customcommands = data.guild.customcommands.filter((c) => c.name !== cmdName);
                await data.guild.save();
                return message.drake("administration/custom-commands:SUCCES_DELETE", {
                    cmd: data.guild.prefix + cmdName,
                    emoji: "succes"
                });
            default:
                return message.drake("administration/custom-commands:SWITCH_DEFAULT", {
                    emoji: "error"
            });
        };
    };
};

module.exports = CustomCommands;