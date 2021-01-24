const Command = require("../../structure/Commands");
const { MessageEmbed } = require("discord.js");

class Help extends Command {

    constructor (client) {
        super(client, {
            name: "help",
            aliases: [ "h", "aide", "a" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "EMBED_LINKS", "SEND_MESSAGES" ],
            userPerms: [],
            cooldown: 3,
            restriction: [],
        });
    };

    async run (message, args, data) {

        const client = this.client;

        let msg = null;
        let returnHome = null;
        let count = 0;
        
        const staff = client.cfg.staff.support.includes(message.author.id) || client.cfg.staff.owner.includes(message.author.id);

        async function long() {

            const commands = client.cmds;

            commands.forEach((command) => {
                if(command.help.category != "Owner" && command.help.category != "Staff & Support") count++;
            });

            const filter = (reaction, user) => {
                return ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '👾', '↩️'].includes(reaction.emoji.name) && user.id === message.author.id;
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

            async function displayCatCommands(cat) {

                const embed = new MessageEmbed()
                .setAuthor(message.author.username, message.author.displayAvatarURL({format: 'png', dynamic: true, size: 1024}))
                .setColor("RANDOM")
                .setTitle(message.drakeWS("general/help:" + cat.toUpperCase()))
                .setFooter(message.drakeWS("general/help:FOOTER"))
                .setThumbnail(message.drakeWS("general/help:" + cat.toUpperCase() + "_IMG"))
                .setDescription(message.drakeWS("general/help:commandsCount", {
                    commandCount: count
                }) + "\n" + message.drakeWS("general/help:prefix", {
                    prefix: data.guild.prefix
                }) + "\n" + message.drakeWS("general/help:members", {
                    members: message.guild.memberCount
                })+ "\n" + message.drakeWS("general/help:commandHelp", {
                    prefix: data.guild.prefix
                })+ "\n" + message.drakeWS("general/help:commandHelpExample", {
                    prefix: data.guild.prefix
                }));

                if(cat == "Custom" && data.guild.customCommands.length > 0){
                    embed.addField(client.emotes.categories[cat.toLowerCase()]+" "+cat+" - ("+data.guild.customCommands.length+")", "> " + data.guild.customCommands.map((cmd) => "``" + cmd.name + "``" + ": " + message.drakeWS("general/help:CUSTOM")).join("\n> "));
                }
                
                if(cat !== "Custom") {
                    const tCommands = commands.filter((cmd) => cmd.help.category === cat);
                    embed.addField(client.emotes.categories[cat.toLowerCase()]+"  "+cat+" - ("+tCommands.size+")", "> " + tCommands.map((cmd) => "``" + data.guild.prefix + cmd.help.name + "``" + ": " + message.drakeWS(cat.toLowerCase() + "/" + cmd.help.name + ":DESCRIPTION")).join("\n> "));
                }

                return msg.edit(embed);
            }

            async function displayMain(msg) {

                let desc_to_role = null;

                if(staff) {
                    desc_to_role = message.drakeWS("general/help:DESC_STAFF")
                } else {
                    desc_to_role = message.drakeWS("general/help:DESC")
                }

                const embed = new MessageEmbed()
                .setAuthor(message.author.username, message.author.displayAvatarURL({format: 'png', dynamic: true, size: 1024}))
                .setColor("RANDOM")
                .setTitle(message.drakeWS("general/help:TITLE"))
                .setFooter(client.cfg.footer)
                .setDescription(message.drakeWS("general/help:commandsCount", {
                    commandCount: count
                }) + "\n" + message.drakeWS("general/help:prefix", {
                    prefix: data.guild.prefix
                }) + "\n" + message.drakeWS("general/help:members", {
                    members: message.guild.memberCount
                })+ "\n" + message.drakeWS("general/help:commandHelp", {
                    prefix: data.guild.prefix
                })+ "\n" + message.drakeWS("general/help:commandHelpExample", {
                    prefix: data.guild.prefix
                }) + "\n \n" + desc_to_role)

                return msg.edit(embed);
            }

            async function wait(first) {

                const embed = new MessageEmbed()
                .setAuthor(message.author.username, message.author.displayAvatarURL({format: 'png', dynamic: true, size: 1024}))
                .setColor("RANDOM")
                .setTitle(message.drakeWS("general/help:TITLE"))
                .setFooter(client.cfg.footer)
                .setDescription(message.drakeWS("misc:PLEASE_WAIT", {
                    emoji: "waiting"
                }));

                if(first) return message.channel.send(embed);
                return msg.edit(embed);
            }

            async function start(first) {

                if(first) msg = await wait(true);
                if(first == false) msg = await wait(false);

                await msg.react('1️⃣');
                await msg.react('2️⃣');
                await msg.react('3️⃣');
                await msg.react('4️⃣');
                await msg.react('5️⃣');
                await msg.react('6️⃣');
                if(staff) await msg.react('7️⃣');
                await msg.react('👾');

                msg = await displayMain(msg);

                const catToView = await WaitForReaction(msg);
                if(first) return catToView;
                await switchCTV(catToView);

            }

            async function afterHelp() {
                await msg.reactions.removeAll()
                await msg.react('↩️')
                returnHome = await WaitForReaction(msg);
                if(returnHome == '↩️') {
                    await msg.reactions.removeAll()
                    await start(false);
                }
            }

            async function switchCTV(ctv) {
                switch(ctv) {
                    
                    case '1️⃣':
                        msg = await displayCatCommands("Administration");
                        afterHelp();
                        break;
                    case '2️⃣':
                        msg = await displayCatCommands("Moderation");
                        afterHelp();
                        break;
                    case '3️⃣':
                        msg = await displayCatCommands("General");
                        afterHelp();
                        break;
                    case '4️⃣':
                        msg = await displayCatCommands("Economy");
                        afterHelp();
                        break;
                    case '5️⃣':
                        msg = await displayCatCommands("Social");
                        afterHelp();
                        break;
                    case '6️⃣':
                        msg = await displayCatCommands("Level");
                        afterHelp();
                        break;
                    case '7️⃣':
                        if(!staff) return message.drake("errors:PERMISSION", {
                            emoji: "error",
                            perm: "``BOT MODERATOR``"
                        });
                        msg = await displayCatCommands("Owner");
                        afterHelp();
                        break;
                    case '👾':
                        msg = await displayCatCommands("Custom");
                        afterHelp();
                        break;
                    default:
                        return;
                }
            }

            async function cancel() {
                msg.delete();
                message.delete();
            };

            const ctv = await start(true);
            await switchCTV(ctv);
            
        };

        if(args[0]) {

            if(args[0] == "long") return long();

            const cmdName = args[0].toLowerCase();
            const cmd = client.cmds.get(cmdName) || client.cmds.get(client.aliases.get(cmdName));

            if(!cmd ) return message.drake("general/help:CMD_NOT_FOUND", {
                cmd: cmdName,
                emoji: "error"
            });

            const usage = message.drakeWS(cmd.help.category.toLowerCase() + "/" + cmd.help.name + ":USAGE") !== "USAGE" ? data.guild.prefix + message.drakeWS(cmd.help.category.toLowerCase() + "/" + cmd.help.name + ":USAGE") : "`No usage provided`";
            const example = message.drakeWS(cmd.help.category.toLowerCase() + "/" + cmd.help.name + ":EXAMPLE") !== "EXAMPLE" ? data.guild.prefix + message.drakeWS(cmd.help.category.toLowerCase() + "/" + cmd.help.name + ":EXAMPLE") : "`No example provided`";
            const description = message.drakeWS(cmd.help.category.toLowerCase() + "/" + cmd.help.name + ":DESCRIPTION") !== "DESCRIPTION" ? message.drakeWS(cmd.help.category.toLowerCase() + "/" + cmd.help.name + ":DESCRIPTION") : "`No description provided`";
            const aliases = cmd.help.aliases != "" ? (cmd.help.aliases.lenght === 1 ? "``" + cmd.help.aliases[0] + "``" : cmd.help.aliases.map(a => "`" + a + "`").join(", ")) : message.drakeWS("common:ANY");
            let perms = cmd.settings.userPerms != "" ? (cmd.settings.userPerms.lenght === 1 ? "``" + cmd.settings.userPerms[0] : cmd.settings.userPerms.map(a => "`" + a + "`").join(", ")) : message.drakeWS("common:ANY(E)");
            
            if(cmd.settings.restriction && cmd.settings.restriction.includes("MODERATOR")) perms = "``BOT MODERATOR``";
            if(cmd.settings.restriction && cmd.settings.restriction.includes("OWNER")) perms = "``BOT OWNER``";

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

            message.channel.send(embed);
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
        
            return message.channel.send(embed)
        }
    };
};

module.exports = Help;