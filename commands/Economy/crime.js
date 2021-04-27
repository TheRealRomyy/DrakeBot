const Command = require("../../structure/Commands");
const { MessageEmbed } = require("discord.js");

class Crime extends Command {

    constructor(client) {
        super(client, {
            name: "crime",
            aliases: [ "crim" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "SEND_MESSAGES", "EMBED_LINKS" ],
            userPerms: [],
            cooldown: 0,
            restriction: []
        });
    };

    async run(message, args, data) {

        let toWait = 0;

        const isInCooldown = data.member.cooldowns.crime;
        if(isInCooldown && isInCooldown > Date.now()) return message.drake("economy/crime:COOLDOWN", {
            time: message.time.convertMS(isInCooldown - Date.now()),
            emoji: "error"
        });

        const number = this.client.functions.getRandomInt(100, 130);

        if(number < 120 || number > 130) {
            toWait = Date.now() + 3600000;
            message.drake("economy/crime:JAIL", {
                time: message.time.convertMS(toWait - Date.now())
            });
            data.member.cooldowns.crime = toWait;
            await data.member.save();
            return;
        }

        const crimeMsg = message.drakeWS("economy/crime:" + number, {
            symbol: data.guild.symbol
        });

        const embed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic:true }))
        .setColor(this.client.cfg.color.red)
        .setFooter(this.client.cfg.footer)
        .setDescription(crimeMsg);

        await message.channel.send(embed);

        toWait = Date.now() + 1200000;
        data.member.cooldowns.crime = toWait;
        data.member.money += number;
        await data.member.save();
    };
};

module.exports = Crime;