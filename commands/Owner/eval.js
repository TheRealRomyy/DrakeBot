const Command = require("../../structure/Commands");
const { Formatters } = require("discord.js");

class Eval extends Command {
    constructor (client) {
        super(client, {
            name: "eval",
            aliases: [ "evaluate" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "SEND_MESSAGES" ],
            userPerms: [],
            cooldown: 0,
            restriction: [ "OWNER" ],
        });
    };
    async run (message, args, data) {
        const content = args.join(" ");
        const pool = this.client.pool;
        if(!content) return message.drake("errors:NOT_CORRECT", {
            usage: data.guild.prefix + "eval <content>",
            emoji: "error"
        });
        if(message.content.includes("token") && message.author.id === "709481084286533773") return message.reply(this.client.emotes.error + " **Nan ! Ca commence mal enculé !**");
        const result = new Promise((resolve, reject) => resolve(eval(content)));
        return result.then((output) => {
        if(typeof output !== "string") output = require("util").inspect(output, { depth: 0 });
       
        
        message.channel.send({
            content: Formatters.codeBlock("js", output)
        })}).catch((err) => {
            err = err.toString();
            message.channel.send({
                content: Formatters.codeBlock("js", err)
            });
        });
    };
};
module.exports = Eval;