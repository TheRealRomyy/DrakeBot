const Command = require("../../structure/Commands.js");
const chalk = require("chalk");
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

            if(args[0] === "languages") {
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

            } else if(args[0] === "commands") {
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

            } else {
                const cmd = client.cmds.get(args[0]) || client.cmds.get(client.aliases.get(args[0]));
                if(!cmd) return message.channel.send({
                    content: `${client.emotes.error} **La commande __${args[0]}__ n'existe pas !**`
                });
                
                await client.unloadCommand(cmd.settings.location, cmd.help.name);
                await client.loadCommand(cmd.settings.location, cmd.help.name);
        
                const commandMessage = await message.channel.send({
                    content: `${client.emotes.succes} **Command __${cmd.help.name}__ reloaded !**`
                });
    
                setTimeout(() => {
                    message.delete().catch(() => {});
                    commandMessage.delete().catch(() => {});
                }, 3000);
            };

        } else {

            const reload = await message.channel.send({
                content: `${client.emotes.succes} **Bot reload !**` 
            });

            setTimeout(async () => {
                message.delete().catch(() => {});
                reload.delete().catch(() => {});

                client.emit("reconnecting");

                const { exec } = require("child_process");
    
                await exec("pm2 restart DrakeBot");
            }, 500);
        };
    };
};

module.exports = Reload;