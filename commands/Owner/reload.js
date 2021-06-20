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

        await message.delete().catch(() => {});

        if(args[0]) {

            if(args[0] === "languages") {
                const languages = require("../../helpers/lang");
                client.translations = await languages();

                console.log(chalk.green(`Languages: ${chalk.bold("reloaded")}`));
                return message.channel.send(client.emotes.succes + " **Languages reloaded !**").then(m => m.delete({
                    timeout: 3000
                }).catch(() => {}));
            };
            
            if(args[0] === "commands") {
                client.cmds.forEach(async (cmd) => {
                    await client.unloadCommand(cmd.settings.location, cmd.help.name);
                    await client.loadCommand(cmd.settings.location, cmd.help.name);
                });

                return message.channel.send(client.emotes.succes + " **All commands reloaded !**").then(m => m.delete({
                    timeout: 3000
                }).catch(() => {}));
            };

            const cmd = client.cmds.get(args[0]) || client.cmds.get(client.aliases.get(args[0]));
            if(!cmd) return message.channel.send(client.emotes.error + " **La commande __" + args[0] + "__ n'existe pas !**").then(m => m.delete({
                timeout: 3000
            }).catch(() => {}));
            
            await client.unloadCommand(cmd.settings.location, cmd.help.name);
            await client.loadCommand(cmd.settings.location, cmd.help.name);
    
            return message.channel.send(client.emotes.succes + " **Command __" + cmd.help.name + "__ reloaded !**").then(m => m.delete({
                timeout: 3000
            }).catch(() => {}));

        } else {

            await this.client.channels.cache.get("793262294493560893").send("<:dnd:750782449168023612> Bot disconnect.");

            await message.channel.send(client.emotes.succes + " **Bot reload !**").then(m => m.delete({
                timeout: 200
            }).catch(() => {}));

            await this.client.channels.cache.get("793262294493560893").send("<:idle:750782527626543136> Bot is reconnecting...");

            const { exec } = require("child_process");

            await exec("pm2 restart DrakeBot");
        };
    };
};

module.exports = Reload;