const Command = require("../../structure/Commands");
const { MessageEmbed, WebhookClient } = require("discord.js");

class Feedback extends Command {

    constructor(client) {
        super(client, {
            name: "feedback",
            aliases: [],
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
            emoji: "error",
            usage: data.guild.prefix + "feedback <comments>"
        })
    
        const embed = new MessageEmbed()
        .setTitle("<:feedback:766792063013617705> **FeedBack**")
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
        .setFooter(this.client.cfg.footer)
        .setColor(this.client.cfg.color.yellow)
        .setDescription(args.join(" "))
        .setTimestamp()
    
        this.client.channels.cache.get('766782480882860064').send(embed);
    
        return message.drake("general/feedback:SUCCES", {
            emoji: "succes"
        });
    };
};

module.exports = Feedback;