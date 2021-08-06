const Command = require("../../structure/Commands");

class Pay extends Command {

    constructor(client) {
        super(client, {
            name: "pay",
            aliases: [],
            dirname: __dirname,
            enabled: false,
            botPerms: [ "SEND_MESSAGES", "EMBED_LINKS" ],
            userPerms: [],
            cooldown: 3,
            restriction: []
        });
    };

    async run(message, args, data) {

        if(!args[0] || !args[1] || isNaN(args[1]) || (parseInt(args[1]) < 0)) return message.drake("errors:NOT_CORRECT", {
            emoji: "error",
            usage: data.guild.prefix + "pay <user> <amount>"
        });

        const member = message.mentions.members.first() || message.guild.member(args[0]);
        const amount = parseInt(args[1]);

        if(member.user.bot) return message.drake("economy/pay:BOT", {
            emoji: "error",
            bot: member.user.username
        });

        if(member.id === message.author.id) return message.drake("economy/pay:YOURSELF", {
            emoji: "error"
        });

        if(amount > data.member.money) return message.drake("economy/pay:NOT_ENOUGHT_MONEY", {
            emoji: "error"
        });

        const memberData = await this.client.db.findOrCreateMember(member, message.guild);

        data.member.money -= amount;
        await data.member.save(data.member);

        memberData.money += amount;
        await memberData.save(memberData);

        return message.drake("economy/pay:SUCCES", {
            username: member.user.username,
            amount,
            symbol: data.guild.symbol,
            emoji: "succes"
        });

    };
};

module.exports = Pay;