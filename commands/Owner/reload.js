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

                console.log(chalk.green(`Languages: ${chalk.bold("reloaded")}`));
                return message.channel.send({
                    content: `${client.emotes.succes} **Languages reloaded !**`
                });
            };
            
            if(args[0] === "commands") {
                client.cmds.forEach(async (cmd) => {
                    await client.unloadCommand(cmd.settings.location, cmd.help.name);
                    await client.loadCommand(cmd.settings.location, cmd.help.name);
                });

                return message.channel.send({
                    content: `${client.emotes.succes} **All commands reloaded !**`
                });
            };

            const cmd = client.cmds.get(args[0]) || client.cmds.get(client.aliases.get(args[0]));
            if(!cmd) return message.channel.send({
                content: `${client.emotes.error} **La commande __${args[0]}__ n'existe pas !**`
            });
            
            await client.unloadCommand(cmd.settings.location, cmd.help.name);
            await client.loadCommand(cmd.settings.location, cmd.help.name);
    
            return message.channel.send({
                content: `${client.emotes.succes} **Command __${cmd.help.name}__ reloaded !**`
            });

        } else {

            await message.channel.send({
                content: `${client.emotes.succes} **Bot reload !**` 
            });

            client.emit("reconnecting");

            const { exec } = require("child_process");

            await exec("pm2 restart DrakeBot");
        };
    };
};

module.exports = Reload;