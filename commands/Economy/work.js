const Command = require("../../structure/Commands");
const { MessageEmbed } = require("discord.js");

class Work extends Command {

    constructor(client) {
        super(client, {
            name: "work",
            aliases: [],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "SEND_MESSAGES", "EMBED_LINKS" ],
            userPerms: [],
            cooldown: 0,
            restriction: []
        });
    };

    async run(message, args, data) {

        const isInCooldown = data.member.cooldowns.work;
        if(isInCooldown){
            if(isInCooldown > Date.now()) return message.drake("economy/work:COOLDOWN", {
                    time: message.time.convertMS(isInCooldown - Date.now()),
                    emoji: "error"
            });
        }

        const number = this.client.functions.getRandomInt(20, 30);

        const workMsg = message.drakeWS("economy/work:" + number, {
            symbol: data.guild.symbol
        });

        const embed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic:true }))
        .setColor(this.client.cfg.color.purple)
        .setFooter(this.client.cfg.footer)
        .setDescription(workMsg);

        message.channel.send(embed);

        const toWait = Date.now() + 600000;
        data.member.cooldowns.work = toWait;
        data.member.money += number;
        return await data.member.save();
    };
};

module.exports = Work;