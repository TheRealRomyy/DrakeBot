const Command = require("../../structure/Commands.js");
const fs = require("fs");
const util = require("util");

const readdir = util.promisify(fs.readdir);

class Reload extends Command {

    constructor(client) {
        super(client, {
            name: "reload",
            aliases: [ "r", "rl" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "SEND_MESSAGES" ],
            userPerms: [],
            cooldown: 1,
            restriction: [ "OWNER" ]
        });
    };

    async run(message, args, data) {

        let client = this.client;

        if(args[0]) {

            switch(args[0]) {
                case "languages":
                    const languages = require("../../helpers/lang");
                    client.translations = await languages();
    
                    client.logger.log("Languages: reloaded");
                    const languageMessage = await message.channel.send({
                        content: `${client.emotes.succes} **Languages reloaded !**`
                    });
    
                    setTimeout(() => {
                        message.delete().catch(() => {});
                        languageMessage.delete().catch(() => {});
                    }, 3000);
                    break;
                case "commands":
                    client.cmds.forEach(async (cmd) => {
                        await client.unloadCommand(cmd.settings.location, cmd.help.name);
                        await client.loadCommand(cmd.settings.location, cmd.help.name);
                    });
    
                    const commandsMessage = await message.channel.send({
                        content: `${client.emotes.succes} **All commands reloaded !**`
                    });
    
                    setTimeout(() => {
                        message.delete().catch(() => {});
                        commandsMessage.delete().catch(() => {});
                    }, 3000);
                    break;
                case "events":
                    for (const [eventName, eventFunction] of Object.entries(client._events)) {
                        client.off(eventName, eventFunction);
                    };
                      
                    const evtFiles = await readdir("./events/");
                    evtFiles.forEach((file) => {
                        const eventName = file.split(".")[0];
                        const event = new (require(`../../events/${file}`))(client);
                        client.logger.log(`Event '${eventName}' successfully loaded`);
                        client.on(eventName, (...args) => event.run(...args));
                        delete require.cache[require.resolve(`../../events/${file}`)];
                    }); 
    
                    const eventMessages = await message.channel.send({
                        content: `${client.emotes.succes} **All events reloaded !**`
                    });
    
                    setTimeout(() => {
                        message.delete().catch(() => {});
                        eventMessages.delete().catch(() => {});
                    }, 3000);
                    break;
                default:
                    const cmd = client.cmds.get(args[0]) || client.cmds.get(client.aliases.get(args[0]));
                    const event = Boolean(Object.keys(client._events).includes(args[0]));

                    if(!cmd && !event) return message.channel.send({
                        content: `${client.emotes.error} **La commande ou l'event __${args[0]}__ n'existe pas !**`
                    });

                    if(cmd) {
                        await client.unloadCommand(cmd.settings.location, cmd.help.name);
                        await client.loadCommand(cmd.settings.location, cmd.help.name);
                    } else {
                        const event = new (require(`../../events/${args[0]}.js`))(client);

                        client.off(args[0], client._events[args[0]]);
                        client.on(args[0], (...args) => event.run(...args));

                        client.logger.log(`Event '${args[0]}' successfully loaded`);
                    }
                    
                    const specificReloadMessage = await message.channel.send({
                        content: `${client.emotes.succes} **${cmd ? "Command" : "Event"} __${cmd ? cmd.help.name : args[0]}__ successfuly reloaded !**`
                    });
        
                    setTimeout(() => {
                        message.delete().catch(() => {});
                        specificReloadMessage.delete().catch(() => {});
                    }, 3000);
                    break;
            }

        } else {

            const reload = await message.channel.send({
                content: `${client.emotes.succes} **Bot reload !**` 
            });

            setTimeout(async () => {
                message.delete().catch(() => {});
                reload.delete().catch(() => {});

                const { exec } = require("child_process");
    
                await exec("pm2 restart DrakeBot");
            }, 500);
        };
    };
};

module.exports = Reload;