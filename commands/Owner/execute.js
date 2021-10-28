const Command = require("../../structure/Commands");
const { exec } = require("child_process");
const { Formatters } = require("discord.js");

class Execute extends Command {
    constructor(client) {
        super(client,{
            name: "execute",
            aliases: [ "exec" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "SEND_MESSAGES" ],
            userPerms: [],
            cooldown: 3,
            restriction: [ "OWNER" ]
        });
    };

    async run(message, args, data) {

        const content = args.join(" ");
        let msg = null;

        let client = this.client;

        if(!content) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "exec <content>"
        });

        if(message.content.includes("speedtest")) msg = await message.channel.send({
            content: this.client.emotes["waiting"]
        });

	    await exec(content, async (error, data, getter) => {

            if(!data) return message.channel.send({
                content: Formatters.codeBlock("js", "> No result !")
            });

            if(error) return message.channel.send({
                content: Formatters.codeBlock("js", error)
            });

            if(getter.length >= 2000 || data.length >= 2000) return await message.channel.send({
                content: client.emotes["info"] + " **Le résultat a afficher est trop grand ! Je l'ai donc upload a l'adresse suivante:** \n \n" + await client.functions.hastebin(data.length >= 2000 ? data : getter)
            });
            
            if(getter) return message.channel.send({
                content: Formatters.codeBlock("js", getter)
            }).then(m => msg.delete().catch(() => {}));

            message.channel.send({
                content: Formatters.codeBlock("js", data)
            }).then(m => {
               if(msg) msg.delete().catch(() => {}); 
            });
        });
    };
};

module.exports = Execute;