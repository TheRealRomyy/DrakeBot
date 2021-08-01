const Command = require("../../structure/Commands");
const { MessageEmbed, Constants: { ApplicationCommandOptionTypes } } = require("discord.js");

class Help extends Command {

    constructor (client) {
        super(client, {
            name: "help",
            aliases: [ "aide", ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "EMBED_LINKS", "SEND_MESSAGES" ],
            userPerms: [],
            cooldown: 3,
            restriction: [],

            slashCommandOptions: {
                description: "Get the list of DrakeBot's command",
                options: [
                    {
                        name: "command",
                        type: ApplicationCommandOptionTypes.STRING,
                        required: false,
                        description: "If you want to get more info about a command (default is command list)"
                    }
                ]
            }
        });
    };

    async run (message, args, data) {

        const client = this.client;

        if(args[0]) {

            const cmdName = args[0].toLowerCase();
            const cmd = client.cmds.get(cmdName) || client.cmds.get(client.aliases.get(cmdName));

            if(!cmd ) return message.channel.send({
                content: message.drakeWS("general/help:CMD_NOT_FOUND", {
                    cmd: cmdName,
                    emoji: "error"
                }),
                allowedMentions: { "users": []}
            });

            const usage = message.drakeWS(cmd.help.category.toLowerCase() + "/" + cmd.help.name + ":USAGE") !== "USAGE" ? data.guild.prefix + message.drakeWS(cmd.help.category.toLowerCase() + "/" + cmd.help.name + ":USAGE") : "`No usage provided`";
            const example = message.drakeWS(cmd.help.category.toLowerCase() + "/" + cmd.help.name + ":EXAMPLE") !== "EXAMPLE" ? data.guild.prefix + message.drakeWS(cmd.help.category.toLowerCase() + "/" + cmd.help.name + ":EXAMPLE") : "`No example provided`";
            const description = message.drakeWS(cmd.help.category.toLowerCase() + "/" + cmd.help.name + ":DESCRIPTION") !== "DESCRIPTION" ? message.drakeWS(cmd.help.category.toLowerCase() + "/" + cmd.help.name + ":DESCRIPTION") : "`No description provided`";
            const aliases = cmd.help.aliases != "" ? (cmd.help.aliases.lenght === 1 ? "``" + cmd.help.aliases[0] + "``" : cmd.help.aliases.map(a => "`" + a + "`").join(", ")) : message.drakeWS("common:ANY");
            let perms = cmd.settings.userPerms != "" ? (cmd.settings.userPerms.lenght === 1 ? "``" + message.drakeWS(`discord_errors:${cmd.settings.userPerms[0]}`) : cmd.settings.userPerms.map(a => "`" + message.drakeWS(`discord_errors:${a}`) + "`").join(", ")) : message.drakeWS("common:ANY(E)");
            
            if(cmd.settings.restriction && cmd.settings.restriction.includes("MODERATOR")) perms = "`" + message.drakeWS("discord_errors:BOT_MODERATOR") + "`";
            if(cmd.settings.restriction && cmd.settings.restriction.includes("OWNER")) perms = "`" + message.drakeWS("discord_errors:BOT_OWNER") + "`";

            const embed = new MessageEmbed()
            .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic:true }))
            .setTitle(client.emotes["label"] + " " + cmd.help.name)
            .setFooter(client.cfg.footer)
            .setColor("RANDOM")
            .addField(message.drakeWS("common:DESCRIPTION", {
				emoji: "page"
			}), description, false)
			.addField(message.drakeWS("common:USAGE", {
				emoji: "pencil"
            }), usage, true)
            .addField(message.drakeWS("general/help:ALIASES", {
                emoji: "book"
            }), aliases, true)
            .addField(message.drakeWS("common:EXAMPLE", {
				emoji: "bookmark"
			}), example, true)
			.addField(message.drakeWS("common:PERMS", {
				emoji: "pushpin"
			}), perms, true);

            message.channel.send({
                embeds: [embed]
            });
        } else {
            
            let fcount = 0;
            const embed = new MessageEmbed()
            .setAuthor(message.author.username, message.author.displayAvatarURL({format: 'png', dynamic: true, size: 1024}))
            .setColor("RANDOM")
            .setTitle(message.drakeWS("general/help:TITLE"))
            .setFooter(client.cfg.footer)
            .setThumbnail(client.user.displayAvatarURL({format: 'png', dynamic: true, size: 1024}))
            
            const categories = [];
            const commands = client.cmds;
        
            commands.forEach((command) => {
                if(command.help.class != "Owner") fcount++;
                if(categories.includes(command.help.category)) return;
                if(command.help.class == "Owner") {
                    if(client.cfg.owners.id.includes(message.author.id)) categories.push(command.help.class);
                    else return;
                } else categories.push(command.help.category);
            });
            
            categories.sort().forEach((cat) => {
                const tCommands = commands.filter((cmd) => cmd.help.category === cat);
                embed.addField(client.emotes.categories[cat.toLowerCase()]+"  "+cat+" - ("+tCommands.size+")", tCommands.map((cmd) => "`" + data.guild.prefix + cmd.help.name + "`").join(", "));
            });
        
            embed.setDescription(message.drakeWS("general/help:commandsCount", {
                commandCount: fcount
            }) + "\n" + message.drakeWS("general/help:prefix", {
                prefix: data.guild.prefix
            }) + "\n" + message.drakeWS("general/help:members", {
                members: message.guild.memberCount
            })+ "\n" + message.drakeWS("general/help:commandHelp", {
                prefix: data.guild.prefix
            })+ "\n" + message.drakeWS("general/help:commandHelpExample", {
                prefix: data.guild.prefix
            }))
        
            return message.channel.send({
                embeds: [embed]
            })
        }
    };

    async runInteraction (interaction, data) {

        const client = this.client;

        if(interaction.options.getString("command")) {

            const cmdName = interaction.options.getString("command").toLowerCase();
            const cmd = client.cmds.get(cmdName) || client.cmds.get(client.aliases.get(cmdName));

            if(!cmd ) return interaction.reply({
                content: interaction.drakeWS("general/help:CMD_NOT_FOUND", {
                    cmd: cmdName,
                    emoji: "error"
                }),
                allowedMentions: { "users": []},
                ephemeral: true
            });

            const usage = interaction.drakeWS(cmd.help.category.toLowerCase() + "/" + cmd.help.name + ":USAGE") !== "USAGE" ? data.guild.prefix + interaction.drakeWS(cmd.help.category.toLowerCase() + "/" + cmd.help.name + ":USAGE") : "`No usage provided`";
            const example = interaction.drakeWS(cmd.help.category.toLowerCase() + "/" + cmd.help.name + ":EXAMPLE") !== "EXAMPLE" ? data.guild.prefix + interaction.drakeWS(cmd.help.category.toLowerCase() + "/" + cmd.help.name + ":EXAMPLE") : "`No example provided`";
            const description = interaction.drakeWS(cmd.help.category.toLowerCase() + "/" + cmd.help.name + ":DESCRIPTION") !== "DESCRIPTION" ? interaction.drakeWS(cmd.help.category.toLowerCase() + "/" + cmd.help.name + ":DESCRIPTION") : "`No description provided`";
            const aliases = cmd.help.aliases != "" ? (cmd.help.aliases.lenght === 1 ? "``" + cmd.help.aliases[0] + "``" : cmd.help.aliases.map(a => "`" + a + "`").join(", ")) : interaction.drakeWS("common:ANY");
            let perms = cmd.settings.userPerms != "" ? (cmd.settings.userPerms.lenght === 1 ? "``" + interaction.drakeWS(`discord_errors:${cmd.settings.userPerms[0]}`) : cmd.settings.userPerms.map(a => "`" + interaction.drakeWS(`discord_errors:${a}`) + "`").join(", ")) : interaction.drakeWS("common:ANY(E)");
            
            if(cmd.settings.restriction && cmd.settings.restriction.includes("MODERATOR")) perms = "`" + interaction.drakeWS("discord_errors:BOT_MODERATOR") + "`";
            if(cmd.settings.restriction && cmd.settings.restriction.includes("OWNER")) perms = "`" + interaction.drakeWS("discord_errors:BOT_OWNER") + "`";

            const embed = new MessageEmbed()
            .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic:true }))
            .setTitle(client.emotes["label"] + " " + cmd.help.name)
            .setFooter(client.cfg.footer)
            .setColor("RANDOM")
            .addField(interaction.drakeWS("common:DESCRIPTION", {
				emoji: "page"
			}), description, false)
			.addField(interaction.drakeWS("common:USAGE", {
				emoji: "pencil"
            }), usage, true)
            .addField(interaction.drakeWS("general/help:ALIASES", {
                emoji: "book"
            }), aliases, true)
            .addField(interaction.drakeWS("common:EXAMPLE", {
				emoji: "bookmark"
			}), example, true)
			.addField(interaction.drakeWS("common:PERMS", {
				emoji: "pushpin"
			}), perms, true);

            interaction.reply({
                embeds: [embed]
            });
        } else {
            
            let fcount = 0;
            const embed = new MessageEmbed()
            .setAuthor(interaction.user.username, interaction.user.displayAvatarURL({format: 'png', dynamic: true, size: 1024}))
            .setColor("RANDOM")
            .setTitle(interaction.drakeWS("general/help:TITLE"))
            .setFooter(client.cfg.footer)
            .setThumbnail(client.user.displayAvatarURL({format: 'png', dynamic: true, size: 1024}))
            
            const categories = [];
            const commands = client.cmds;
        
            commands.forEach((command) => {
                if(command.help.class != "Owner") fcount++;
                if(categories.includes(command.help.category)) return;
                if(command.help.class == "Owner") {
                    if(client.cfg.owners.id.includes(interaction.user.id)) categories.push(command.help.class);
                    else return;
                } else categories.push(command.help.category);
            });
            
            categories.sort().forEach((cat) => {
                const tCommands = commands.filter((cmd) => cmd.help.category === cat);
                embed.addField(client.emotes.categories[cat.toLowerCase()]+"  "+cat+" - ("+tCommands.size+")", tCommands.map((cmd) => "`" + data.guild.prefix + cmd.help.name + "`").join(", "));
            });
        
            embed.setDescription(interaction.drakeWS("general/help:commandsCount", {
                commandCount: fcount
            }) + "\n" + interaction.drakeWS("general/help:prefix", {
                prefix: data.guild.prefix
            }) + "\n" + interaction.drakeWS("general/help:members", {
                members: interaction.guild.memberCount
            })+ "\n" + interaction.drakeWS("general/help:commandHelp", {
                prefix: data.guild.prefix
            })+ "\n" + interaction.drakeWS("general/help:commandHelpExample", {
                prefix: data.guild.prefix
            }))
        
            return interaction.reply({
                embeds: [embed]
            })
        }
    };
};

module.exports = Help;