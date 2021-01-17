const Command = require("../../structure/Commands");
const { MessageEmbed } = require("discord.js");

class Rob extends Command {

    constructor(client) {
        super(client, {
            name: "rob",
            aliases: [ "robery" ],
            dirname: __dirname,
            enabled: true,
            botPerms: [ "SEND_MESSAGES", "EMBED_LINKS" ],
            userPerms: [],
            cooldown: 0,
            restriction: []
        });
    };

    async run(message, args, data) {

        const member = message.mentions.members.first() || message.guild.member(args[0]);

        if(!member) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "rob <member>"
        });

        let toWait = 0;

        const isInCooldown = data.member.cooldowns.rob;
        if(isInCooldown){
            if(isInCooldown > Date.now()) return message.drake("economy/rob:COOLDOWN", {
                    time: message.time.convertMS(isInCooldown - Date.now()),
                    emoji: "error"
            });
        };

        if(member.user.bot) return message.drake("economy/rob:BOT", {
            emoji: "error",
            bot: member.user.username
        });

        if(member.id === message.author.id) return message.drake("economy/rob:YOURSELF", {
            emoji: "error"
        });

        let number = this.client.functions.getRandomInt(100, 140);
        let numberStr = number.toString();

        const memberData = await this.client.db.findOrCreateMember(member, message.guild);

        if(!memberData.money || memberData.money === 0) return message.drake("economy/rob:NOT_MONEY", {
            emoji: "error",
            username: member.user.username,
            symbol: data.guild.symbol
        });

        if(number < 120 || number > 130) {
            toWait = Date.now() + 3600000;
            message.drake("economy/rob:JAIL", {
                time: message.time.convertMS(toWait - Date.now())
            });
            data.member.cooldowns.rob = toWait;
            return await data.member.save();
        }

        if(memberData.money < number) {
            number = memberData.money;
            numberStr = number.toString();
        };

        const robMsg = message.drakeWS("economy/rob:ROB", {
            symbol: data.guild.symbol,
            amount: numberStr,
            username: member.user.username
        });

        const embed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic:true }))
        .setColor(this.client.cfg.color.green)
        .setFooter(this.client.cfg.footer)
        .setDescription(robMsg);

        message.channel.send(embed);

        toWait = Date.now() + 120000;
        data.member.cooldowns.rob = toWait;
        data.member.money += number;
        memberData.money -= number;
        await data.member.save();
        await memberData.save();
    };
};

module.exports = Rob;