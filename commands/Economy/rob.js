const Command = require("../../structure/Commands");
const { MessageEmbed } = require("discord.js");

class Rob extends Command {

    constructor(client) {
        super(client, {
            name: "rob",
            aliases: [ "robery" ],
            dirname: __dirname,
            enabled: false,
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
        if(isInCooldown && isInCooldown > Date.now()) return message.drake("economy/rob:COOLDOWN", {
            time: message.time.convertMS(isInCooldown - Date.now()),
            emoji: "error"
        });

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
        let robEmplacement = "money";

        if(memberData.banksold === 0 && memberData.money === 0) return message.drake("economy/rob:NOT_MONEY", {
            emoji: "error",
            username: member.user.username,
            symbol: data.guild.symbol
        });

        if(number < 120 || number > 130) {
            toWait = Date.now() + 3600000;
            message.drake("economy/rob:JAIL", {
                time: message.time.convertMS(toWait - Date.now()),
                emoji: "jail"
            });
            data.member.cooldowns.rob = toWait;
            await data.member.save(data.member);
            return;
        };

        if(memberData.money < number && memberData.money !== 0) {
            number = memberData.money;
            numberStr = number.toString();
        };

        if(memberData.money === 0) {
            robEmplacement = "bank";
            const anotherNumber = this.client.functions.getRandomInt(50, 70);
            number = anotherNumber;
            numberStr = anotherNumber.toString();
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
        robEmplacement === "money" ? memberData.money -= number : memberData.banksold -= number;
        await data.member.save(data.member);
        await memberData.save(memberData);
    };
};

module.exports = Rob;