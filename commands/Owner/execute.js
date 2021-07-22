const Command = require("../../structure/Commands");
const { exec } = require("child_process");

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

        if(message.content.includes("speedtest")) msg = await message.channel.send(this.client.emotes["waiting"]);
        if(message.content.includes("reboot") || message.content.includes("pm2 stop all") || message.content.includes("pm2 stop DrakeBot")) this.client.emit("disconnect");

	    await exec(content, async (error, data, getter) => {

            if(!data) return message.channel.send("> No result !", {
                code: "none"
            });

            if(error) return message.channel.send(error, {
                code: "none"
            });

            if(getter.length >= 2000 || data.length >= 2000) return await message.channel.send(client.emotes["info"] + " **Le résultat a afficher est trop grand ! Je l'ai donc upload a l'adresse suivante:** \n \n" + await client.functions.hastebin(data.length >= 2000 ? data : getter));
            
            if(getter) return message.channel.send(getter, {
                code: "none"
            }).then(m => msg.delete().catch(() => {}));

            message.channel.send(data, {
                code: "none"
            }).then(m => {
               if(msg) msg.delete(); 
            });
        });
    };
};

module.exports = Execute;