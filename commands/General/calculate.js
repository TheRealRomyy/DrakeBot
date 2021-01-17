const Command = require("../../structure/Commands");

const math = require("mathjs");
const { MessageEmbed } = require("discord.js");

class Calculate extends Command {

    constructor(client) {
        super(client, {
            name: "calculate",
            aliases: [ "calc" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "EMBED_LINKS", "SEND_MESSAGES" ],
            userPerms: [],
            cooldown: 3,
            restriction: [],
        });
    };

    async run(message, args, data) {

        if(!args[0]) return message.drake("errors:NOT_CORRECT", {
            usage: data.guild.prefix + "calc <calcul>",
            emoji: "error"
        });
    
        let result;
        try {
            result = math.evaluate(args.join(" ").replace(/[x]/gi, "*").replace(/[,]/g, ".").replace(/[÷]/gi, "/"));
        } catch (e) {
            return message.drake("errors:NOT_CORRECT", {
                usage: data.guild.prefix + "calc <calcul>",
                emoji: "error"
            });
        };
    
        const embed = new MessageEmbed()
        .setColor("RANDOM")
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
        .addField(message.drakeWS("general/calculate:CALCUL", {
            emoji: "calcul"
        }), `\`\`\`\n${args.join("")}\`\`\``)
        .addField(message.drakeWS("general/calculate:RESULT", {
            emoji: "result"
        }), `\`\`\`\n${result}\`\`\``)
            
        message.channel.send(embed);    
    };
};

module.exports = Calculate;