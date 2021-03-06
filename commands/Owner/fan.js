const Command = require("../../structure/Commands.js");
const { exec } = require("child_process");

class Fan extends Command {

    constructor(client) {
        super(client, {
            name: "fan",
            aliases: [],
            dirname: __dirname,
            enabled: true,
            botPerms: [],
            userPerms: [],
            cooldown: 1,
            restriction: []
        });
    };

    async run(message, args, data) {

        if(message.author.id !== "751779180701548595" && message.author.id !== "709481084286533773") return;

        if(!args[0]) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "fan <start/restart/stop>"
        });

        let action = args[0];

        if(action !== "start" && action !== "restart" && action !== "stop") return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "fan <start/restart/stop>"
        });

        exec("cd /home/fan/data/Hisoka && pm2 " + action + " Hisoka", (error, data, getter) => {

            if(!data) return message.channel.send('>', {
                code: "none"
            });

            if(data.length >= 2000) return message.channel.send('> Must be 2000 or fewer in length.', {
                code: "none"
            });

            if(error) return message.channel.send(error, {
                code: "none"
            });
            
            if(getter) return message.channel.send(getter, {
                code: "none"
            });

            message.channel.send(data, {
                    code: "none"
            });
        });
    };
}; 

module.exports = Fan;